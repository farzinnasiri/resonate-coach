import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/index';
import { MessageBubble } from './MessageBubble';
import { LoadingDots } from './LoadingAnimations';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    }
  }, [isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">💪</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
      </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 pb-24">
      <div className="max-w-[860px] md:max-w-[940px] mx-auto space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && (
          <div className={`flex justify-start mb-4`}>
            <div className="max-w-[90%] sm:max-w-[80%] md:max-w-[70%] mx-2 sm:mx-4 md:mx-6">
              <div className={`bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm`}>
                <div className="flex items-center space-x-2 text-sm text-[var(--color-on-surface-variant)]">
                  <LoadingDots />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
