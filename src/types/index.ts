export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface GeminiAPIRequest {
  prompt: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiAPIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LangChainConfig {
  apiKey: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
}

export interface AppState {
  apiToken: string | null;
  messages: ChatMessage[];
  theme: 'light' | 'dark';
  isFirstVisit: boolean;
}

export interface LocalStorageKeys {
  API_TOKEN: 'resonate_coach_api_token';
  CHAT_HISTORY: 'resonate_coach_messages';
  THEME_PREFERENCE: 'resonate_coach_theme';
  FIRST_VISIT: 'resonate_coach_first_visit';
}

export interface AppContextType {
  // API Configuration
  apiToken: string | null;
  setApiToken: (token: string) => void;
  
  // Chat State
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  // AI Interaction
  sendMessageToAI: (message: string) => Promise<string>;
  
  // UI State
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  
  // PWA State
  isInstallable: boolean;
  promptInstall: () => void;
}