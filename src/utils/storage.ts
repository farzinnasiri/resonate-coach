import type { ChatMessage } from '@/types/index';
import { ObserverTask } from '@/types';

export const LOCAL_STORAGE_KEYS = {
  API_TOKEN: 'resonate_coach_api_token',
  GOOGLE_API_TOKEN: 'resonate_coach_google_api_token',
  OPENAI_API_TOKEN: 'resonate_coach_openai_api_token',
  COACH_PROVIDER: 'resonate_coach_provider',
  CHAT_HISTORY: 'resonate_coach_messages',
  THEME_PREFERENCE: 'resonate_coach_theme',
  COLOR_PROFILE: 'resonate_coach_color_profile',
  FIRST_VISIT: 'resonate_coach_first_visit',
  COACH_MEMORY: 'resonate_coach_memory',
  PROFILE_MEMORY: 'resonate_profile_memory',
  GOALS_MEMORY: 'resonate_goals_memory',
  OBSERVER_ENABLED: 'resonate_observer_enabled',
  OBSERVER_ROUNDS: 'resonate_observer_rounds',
  OBSERVER_TASK: 'resonate_observer_task',
  USER_NAME: 'resonate_coach_user_name',
} as const;

export const storageUtils = {
  // User Name
  getUserName: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.USER_NAME);
  },

  setUserName: (name: string): void => {
    const trimmed = name.trim();
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_NAME, trimmed);

    const prefix = "The user's name is ";
    const line = `${prefix}${trimmed}`;
    const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.COACH_MEMORY) || '';
    const nextMemory = existing ? `${existing}\n${line}` : line;
    localStorage.setItem(LOCAL_STORAGE_KEYS.COACH_MEMORY, nextMemory);
  },

  removeUserName: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_NAME);
  },

  // API Token
  getApiToken: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.API_TOKEN);
  },
  
  setApiToken: (token: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.API_TOKEN, token);
  },
  
  removeApiToken: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.API_TOKEN);
  },

  // Dual provider tokens
  getGoogleApiToken: (): string | null => {
    return (
      localStorage.getItem(LOCAL_STORAGE_KEYS.GOOGLE_API_TOKEN) ||
      localStorage.getItem(LOCAL_STORAGE_KEYS.API_TOKEN)
    );
  },

  setGoogleApiToken: (token: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.GOOGLE_API_TOKEN, token);
    // Keep legacy key in sync for backward compatibility
    localStorage.setItem(LOCAL_STORAGE_KEYS.API_TOKEN, token);
  },

  getOpenAIApiToken: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.OPENAI_API_TOKEN);
  },

  setOpenAIApiToken: (token: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.OPENAI_API_TOKEN, token);
  },

  // Coach provider toggle
  getCoachProvider: (): 'google' | 'openai' => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.COACH_PROVIDER);
    return stored === 'openai' ? 'openai' : 'google';
  },

  setCoachProvider: (provider: 'google' | 'openai'): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COACH_PROVIDER, provider);
  },
  
  // Chat History
  getChatHistory: (): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY);
      if (!stored) return [];
      
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return (parsed as Array<Partial<ChatMessage>>).map((msg) => ({
        ...msg,
        timestamp: new Date(String(msg.timestamp))
      })) as ChatMessage[];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  },
  
  setChatHistory: (messages: ChatMessage[]): void => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  },
  
  clearChatHistory: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY);
  },

  // Theme Preference
  getThemePreference: (): 'light' | 'dark' => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME_PREFERENCE);
    return stored === 'dark' ? 'dark' : 'light';
  },
  
  setThemePreference: (theme: 'light' | 'dark'): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME_PREFERENCE, theme);
  },

  getColorProfile: (): 'jade' | 'teal' | 'slate' | 'plum' | 'graphite' | 'royalblue' | 'deepnavy' => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.COLOR_PROFILE);
    if (stored === 'teal' || stored === 'slate' || stored === 'plum' || stored === 'graphite' || stored === 'royalblue' || stored === 'deepnavy') return stored as 'teal' | 'slate' | 'plum' | 'graphite' | 'royalblue' | 'deepnavy';
    if (stored === 'jade') return 'jade';
    return 'jade';
  },

  setColorProfile: (profile: 'jade' | 'teal' | 'slate' | 'plum' | 'graphite' | 'royalblue' | 'deepnavy'): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COLOR_PROFILE, profile);
  },

  
  // First Visit
  getIsFirstVisit: (): boolean => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.FIRST_VISIT);
    return stored !== 'false';
  },
  
  setIsFirstVisit: (isFirst: boolean): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FIRST_VISIT, isFirst ? 'true' : 'false');
  },

  // Coach Memory
  getCoachMemory: (): string => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.COACH_MEMORY);
    return stored || '';
  },

  setCoachMemory: (memory: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COACH_MEMORY, memory);
  },

  // Profile Memory
  getProfileMemory: (): string => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILE_MEMORY);
    return stored || '';
  },

  setProfileMemory: (memory: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILE_MEMORY, memory);
  },

  // Goals Memory
  getGoalsMemory: (): string => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.GOALS_MEMORY);
    return stored || '';
  },

  setGoalsMemory: (memory: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.GOALS_MEMORY, memory);
  },

  // Observer Enabled
  getObserverEnabled: (): boolean => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.OBSERVER_ENABLED);
    if (stored === null) return true;
    return stored === 'true';
  },

  setObserverEnabled: (enabled: boolean): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.OBSERVER_ENABLED, enabled ? 'true' : 'false');
  },

  // Observer Rounds
  getObserverRounds: (): number => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.OBSERVER_ROUNDS);
    const n = stored ? parseInt(stored, 10) : 0;
    return Number.isNaN(n) ? 0 : n;
  },

  setObserverRounds: (rounds: number): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.OBSERVER_ROUNDS, String(rounds));
  },

  // Observer Task (enum-like string)
  getObserverTask: (): ObserverTask => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.OBSERVER_TASK);
      if (stored === ObserverTask.GatherUserProfile || stored === ObserverTask.ExploreGoals || stored === ObserverTask.CoachOnTraining || stored === ObserverTask.FreeCoaching) {
        return stored as ObserverTask;
      }
      return ObserverTask.GatherUserProfile;
    } catch {
      return ObserverTask.GatherUserProfile;
    }
  },

  getObserverTaskOptional: (): ObserverTask | null => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.OBSERVER_TASK);
      if (stored === ObserverTask.GatherUserProfile || stored === ObserverTask.ExploreGoals || stored === ObserverTask.CoachOnTraining || stored === ObserverTask.FreeCoaching) {
        return stored as ObserverTask;
      }
      return null;
    } catch {
      return null;
    }
  },

  setObserverTask: (task: ObserverTask): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.OBSERVER_TASK, task);
  },
  
  clearObserverTask: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.OBSERVER_TASK);
  },
  
  // Clear all data
  clearAll: (): void => {
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};
