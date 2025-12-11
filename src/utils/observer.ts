import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import profilingPrompt from '@/prompts/state-observer-profiling.md?raw';
import goalsPrompt from '@/prompts/state-observer-goals.md?raw';
import trainingPrompt from '@/prompts/state-observer-training.md?raw';
import { storageUtils } from '@/utils/storage';
import type { ChatMessage } from '@/types';
import { ObserverTask } from '@/types';

export interface ObserverResult {
  active_task: ObserverTask;
  profile_memory?: string;
  goals_memory?: string;
  agenda?: string[];
  brief?: string;
  profile_checklist?: string[];
}

export interface IObserver {
  id: string;
  name: string;
  run(input: { profileMemory: string; goalsMemory: string; recentMessages: ChatMessage[] }): Promise<ObserverResult>;
}

export class StateObserver implements IObserver {
  id = 'state_observer';
  name = 'StateObserver';
  private llm: ChatGoogleGenerativeAI;
  private apiKey: string;
  private modelCandidates = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  private kind: ObserverTask;

  constructor(apiKey: string, kind: ObserverTask) {
    this.apiKey = apiKey;
    this.kind = kind;
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: this.apiKey,
      model: this.modelCandidates[0],
      temperature: 0.2,
      maxRetries: 0,
    });
    this.id = `state_observer_${this.kind}`;
  }

  async run(input: { profileMemory: string; goalsMemory: string; recentMessages: ChatMessage[] }): Promise<ObserverResult> {
    const transcript = input.recentMessages.map(m => {
      const r = m.role === 'user' ? 'User' : 'Coach';
      return r + ': ' + m.content;
    }).join('\n');

    const basePrompt = this.kind === ObserverTask.GatherUserProfile
      ? profilingPrompt
      : this.kind === ObserverTask.ExploreGoals
        ? goalsPrompt
        : trainingPrompt;
    const activeStateHeader = `ACTIVE_STATE: ${this.kind}`;
    const sys = new SystemMessage(basePrompt + '\n\n' + activeStateHeader);
    const humanText = [
      'PROFILE_MEMORY:',
      input.profileMemory || '',
      '',
      'GOALS_MEMORY:',
      input.goalsMemory || '',
      '',
      'RECENT CONVERSATION:',
      transcript,
    ].join('\n');
    const messages = [sys, new HumanMessage(humanText)];

    const aiMsg = await this.invokeWithRetry(messages);
    const text = typeof aiMsg.content === 'string'
      ? aiMsg.content
      : Array.isArray(aiMsg.content)
        ? (aiMsg.content as unknown[]).map((c) => {
            if (typeof c === 'string') return c;
            const maybeText = (c as { text?: unknown })?.text;
            return typeof maybeText === 'string' ? maybeText : '';
          }).join('')
        : '';

    const parsed = this.parseObserverJson(text);
    if (parsed) {
      return parsed;
    }
    const storedTask = storageUtils.getObserverTaskOptional();
    const active_task = !storedTask ? ObserverTask.GatherUserProfile : storedTask;
    return { active_task, agenda: [], brief: '' };
  }

  private parseObserverJson(text: string): ObserverResult | null {
    const cleaned = text.replace(/```json[\s\S]*?```/g, (m) => m.replace(/```json|```/g, '')).trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      const obj = JSON.parse(cleaned.slice(start, end + 1));
      let active_task: ObserverTask | null = null;
      if (typeof obj.active_task === 'string') {
        const v = String(obj.active_task).toLowerCase();
        if (v === ObserverTask.GatherUserProfile || v === ObserverTask.ExploreGoals || v === ObserverTask.CoachOnTraining || v === ObserverTask.FreeCoaching) {
          active_task = v as ObserverTask;
        }
      }
      if (!active_task) return null;
      const profile_memory = typeof obj.profile_memory === 'string' ? obj.profile_memory : undefined;
      const goals_memory = typeof obj.goals_memory === 'string' ? obj.goals_memory : undefined;
      const agenda: string[] = Array.isArray(obj.agenda)
        ? obj.agenda.filter((n: unknown) => typeof n === 'string' && n.trim()).slice(0, 5) as string[]
        : [];
      const brief = typeof obj.brief === 'string' ? obj.brief : '';
      const profile_checklist: string[] = Array.isArray(obj.profile_checklist)
        ? obj.profile_checklist.filter((n: unknown) => typeof n === 'string' && n.trim()).slice(0, 5) as string[]
        : [];
      return { active_task, profile_memory, goals_memory, agenda, brief, profile_checklist };
    } catch {
      return null;
    }
  }


  private async invokeWithRetry(messages: Array<SystemMessage | HumanMessage | AIMessage>) {
    console.log('LLM prompts', messages);
    const isTransient = (err: unknown) => {
      const src = err as { message?: unknown };
      const msg = String(src?.message ?? err);
      return /\b(503|429|overloaded|temporarily|rate limit)\b/i.test(msg);
    };
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let attempt = 0;
    let modelIndex = 0;
    let lastError: unknown;
    while (modelIndex < this.modelCandidates.length) {
      for (attempt = 0; attempt < 3; attempt++) {
        try {
          return await this.llm.invoke(messages);
        } catch (err) {
          lastError = err;
          if (!isTransient(err)) throw err;
          const base = 300;
          const jitter = Math.floor(Math.random() * 200);
          const backoff = Math.min(2500, base * Math.pow(2, attempt)) + jitter;
          await sleep(backoff);
        }
      }
      modelIndex++;
      if (modelIndex < this.modelCandidates.length) {
        const nextModel = this.modelCandidates[modelIndex];
        this.llm = new ChatGoogleGenerativeAI({
          apiKey: this.apiKey,
          model: nextModel,
          temperature: 0.2,
          maxRetries: 0,
        });
      }
    }
    throw lastError;
  }
}
