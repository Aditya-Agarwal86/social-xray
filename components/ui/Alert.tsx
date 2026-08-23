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
      container: 'bg-rose-950/40 border-rose-800/60 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      titleColor: 'text-rose-300 font-semibold',
    },
    warning: {
      container: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      titleColor: 'text-amber-300 font-semibold',
    },
    info: {
      container: 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200',
      icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
      titleColor: 'text-cyan-300 font-semibold',
    },
    success: {
      container: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      titleColor: 'text-emerald-300 font-semibold',
    },
  };

  const current = styles[type];

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm transition-all',
        current.container,
        className
      )}
      role="alert"
    >
      {current.icon}
      <div className="flex-1 text-sm space-y-1">
        {title && <div className={current.titleColor}>{title}</div>}
        <div className="text-carbon-200 leading-relaxed font-sans">{message}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-carbon-400 hover:text-white transition-colors p-1 rounded hover:bg-carbon-800/60"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
