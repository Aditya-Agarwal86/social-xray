'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, RotateCcw, Home, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-carbon-950 text-carbon-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-500/25 selection:text-white">
      <div className="max-w-md w-full p-8 rounded-2xl bg-carbon-900 border border-rose-900/60 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/30 text-[11px] font-mono text-rose-300 uppercase tracking-wider">
            <span>LABORATORY EXCEPTION</span>
          </div>
          <h1 className="text-xl font-mono font-bold text-white tracking-tight">
            SYSTEM ANOMALY DETECTED
          </h1>
          <p className="text-xs text-carbon-300 font-sans leading-relaxed">
            The forensic pipeline encountered an unexpected runtime error. Your uploaded files and credentials remain secure.
          </p>
        </div>

        {error.digest && (
          <div className="p-3 rounded-lg bg-carbon-950 border border-carbon-800 font-mono text-[11px] text-carbon-500">
            Error Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            leftIcon={<RotateCcw className="w-4 h-4 text-carbon-950" />}
            className="w-full sm:w-auto font-mono text-xs"
          >
            Re-initialize Pipeline
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => (window.location.href = '/')}
            leftIcon={<Home className="w-4 h-4 text-cyan-400" />}
            className="w-full sm:w-auto font-mono text-xs"
          >
            Return to Lab
          </Button>
        </div>
      </div>
    </div>
  );
}
