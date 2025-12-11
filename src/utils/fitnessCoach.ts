import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';
import coachSentinelPrompt from '@/prompts/coach-sentinel.md?raw';
import { storageUtils } from '@/utils/storage';
import { StateObserver, IObserver } from '@/utils/observer';
import { ObserverTask } from '@/types';
import type { ChatMessage } from '@/types';
const HISTORY_CAP = 10;
const OBSERVER_RECENT = 8;
// TODO: Observer triggers only when nextRounds >= threshold AND divisible by cadence (if 4 and 3 -> trigger on 6)
const OBSERVER_START_THRESHOLD = 2;
const OBSERVER_CADENCE = 2;

const OBSERVER_CONFIG: Record<ObserverTask, { start_after_rounds: number; cadence: number; recent_window: number }> = {
  [ObserverTask.GatherUserProfile]: { start_after_rounds: 2, cadence: 2, recent_window: 10 },
  [ObserverTask.ExploreGoals]: { start_after_rounds: 3, cadence: 2, recent_window: 10 },
  [ObserverTask.FreeCoaching]: { start_after_rounds: 4, cadence: 3, recent_window: 20 },
  [ObserverTask.CoachOnTraining]: { start_after_rounds: 4, cadence: 3, recent_window: 20 },
};
export class FitnessCoachChain {
  private llm: ChatOpenAI | ChatGoogleGenerativeAI;
  private chatHistory: ChatMessage[] = [];
  private observer: IObserver | null = null;
  private provider: 'openai' | 'google';
  private openaiKey: string | null = null;
  private googleKey: string | null = null;
  private openaiModels = ['gpt-5.1-chat-latest'];
  private googleModels = ['gemini-2.5-flash'];
  private lastAgenda: string[] = [];
  private lastFocusBrief: string = '';

  constructor(googleApiKey: string) {
    this.provider = storageUtils.getCoachProvider();
    this.googleKey = googleApiKey || storageUtils.getGoogleApiToken();
    this.openaiKey = storageUtils.getOpenAIApiToken();
    this.llm = this.provider === 'openai'
      ? new ChatOpenAI({
          apiKey: this.openaiKey || '',
          model: this.openaiModels[0],
          maxRetries: 0,
        })
      : new ChatGoogleGenerativeAI({
          apiKey: this.googleKey || '',
          model: this.googleModels[0],
          temperature: 0.7,
          maxRetries: 0,
        });
    this.observer = null;
  }

  async sendMessage(): Promise<string[]> {
    try {
      
      
      const rounds = storageUtils.getObserverRounds();
      const enabled = storageUtils.getObserverEnabled();
      const nextRounds = rounds + 1;
      storageUtils.setObserverRounds(nextRounds);

      console.log('Observer state', { enabled, rounds, nextRounds });
      const currentTask = storageUtils.getObserverTaskOptional();
      const taskToRun = currentTask || ObserverTask.GatherUserProfile;
      const cfg = OBSERVER_CONFIG[taskToRun];
      const shouldTrigger = enabled && nextRounds >= cfg.start_after_rounds && nextRounds % cfg.cadence === 0;
      if (shouldTrigger) {
        const profileMemory = storageUtils.getProfileMemory();
        const goalsMemory = storageUtils.getGoalsMemory();
        const recent = this.chatHistory.slice(-cfg.recent_window);
        storageUtils.setObserverTask(taskToRun);
        const observer = new StateObserver(this.googleKey || '', taskToRun);
        const result = await observer.run({ profileMemory, goalsMemory, recentMessages: recent });
        console.log('Observer full result', {
          active_task: result.active_task,
          profile_memory: result.profile_memory,
          goals_memory: result.goals_memory,
          agenda: result.agenda,
          brief: result.brief,
          profile_checklist: result.profile_checklist,
        });
        const activeTask = result.active_task || ObserverTask.GatherUserProfile;
        this.lastAgenda = Array.isArray(result.agenda) ? result.agenda : [];
        this.lastFocusBrief = result.brief || '';
        storageUtils.setObserverTask(activeTask);
        if (typeof result.profile_memory === 'string') {
          storageUtils.setProfileMemory(result.profile_memory);
        }
        if (typeof result.goals_memory === 'string') {
          storageUtils.setGoalsMemory(result.goals_memory);
        }
      }

      const systemPrompt = await this.buildContext();
      const history = this.chatHistory.slice(-HISTORY_CAP);
      const lcMessages = [
        new SystemMessage(systemPrompt),
        ...history.map((msg) =>
          msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        ),
      ];

      const result = await this.invokeWithRetry(lcMessages) as { bubbles?: unknown };
      const arr = Array.isArray(result?.bubbles)
        ? (result.bubbles as unknown[])
            .filter((n: unknown) => typeof n === 'string' && String(n).trim())
            .slice(0, 3) as string[]
        : [];
      if (!arr.length) throw new Error('Invalid coach response: empty bubbles');
      return arr;
    } catch (error) {
      console.error('Error sending message via LangChain OpenAI:', error);
      throw new Error('Failed to get AI response. Please check your API key and try again.');
    }
  }

