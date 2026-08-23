'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface XRayScanOverlayProps {
  active?: boolean;
  className?: string;
  showCorners?: boolean;
}

export const XRayScanOverlay: React.FC<XRayScanOverlayProps> = ({
  active = true,
  className = '',
  showCorners = true,
}) => {
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden select-none',
        className
      )}
      aria-hidden="true"
    >
      {/* Precision reticle corner brackets */}
      {showCorners && (
        <>
          <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-cyan-500/40" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-cyan-500/40" />
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-cyan-500/40" />
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-cyan-500/40" />
        </>
      )}

      {/* Subtle sweep line */}
      {active && <div className="animate-xray-sweep" />}
    </div>
  );
};
