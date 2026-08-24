'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';
import { useTheme, ThemeMode } from '@/lib/theme/ThemeProvider';
import { cn } from '@/lib/utils/cn';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const themeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  const CurrentIcon = theme === 'system' ? Laptop : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-xs font-medium cursor-pointer"
        aria-label={`Current theme: ${theme}. Click to change theme`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <CurrentIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline capitalize">{theme}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-1.5 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-50 animate-fade-in font-sans text-xs"
        >
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.id;
            return (
              <button
                key={option.id}
                role="menuitem"
                onClick={() => {
                  setTheme(option.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer',
                  isSelected
                    ? 'text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{option.label}</span>
                {isSelected && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
