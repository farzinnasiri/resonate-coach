import React from 'react';
import type { ChatMessage } from '@/types/index';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const userBubble = 'bg-[var(--color-primary)] text-white';
  const aiBubble = 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]';
  const bubbleClass = isUser ? `${userBubble} rounded-2xl rounded-br-sm` : `${aiBubble} rounded-2xl rounded-bl-sm`;
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="max-w-[90%] sm:max-w-[80%] md:max-w-[70%] mx-2 sm:mx-4 md:mx-8 lg:mx-16 xl:mx-24">
        <div className={`${bubbleClass} px-4 py-3`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
};