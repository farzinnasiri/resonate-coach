import React, { useState } from 'react';
import { toast } from 'sonner';
import { useApp, useAI } from '@/context/AppContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { DarkModeToggle } from './DarkModeToggle';
import { Trash2 } from 'lucide-react';
import type { ChatMessage } from '@/types/index';

export const ChatInterface: React.FC = () => {
  const { messages, addMessage, isTyping, apiToken, googleToken, openaiToken, coachProvider, setCoachProvider, clearMessages, clearUserName, setIsTyping, colorProfile, setColorProfile } = useApp();
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
      const aiBubbles = await sendMessageToAI();
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const computeDelay = (t: string) => {
        const len = t.length;
        const wpm = 80;
        const cpm = wpm * 5;
        const perCharMs = 60000 / cpm;
        const scale = 0.3;
        const base = Math.round(Math.min(1800, Math.max(250, len * perCharMs * scale)));
        const jitter = Math.round(base * (Math.random() * 0.3 - 0.15));
        return Math.max(250, base + jitter);
      };
      const postGap = () => {
        const base = 300;
        const jitter = Math.round(base * (Math.random() * 0.4 - 0.2));
        return Math.max(200, base + jitter);
      };
      setIsTyping(true);
      for (let i = 0; i < aiBubbles.length; i++) {
        const bubble = aiBubbles[i];
        await sleep(computeDelay(bubble));
        setIsTyping(false);
        const aiMessage: ChatMessage = {
          id: `${Date.now()}-${i + 1}`,
          content: bubble,
          role: 'assistant',
          timestamp: new Date(),
        };
        addMessage(aiMessage);
        if (i < aiBubbles.length - 1) {
          await sleep(postGap());
          setIsTyping(true);
        }
      }
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
        <div className="flex items-center gap-2">
          <select
            value={colorProfile || 'jade'}
            onChange={(e) => setColorProfile?.(e.target.value as 'jade' | 'teal' | 'slate' | 'plum' | 'graphite' | 'royalblue' | 'deepnavy')}
            className="h-9 px-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 outline-none"
            aria-label="Accent color profile"
          >
            <option value="jade">Alpine Jade</option>
            <option value="teal">Tropic Teal</option>
            <option value="slate">Nordic Slate</option>
            <option value="plum">Royal Plum</option>
            <option value="graphite">Obsidian</option>
            <option value="royalblue">Royal Blue</option>
            <option value="deepnavy">Deep Navy</option>
          </select>
          <DarkModeToggle />
        </div>
        <button
          onClick={() => { clearMessages(); clearUserName?.(); toast.success('Conversation and name cleared'); }}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Reset chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0">
        <MessageList messages={messages} isTyping={isTyping} />
      </div>

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />

      {/* Inline typing bubble handled in MessageList */}
    </div>
  );
};
