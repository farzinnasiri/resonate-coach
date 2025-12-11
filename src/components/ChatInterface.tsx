import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useApp, useAI } from '@/context/AppContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { DarkModeToggle } from './DarkModeToggle';
import { Trash2, Settings, Palette, Check } from 'lucide-react';
import type { ChatMessage } from '@/types/index';
import { SettingsModal } from '@/components/SettingsModal';

export const ChatInterface: React.FC = () => {
  const { messages, addMessage, isTyping, apiToken, googleToken, openaiToken, coachProvider, setCoachProvider, clearMessages, clearUserName, setIsTyping, colorProfile, setColorProfile } = useApp();
  const { sendMessageToAI } = useAI();
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsThemeMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen((v) => !v)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Select theme"
              aria-haspopup="menu"
              aria-expanded={isThemeMenuOpen}
            >
              <Palette className="w-5 h-5" />
            </button>
            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-[var(--color-surface)] shadow-xl z-50" style={{ borderColor: 'var(--color-outline)' }}>
                {[
                  { key: 'jade', label: 'Alpine Jade' },
                  { key: 'teal', label: 'Tropic Teal' },
                  { key: 'slate', label: 'Nordic Slate' },
                  { key: 'plum', label: 'Royal Plum' },
                  { key: 'graphite', label: 'Obsidian' },
                  { key: 'royalblue', label: 'Royal Blue' },
                  { key: 'deepnavy', label: 'Deep Navy' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setColorProfile?.(key as any); setIsThemeMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                      colorProfile === (key as any)
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{ color: 'var(--color-on-surface)' }}
                    role="menuitem"
                  >
                    <span>{label}</span>
                    {colorProfile === (key as any) && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <DarkModeToggle />
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
        </button>
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

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};
