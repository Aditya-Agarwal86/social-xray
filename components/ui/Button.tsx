import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-cyan-500 hover:bg-cyan-400 text-carbon-950 font-semibold shadow-lg shadow-cyan-500/20 active:scale-[0.98] border border-cyan-400/50',
    secondary:
      'bg-carbon-800 hover:bg-carbon-750 text-carbon-100 border border-carbon-700 hover:border-carbon-600 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-carbon-800/60 text-carbon-200 border border-carbon-700 hover:border-cyan-500/50 hover:text-cyan-300 active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-[0.98] border border-rose-500',
    ghost: 'bg-transparent hover:bg-carbon-800/60 text-carbon-300 hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-md gap-1.5',
    md: 'px-4 py-2 text-sm font-medium rounded-lg gap-2',
    lg: 'px-6 py-3 text-base font-semibold rounded-lg gap-2.5',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none font-sans',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
