import React, { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export const UserNamePopup: React.FC = () => {
  const { userName, setUserName } = useApp();
  const [name, setName] = useState('');

  if (userName) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUserName(name.trim());
      toast.success(`Welcome, ${name}!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-2xl p-8 border border-[var(--color-outline)] transform transition-all scale-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ring-1" style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)', borderColor: 'color-mix(in oklab, var(--color-primary) 24%, transparent)' }}>
            <User className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-on-surface)' }}>
            Hi, I'm Reed
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-on-surface-variant)' }}>
            What should I call you?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="name" className="sr-only">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-6 py-4 text-lg rounded-xl border bg-white/60 dark:bg-black/40 outline-none transition-all shadow-sm"
              style={{
                borderColor: 'var(--color-outline)',
                color: 'var(--color-on-surface)',
                caretColor: 'var(--color-primary)',
              }}
              onFocus={(e) => e.currentTarget.classList.add('ring-2')}
              onBlur={(e) => e.currentTarget.classList.remove('ring-2')}
              aria-label="Your name"
              autoFocus
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 font-bold text-lg py-4 px-6 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              boxShadow: '0 10px 25px -5px color-mix(in oklab, var(--color-primary) 35%, transparent)'
            }}
          >
            Let's Begin
            <ArrowRight className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};
