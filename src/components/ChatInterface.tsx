import React, { useState } from 'react';
import { toast } from 'sonner';
import { useApp, useAI } from '@/context/AppContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { DarkModeToggle } from './DarkModeToggle';
import { Trash2 } from 'lucide-react';
import type { ChatMessage } from '@/types/index';

export const ChatInterface: React.FC = () => {
  const { messages, addMessage, isTyping, apiToken, googleToken, openaiToken, coachProvider, setCoachProvider, clearMessages } = useApp();
  const { sendMessageToAI } = useAI();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    const hasToken = coachProvider === 'openai' ? !!openaiToken : !!googleToken || !!apiToken;
    if (!hasToken) {
      toast.error('Please configure your API key first');
      return;
    }

    setIsLoading(true);
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    addMessage(userMessage);
    try {
      // Send to AI and get response
      const aiResponse = await sendMessageToAI();
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
      };
      addMessage(aiMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to get response from AI');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed header controls (clear chat/settings)

  return (
    <div className="h-screen flex flex-col bg-[var(--color-surface)]">
      {/* Top-right control */}
      <div className="px-4 py-3 flex justify-end gap-2">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => { setCoachProvider?.('google'); }}
            className={`px-3 py-1 text-sm rounded-md ${coachProvider === 'google' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Google
          </button>
          <button
            onClick={() => {
              if (!openaiToken) {
                toast.error('Please configure your OpenAI API key');
                return;
              }
              setCoachProvider?.('openai');
            }}
            className={`px-3 py-1 text-sm rounded-md ${coachProvider === 'openai' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            OpenAI
          </button>
        </div>
        <DarkModeToggle />
        <button
          onClick={() => { clearMessages(); toast.success('Conversation cleared'); }}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Reset chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0">
        <MessageList messages={messages} />
      </div>

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />

      {/* Typing Indicator */}
      {isTyping && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-10">
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="flex items-center space-x-2 text-sm text-[var(--color-on-surface-variant)]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[var(--color-on-surface-variant)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[var(--color-on-surface-variant)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[var(--color-on-surface-variant)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Responding...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
