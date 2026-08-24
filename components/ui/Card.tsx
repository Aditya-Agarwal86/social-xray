import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'accent' | 'telemetry';
  glowColor?: 'cyan' | 'amber' | 'red' | 'emerald';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  glowColor = 'cyan',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none',
    glow: 'bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow transition-all duration-150',
    accent: 'bg-white dark:bg-slate-900/95 border border-sky-500/30 dark:border-sky-500/30 shadow-sm',
    telemetry: 'bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800',
  };

  return (
    <div
      className={cn('rounded-xl p-5 text-slate-900 dark:text-slate-100 relative font-sans', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
