import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          rows={1}
          className="w-full px-4 py-3 pr-24 border border-[var(--color-outline)] rounded-2xl bg-[var(--color-surface)] text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] resize-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
          style={{ minHeight: '52px', maxHeight: '120px' }}
        />

        <div className="absolute top-1/2 right-3 -translate-y-1/2 -mt-1 flex items-center gap-2">
          

          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="p-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};