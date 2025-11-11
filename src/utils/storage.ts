import type { ChatMessage } from '@/types/index';

export const LOCAL_STORAGE_KEYS = {
  API_TOKEN: 'resonate_coach_api_token',
  CHAT_HISTORY: 'resonate_coach_messages',
  THEME_PREFERENCE: 'resonate_coach_theme',
  FIRST_VISIT: 'resonate_coach_first_visit',
} as const;

export const storageUtils = {
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
  
  // Chat History
  getChatHistory: (): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
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

  
  // First Visit
  getIsFirstVisit: (): boolean => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.FIRST_VISIT);
    return stored !== 'false';
  },
  
  setIsFirstVisit: (isFirst: boolean): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FIRST_VISIT, isFirst ? 'true' : 'false');
  },
  
  // Clear all data
  clearAll: (): void => {
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};