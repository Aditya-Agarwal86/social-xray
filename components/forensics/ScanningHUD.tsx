'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Scan,
  Layers,
  BrainCircuit,
  MessageSquare,
  Stethoscope,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '@/lib/utils/cn';

interface ScanningHUDProps {
  goalName: string;
}

const FORENSIC_STAGES = [
  { id: 1, label: 'Scanning content', desc: 'Parsing structural layers & token density', icon: Scan },
  { id: 2, label: 'Mapping attention', desc: 'Tracking hook velocity & cognitive pacing', icon: BrainCircuit },
  { id: 3, label: 'Detecting friction', desc: 'Isolating attention cliffs & dropoffs', icon: Layers },
  { id: 4, label: 'Analyzing conversation', desc: 'Evaluating psychological triggers', icon: MessageSquare },
  { id: 5, label: 'Preparing treatment', desc: 'Formulating surgical repairs & platform variants', icon: Stethoscope },
  { id: 6, label: 'Analysis complete', desc: 'Synthesizing diagnostic dossier', icon: CheckCircle2 },
];

const TELEMETRY_STREAM = [
  'Measuring hook velocity & initial cognitive load...',
  'Evaluating conversational friction points...',
  'Detecting passive broadcast phrasing...',
  'Compiling surgical line-by-line recommendations...',
  'Calibrating LinkedIn, Instagram & TikTok adaptations...',
  'Finalizing grounded intelligence report...',
];

export const ScanningHUD: React.FC<ScanningHUDProps> = ({ goalName }) => {
  const [activeStage, setActiveStage] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setActiveStage((prev) => (prev < FORENSIC_STAGES.length - 1 ? prev + 1 : prev));
    }, 700);

    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % TELEMETRY_STREAM.length);
    }, 500);

    return () => {
      clearInterval(stageInterval);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <Card className="p-6 sm:p-10 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg font-sans">
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto">
        {/* Modern Loader Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 dark:text-sky-400" />
        </div>

        {/* Status Header */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Analyzing Post Content
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Diagnosing Audience Attention &amp; Engagement
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Calibrating diagnostic heuristics for{' '}
            <span className="text-slate-800 dark:text-slate-200 font-semibold uppercase">{goalName}</span> objective.
          </p>
        </div>

        {/* 6-Stage Forensic Sequence Progress */}
        <div className="w-full space-y-3 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left">
            {FORENSIC_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPast = idx < activeStage;
              const isCurrent = idx === activeStage;

              return (
                <div
                  key={stage.id}
                  className={cn(
                    'p-3 rounded-xl border transition-all duration-200 flex items-start gap-2.5',
                    isCurrent
                      ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 text-slate-900 dark:text-white shadow-sm'
                      : isPast
                      ? 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                      : 'bg-slate-50/40 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-600 opacity-60'
                  )}
                >
                  <div
                    className={cn(
                      'p-1.5 rounded-lg shrink-0 mt-0.5',
                      isCurrent
                        ? 'bg-sky-500 text-white dark:bg-sky-500 dark:text-slate-950'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-tight truncate">
                      {stage.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {isCurrent ? 'Running...' : isPast ? 'Complete' : 'Queued'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Diagnostics Log */}
        <div className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-left text-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200/80 dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium">
              <Activity className="w-3.5 h-3.5" /> Diagnostic Progress
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
            </span>
          </div>

          <div className="pt-1 text-xs text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
            <span className="text-sky-600 dark:text-sky-400">&gt;</span>
            <span className="truncate">{TELEMETRY_STREAM[logIndex]}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
