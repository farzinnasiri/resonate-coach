import React from 'react';
import type { ChatMessage } from '@/types/index';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const liquidBase = 'bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-md text-[var(--color-on-surface)]';
  const bubbleClass = `${liquidBase} ${isUser ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'}`;
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="max-w-[80%]">
        <div className={`${bubbleClass} px-4 py-3`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <p
            className={`text-xs mt-1 text-[var(--color-on-surface-variant)]`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};