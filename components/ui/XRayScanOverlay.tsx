'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface XRayScanOverlayProps {
  active?: boolean;
  className?: string;
  showCorners?: boolean;
}

export const XRayScanOverlay: React.FC<XRayScanOverlayProps> = ({
  active = false,
  className = '',
  showCorners = false,
}) => {
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden select-none',
        className
      )}
      aria-hidden="true"
    >
      {/* Subtle corner hairline guides */}
      {showCorners && (
        <>
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-slate-300/50 dark:border-slate-700/60" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-slate-300/50 dark:border-slate-700/60" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-slate-300/50 dark:border-slate-700/60" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-slate-300/50 dark:border-slate-700/60" />
        </>
      )}
    </div>
  );
};
