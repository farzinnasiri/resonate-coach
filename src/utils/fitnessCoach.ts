import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import coachSentinelPrompt from '@/prompts/coach-sentinel.md?raw';
import { storageUtils } from '@/utils/storage';
import { StateObserver, IObserver } from '@/utils/observer';
import { ObserverTask } from '@/types';
import type { ChatMessage } from '@/types';
const HISTORY_CAP = 10;
const OBSERVER_RECENT = 8;
// TODO: Observer triggers only when nextRounds >= threshold AND divisible by cadence (if 4 and 3 -> trigger on 6)
const OBSERVER_START_THRESHOLD = 3;
const OBSERVER_CADENCE = 3;

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

  async sendMessage(): Promise<string> {
    try {
      
      
      const rounds = storageUtils.getObserverRounds();
      const enabled = storageUtils.getObserverEnabled();
      const nextRounds = rounds + 1;
      storageUtils.setObserverRounds(nextRounds);

      console.log('Observer state', { enabled, rounds, nextRounds });
      if (enabled && nextRounds >= OBSERVER_START_THRESHOLD && nextRounds % OBSERVER_CADENCE === 0) {
        const memory = storageUtils.getCoachMemory();
        const recent = this.chatHistory.slice(-OBSERVER_RECENT);
        console.log('Observer running', { memoryLen: memory.length, recentLen: recent.length });
        const currentTask = storageUtils.getObserverTaskOptional();
        const taskToRun = !currentTask || !memory ? ObserverTask.GatherUserProfile : currentTask;
        storageUtils.setObserverTask(taskToRun);
        const observer = new StateObserver(this.googleKey || '', taskToRun);
        const result = await observer.run({ memory, recentMessages: recent });
        console.log('Observer full result', {
          active_task: result.active_task,
          updated_memory: result.updated_memory,
          agenda: result.agenda,
          brief: result.brief,
        });
        const activeTask = result.active_task || ObserverTask.GatherUserProfile;
        const updatedMemory = result.updated_memory || memory;
        this.lastAgenda = Array.isArray(result.agenda) ? result.agenda : [];
        this.lastFocusBrief = result.brief || '';
        storageUtils.setObserverTask(activeTask);
        storageUtils.setCoachMemory(updatedMemory);
        console.log('Observer result', { activeTask, updatedMemoryLen: updatedMemory.length, agendaLen: this.lastAgenda.length, briefLen: this.lastFocusBrief.length });
      }

      const systemPrompt = await this.buildContext();
      const history = this.chatHistory.slice(-HISTORY_CAP);
      const lcMessages = [
        new SystemMessage(systemPrompt),
        ...history.map((msg) =>
          msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        ),
      ];

      const aiMsg = await this.invokeWithRetry(lcMessages);
      const text = typeof aiMsg.content === 'string'
        ? aiMsg.content
        : Array.isArray(aiMsg.content)
          ? (aiMsg.content as unknown[]).map((c) => {
              if (typeof c === 'string') return c;
              const maybeText = (c as { text?: unknown })?.text;
              return typeof maybeText === 'string' ? maybeText : '';
            }).join('')
          : '';

      

      return text;
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
          return await this.llm.invoke(messages);
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
              temperature: 0.7,
              maxRetries: 0,
            });
      }
    }
    throw lastError;
  }

  private async buildContext(): Promise<string> {
    const memory = storageUtils.getCoachMemory() || '';
    const taskModulus = this.lastFocusBrief || '';
    const agendaList = this.lastAgenda.length ? this.lastAgenda.map(n => `- ${n}`).join('\n') : '';
    const timeStr = new Date().toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const tmpl = PromptTemplate.fromTemplate(coachSentinelPrompt);
    const rendered = await tmpl.format({ memory, task_modules: taskModulus, agenda: agendaList, time: timeStr });
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
}
