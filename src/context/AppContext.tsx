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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isTyping, setIsTyping] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [fitnessChain, setFitnessChain] = useState<FitnessCoachChain | null>(null);

  // Initialize state from localStorage
  useEffect(() => {
    const token = storageUtils.getApiToken();
    const savedMessages = storageUtils.getChatHistory();
    const savedTheme = storageUtils.getThemePreference();
    
    setApiTokenState(token);
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
    storageUtils.setApiToken(token);
    setApiTokenState(token);
    
    const chain = new FitnessCoachChain(token);
    chain.setChatHistory(messages);
    setFitnessChain(chain);
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
      if (fitnessChain) {
        fitnessChain.setChatHistory([]);
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
  };


  // Prompt PWA installation
  const promptInstall = () => {
    // This will be implemented when we handle the beforeinstallprompt event
    console.log('PWA installation prompt would be shown here');
  };

  // Send message to AI
  const sendMessageToAI = async (message: string): Promise<string> => {
    if (!fitnessChain) {
      throw new Error('AI coach not initialized. Please configure your API token.');
    }

    setIsTyping(true);
    try {
      const response = await fitnessChain.sendMessage(message);
      return response;
    } catch (error) {
      throw error;
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
  }, [theme]);


  const contextValue: AppContextType = {
    // API Configuration
    apiToken,
    setApiToken: handleSetApiToken,
    
    // Chat State
    messages,
    addMessage,
    clearMessages,
    // AI Interaction
    sendMessageToAI,
    
    // UI State
    theme,
    toggleTheme,
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