  private async invokeWithRetry(messages: Array<SystemMessage | HumanMessage | AIMessage>) {
    console.log('LLM prompts', messages, { total: messages.length });
    const isTransient = (err: unknown) => {
      const src = err as { message?: unknown };
      const msg = String(src?.message ?? err);
      return /\b(503|429|overloaded|temporarily|rate limit)\b/i.test(msg);
    };
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let attempt = 0;
    let modelIndex = 0;
    let lastError: unknown;
    const models = this.provider === 'openai' ? this.openaiModels : this.googleModels;
    while (modelIndex < models.length) {
      for (attempt = 0; attempt < 4; attempt++) {
        try {
          const BubblesSchema = z.object({
            bubbles: z.array(z.string()).min(1).max(3).describe('Coach reply bubbles'),
          });
          if (this.provider === 'google') {
            const structured = (this.llm as ChatGoogleGenerativeAI).withStructuredOutput(BubblesSchema);
            return await structured.invoke(messages);
          } else {
            const structured = (this.llm as ChatOpenAI).withStructuredOutput(BubblesSchema, { name: 'coach_bubbles', strict: true });
            return await structured.invoke(messages);
          }
        } catch (err) {
          lastError = err;
          if (!isTransient(err)) throw err;
          const base = 400;
          const jitter = Math.floor(Math.random() * 250);
          const backoff = Math.min(3000, base * Math.pow(2, attempt)) + jitter;
          await sleep(backoff);
        }
      }
      modelIndex++;
      if (modelIndex < models.length) {
        const nextModel = models[modelIndex];
        this.llm = this.provider === 'openai'
          ? new ChatOpenAI({
              apiKey: this.openaiKey || '',
              model: nextModel,
              maxRetries: 0,
            })
          : new ChatGoogleGenerativeAI({
              apiKey: this.googleKey || '',
              model: nextModel,
              temperature: 0,
              maxRetries: 0,
            });
      }
    }
    throw lastError;
  }

  private async buildContext(): Promise<string> {
    const profile_memory = storageUtils.getProfileMemory() || '';
    const goals_memory = storageUtils.getGoalsMemory() || '';
    const brief = this.lastFocusBrief || '';
    const observerTask = storageUtils.getObserverTask();
    const agendaList = this.lastAgenda.length ? this.lastAgenda.map(n => `- ${n}`).join('\n') : '';
    const timeStr = new Date().toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const tmpl = PromptTemplate.fromTemplate(coachSentinelPrompt);
    const rendered = await tmpl.format({ profile_memory, goals_memory, brief, observer_task: observerTask, agenda: agendaList, time: timeStr });
    return rendered;
  }

  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  setChatHistory(history: ChatMessage[]): void {
    this.chatHistory = history.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  }

  resetChat(): void {
    this.chatHistory = [];
    this.lastAgenda = [];
    this.lastFocusBrief = '';
  }
}
