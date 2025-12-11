import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppContextType, ChatMessage } from '@/types/index';
import { storageUtils } from '@/utils/storage';
import { FitnessCoachChain } from '@/utils/fitnessCoach';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [apiToken, setApiTokenState] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [openaiToken, setOpenaiToken] = useState<string | null>(null);
  const [userName, setUserNameState] = useState<string | null>(null);
  const [coachProvider, setCoachProviderState] = useState<'google' | 'openai'>(storageUtils.getCoachProvider());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [colorProfile, setColorProfileState] = useState<'jade' | 'teal' | 'slate' | 'plum' | 'graphite' | 'royalblue' | 'deepnavy'>(storageUtils.getColorProfile());
  const [isTyping, setIsTyping] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [fitnessChain, setFitnessChain] = useState<FitnessCoachChain | null>(null);

  // Initialize state from localStorage
  useEffect(() => {
    const token = storageUtils.getGoogleApiToken();
    const oai = storageUtils.getOpenAIApiToken();
    const savedUserName = storageUtils.getUserName();
    const savedMessages = storageUtils.getChatHistory();
    const savedTheme = storageUtils.getThemePreference();
    
    setApiTokenState(token);
    setGoogleToken(token);
    setOpenaiToken(oai);
    setUserNameState(savedUserName);
    setMessages(savedMessages);
    setTheme(savedTheme);

    // Initialize fitness coach chain if token exists
    if (token) {
      const chain = new FitnessCoachChain(token);
      chain.setChatHistory(savedMessages);
      setFitnessChain(chain);
    }

    // Check for PWA installability
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Save API token to localStorage and initialize fitness chain
  const handleSetApiToken = (token: string) => {
    storageUtils.setGoogleApiToken(token);
    setApiTokenState(token);
    setGoogleToken(token);
    
    const chain = new FitnessCoachChain(token);
    chain.setChatHistory(messages);
    setFitnessChain(chain);
  };

  const handleSetOpenAIToken = (token: string) => {
    storageUtils.setOpenAIApiToken(token);
    setOpenaiToken(token);
  };

  const handleSetUserName = (name: string) => {
    storageUtils.setUserName(name);
    setUserNameState(name);
  };

  const handleClearUserName = () => {
    storageUtils.removeUserName();
    setUserNameState(null);
  };

  const handleSetCoachProvider = (provider: 'google' | 'openai') => {
    storageUtils.setCoachProvider(provider);
    setCoachProviderState(provider);
    if (googleToken) {
      const chain = new FitnessCoachChain(googleToken);
      chain.setChatHistory(messages);
      setFitnessChain(chain);
    }
  };

  // Add message to chat
  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      storageUtils.setChatHistory(updated);
      if (fitnessChain) {
        fitnessChain.setChatHistory(updated);
      }
      return updated;
    });
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages(() => {
      storageUtils.clearChatHistory();
      storageUtils.setCoachMemory('');
      storageUtils.setObserverRounds(0);
      storageUtils.setObserverEnabled(true);
      storageUtils.clearObserverTask();
      if (fitnessChain) {
        fitnessChain.resetChat();
      }
      return [];
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    storageUtils.setThemePreference(newTheme);
    
    // Update document class for Tailwind dark mode
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    applyColorProfile(colorProfile);
  };

  const applyColorProfile = (p: 'jade' | 'teal' | 'slate' | 'plum' | 'graphite' | 'royalblue' | 'deepnavy') => {
    const light: Record<'jade' | 'teal' | 'slate' | 'plum' | 'graphite' | 'royalblue' | 'deepnavy', { primary: string; onPrimary: string; container: string; onContainer: string; surface: string; surfaceLow: string; onSurface: string; onSurfaceVar: string; outline: string }> = {
      jade: { primary: '#2BBE87', onPrimary: '#ffffff', container: '#E6F8F1', onContainer: '#0D3B2A', surface: '#F5FAF7', surfaceLow: '#EAF3EE', onSurface: '#2F3129', onSurfaceVar: '#5F6A5F', outline: '#D4E6DC' },
      teal: { primary: '#14B8A6', onPrimary: '#ffffff', container: '#E8FAF7', onContainer: '#073B38', surface: '#F3FBFA', surfaceLow: '#E7F5F3', onSurface: '#2F3129', onSurfaceVar: '#5B7E79', outline: '#CBEDEE' },
      slate: { primary: '#6B7CA8', onPrimary: '#ffffff', container: '#EEF2FA', onContainer: '#1E2A44', surface: '#EEF2F7', surfaceLow: '#E9EEF5', onSurface: '#334155', onSurfaceVar: '#64748B', outline: '#CBD5E1' },
      plum: { primary: '#7B5EA9', onPrimary: '#ffffff', container: '#F2ECF9', onContainer: '#2D2240', surface: '#F6F2FA', surfaceLow: '#ECE7F5', onSurface: '#3D394A', onSurfaceVar: '#6E5C84', outline: '#D9D0E6' },
      graphite: { primary: '#374151', onPrimary: '#ffffff', container: '#ECECEC', onContainer: '#111827', surface: '#F3F3F3', surfaceLow: '#EFEFEF', onSurface: '#2F2F2F', onSurfaceVar: '#6B6B6B', outline: '#D6D6D6' },
      royalblue: { primary: '#0044CC', onPrimary: '#ffffff', container: '#E7EEFB', onContainer: '#0A1F52', surface: '#F1F5FE', surfaceLow: '#E3ECFC', onSurface: '#334155', onSurfaceVar: '#54698F', outline: '#C9D6F0' },
      deepnavy: { primary: '#000C66', onPrimary: '#ffffff', container: '#E6E9FA', onContainer: '#01051F', surface: '#EEF2FA', surfaceLow: '#E2E8FA', onSurface: '#2E3344', onSurfaceVar: '#516084', outline: '#C9D3EE' },
    };
    const dark: Record<'jade' | 'teal' | 'slate' | 'plum' | 'graphite' | 'royalblue' | 'deepnavy', { surface: string; surfaceLow: string; onSurface: string; onSurfaceVar: string; outline: string }> = {
      jade: { surface: '#000000', surfaceLow: '#121212', onSurface: '#E5E7EB', onSurfaceVar: '#9CB5A9', outline: '#1A1A1A' },
      teal: { surface: '#000000', surfaceLow: '#121212', onSurface: '#E5E7EB', onSurfaceVar: '#94B8B2', outline: '#1A1A1A' },
      slate: { surface: '#000000', surfaceLow: '#121212', onSurface: '#E5E7EB', onSurfaceVar: '#9CA3AF', outline: '#1A1A1A' },
      plum: { surface: '#000000', surfaceLow: '#121212', onSurface: '#E5E7EB', onSurfaceVar: '#A79BBF', outline: '#1A1A1A' },
      graphite: { surface: '#000000', surfaceLow: '#121212', onSurface: '#E5E7EB', onSurfaceVar: '#9CA3AF', outline: '#1A1A1A' },
      royalblue: { surface: '#000000', surfaceLow: '#121212', onSurface: '#E5E7EB', onSurfaceVar: '#9CB2DA', outline: '#1A1A1A' },
      deepnavy: { surface: '#000000', surfaceLow: '#121212', onSurface: '#E5E7EB', onSurfaceVar: '#8FA1CC', outline: '#1A1A1A' },
    };

    const l = light[p];
    document.documentElement.style.setProperty('--color-primary', l.primary);
    document.documentElement.style.setProperty('--color-on-primary', l.onPrimary);
    document.documentElement.style.setProperty('--color-primary-container', l.container);
    document.documentElement.style.setProperty('--color-on-primary-container', l.onContainer);

    const isDark = theme === 'dark';
    const d = dark[p];
    document.documentElement.style.setProperty('--color-surface', isDark ? d.surface : l.surface);
    document.documentElement.style.setProperty('--color-surface-container-low', isDark ? d.surfaceLow : l.surfaceLow);
    document.documentElement.style.setProperty('--color-on-surface', isDark ? d.onSurface : l.onSurface);
    document.documentElement.style.setProperty('--color-on-surface-variant', isDark ? d.onSurfaceVar : l.onSurfaceVar);
    document.documentElement.style.setProperty('--color-outline', isDark ? d.outline : l.outline);
  };

  const setColorProfile = (p: 'jade' | 'teal' | 'slate' | 'plum' | 'graphite' | 'royalblue' | 'deepnavy') => {
    setColorProfileState(p);
    storageUtils.setColorProfile(p);
    applyColorProfile(p);
  };

  useEffect(() => {
    applyColorProfile(colorProfile);
  }, [colorProfile]);


  // Prompt PWA installation
  const promptInstall = () => {
    // This will be implemented when we handle the beforeinstallprompt event
    console.log('PWA installation prompt would be shown here');
  };

  // Send message to AI
  const sendMessageToAI = async (): Promise<string[]> => {
    if (!fitnessChain) {
      throw new Error('AI coach not initialized. Please configure your API token.');
    }

    setIsTyping(true);
    try {
      const response = await fitnessChain.sendMessage();
      return response;
    } finally {
      setIsTyping(false);
    }
  };

  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    applyColorProfile(colorProfile);
  }, [theme]);


  const contextValue: AppContextType = {
    // API Configuration
    apiToken,
    setApiToken: handleSetApiToken,
    googleToken,
    openaiToken,
    setOpenAIToken: handleSetOpenAIToken,
    coachProvider,
    setCoachProvider: handleSetCoachProvider,
    
    // User Profile
    userName,
    setUserName: handleSetUserName,
    clearUserName: handleClearUserName,

    // Chat State
    messages,
    addMessage,
    clearMessages,
    // AI Interaction
    sendMessageToAI,
    
    // UI State
    theme,
    toggleTheme,
    colorProfile,
    setColorProfile,
    isTyping,
    setIsTyping,
    
    // PWA State
    isInstallable,
    promptInstall,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAI must be used within an AppProvider');
  }
  const { sendMessageToAI } = context;
  return { sendMessageToAI };
};
