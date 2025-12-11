import React, { useState, KeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-surface)] to-transparent pointer-events-none z-10">
      <div className="relative max-w-4xl mx-auto pointer-events-auto">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={1}
          className="w-full px-4 py-3 pr-16 border border-[var(--color-outline)] rounded-3xl bg-[var(--color-surface)] text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] resize-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
          style={{ minHeight: '52px', maxHeight: '120px' }}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className="absolute top-1/2 right-4 -translate-y-1/2 -mt-px p-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send"
        >
          <SendHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
