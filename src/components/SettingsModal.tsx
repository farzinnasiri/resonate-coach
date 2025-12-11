import React, { useEffect, useState } from 'react';
import { X, Settings } from 'lucide-react';
import { storageUtils } from '@/utils/storage';
import { toast } from 'sonner';

type Props = {
  onClose: () => void;
};

export const SettingsModal: React.FC<Props> = ({ onClose }) => {
  const [profileMemory, setProfileMemory] = useState('');
  const [goalsMemory, setGoalsMemory] = useState('');

  useEffect(() => {
    setProfileMemory(storageUtils.getProfileMemory());
    setGoalsMemory(storageUtils.getGoalsMemory());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const saveProfile = () => {
    storageUtils.setProfileMemory(profileMemory);
    toast.success('Profile memory saved');
  };

  const saveGoals = () => {
    storageUtils.setGoalsMemory(goalsMemory);
    toast.success('Goals memory saved');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-2xl bg-[var(--color-surface)] rounded-2xl shadow-2xl p-6 border border-[var(--color-outline)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center justify-center w-10 h-10 rounded-full ring-1"
              style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)', borderColor: 'color-mix(in oklab, var(--color-primary) 24%, transparent)' }}
            >
              <Settings className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)' }}>Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <section>
            <label htmlFor="profile-memory" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>
              Profile Memory
            </label>
            <textarea
              id="profile-memory"
              value={profileMemory}
              onChange={(e) => setProfileMemory(e.target.value)}
              className="w-full min-h-32 h-32 px-4 py-3 rounded-xl border bg-white/60 dark:bg-black/40 outline-none transition-all shadow-sm"
              style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)', caretColor: 'var(--color-primary)' }}
              aria-label="Edit profile memory"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={saveProfile}
                className="px-4 py-2 rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: '0 10px 25px -5px color-mix(in oklab, var(--color-primary) 35%, transparent)' }}
                aria-label="Save profile memory"
              >
                Save Profile
              </button>
            </div>
          </section>

          <section>
            <label htmlFor="goals-memory" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>
              Goals Memory
            </label>
            <textarea
              id="goals-memory"
              value={goalsMemory}
              onChange={(e) => setGoalsMemory(e.target.value)}
              className="w-full min-h-32 h-32 px-4 py-3 rounded-xl border bg-white/60 dark:bg-black/40 outline-none transition-all shadow-sm"
              style={{ borderColor: 'var(--color-outline)', color: 'var(--color-on-surface)', caretColor: 'var(--color-primary)' }}
              aria-label="Edit goals memory"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={saveGoals}
                className="px-4 py-2 rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: '0 10px 25px -5px color-mix(in oklab, var(--color-primary) 35%, transparent)' }}
                aria-label="Save goals memory"
              >
                Save Goals
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

