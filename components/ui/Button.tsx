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
      'bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 font-medium shadow-sm active:scale-[0.98] border border-transparent dark:border-transparent cursor-pointer',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700 shadow-sm active:scale-[0.98] cursor-pointer',
    outline:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 active:scale-[0.98] cursor-pointer',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-500 dark:hover:bg-rose-400 dark:text-white shadow-sm active:scale-[0.98] border border-transparent cursor-pointer',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm font-medium rounded-lg gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base font-medium rounded-xl gap-2.5',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none font-sans',
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
