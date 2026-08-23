import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'amber' | 'red' | 'emerald' | 'violet' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'sm',
  ...props
}) => {
  const variantStyles = {
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    red: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    violet: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
    neutral: 'bg-carbon-800 text-carbon-300 border-carbon-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-mono tracking-wider',
    md: 'px-2.5 py-1 text-xs font-mono tracking-wider',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border uppercase font-medium select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
