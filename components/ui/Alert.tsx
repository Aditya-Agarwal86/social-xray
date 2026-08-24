import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AlertProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'error',
  title,
  message,
  onDismiss,
  className,
  action,
}) => {
  const styles = {
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800/40 dark:text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
      titleColor: 'text-rose-900 dark:text-rose-300 font-semibold',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
      titleColor: 'text-amber-900 dark:text-amber-300 font-semibold',
    },
    info: {
      container: 'bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/30 dark:border-sky-800/40 dark:text-sky-200',
      icon: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />,
      titleColor: 'text-sky-900 dark:text-sky-300 font-semibold',
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      titleColor: 'text-emerald-900 dark:text-emerald-300 font-semibold',
    },
  };

  const current = styles[type];

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border transition-all font-sans',
        current.container,
        className
      )}
      role="alert"
    >
      {current.icon}
      <div className="flex-1 text-sm space-y-1">
        {title && <div className={current.titleColor}>{title}</div>}
        <div className="text-slate-700 dark:text-slate-200 leading-relaxed text-xs sm:text-sm">{message}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
