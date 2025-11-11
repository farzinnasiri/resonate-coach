import React from 'react';

interface GlassPanelProps {
  density?: 'thin' | 'medium' | 'thick';
  className?: string;
  children: React.ReactNode;
}

// Liquid-style glass panel with blur and subtle border using CSS variables
export const GlassPanel: React.FC<GlassPanelProps> = ({ density = 'medium', className = '', children }) => {
  const blurMap: Record<'thin' | 'medium' | 'thick', string> = {
    thin: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    thick: 'backdrop-blur-lg',
  };

  return (
    <div className={`bg-[var(--glass-bg)] border border-[var(--glass-border)] ${blurMap[density]} rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};