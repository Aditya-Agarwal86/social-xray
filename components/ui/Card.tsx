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
  const glowStyles = {
    cyan: 'hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(0,240,255,0.12)]',
    amber: 'hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.12)]',
    red: 'hover:border-rose-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.12)]',
    emerald: 'hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)]',
  };

  const variantStyles = {
    default: 'bg-carbon-850/80 border border-carbon-700/80 backdrop-blur-md',
    glow: cn('bg-carbon-850/80 border border-carbon-700/80 backdrop-blur-md transition-all duration-200', glowStyles[glowColor]),
    accent: 'bg-gradient-to-b from-carbon-800/90 to-carbon-900/90 border border-cyan-500/30 backdrop-blur-md',
    telemetry: 'bg-carbon-900/95 border border-carbon-750 font-mono relative overflow-hidden',
  };

  return (
    <div
      className={cn('rounded-xl p-5 text-carbon-100 relative', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
