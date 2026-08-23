import React from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-carbon-950 text-carbon-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-500/25 selection:text-white">
      <div className="max-w-md w-full p-8 rounded-2xl bg-carbon-900 border border-carbon-750 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <SearchX className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 uppercase tracking-wider">
            <span>404 TELEMETRY ERROR</span>
          </div>
          <h1 className="text-xl font-mono font-bold text-white tracking-tight">
            FORENSIC DOSSIER NOT FOUND
          </h1>
          <p className="text-xs text-carbon-300 font-sans leading-relaxed">
            The diagnostic route or resource you are attempting to inspect does not exist in the active laboratory environment.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button
              variant="primary"
              size="md"
              leftIcon={<ArrowLeft className="w-4 h-4 text-carbon-950" />}
              className="w-full font-mono text-xs"
            >
              Return to Ingestion Workbench
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
