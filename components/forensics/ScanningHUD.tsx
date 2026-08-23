'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Scan,
  Radio,
  Sparkles,
  Terminal,
  Layers,
  BrainCircuit,
  MessageSquare,
  Stethoscope,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '@/lib/utils/cn';

interface ScanningHUDProps {
  goalName: string;
}

const FORENSIC_STAGES = [
  { id: 1, label: 'Scanning content', desc: 'Parsing structural layers & token density', icon: Scan },
  { id: 2, label: 'Mapping attention', desc: 'Tracking hook velocity & cognitive pacing', icon: BrainCircuit },
  { id: 3, label: 'Detecting friction', desc: 'Isolating attention cliffs & throat-clearing', icon: Layers },
  { id: 4, label: 'Analyzing conversation', desc: 'Evaluating psychological debate triggers', icon: MessageSquare },
  { id: 5, label: 'Preparing treatment', desc: 'Formulating surgical rewrites & platform variants', icon: Stethoscope },
  { id: 6, label: 'X-Ray complete', desc: 'Synthesizing forensic dossier', icon: CheckCircle2 },
];

const TELEMETRY_STREAM = [
  'INITIALIZING NEURAL AUDIENCE SIMULATOR...',
  'MEASURING HOOK RETENTION COEFFICIENT...',
  'CALCULATING COGNITIVE STRAIN INDEX...',
  'ISOLATING PASSIVE BROADCAST PHRASES...',
  'COMPILING SURGICAL BEFORE/AFTER DIFF...',
  'CALIBRATING LINKEDIN, INSTAGRAM & TIKTOK DERIVATIVES...',
  'FINALIZING FORENSIC AUTOPSY DOSSIER...',
];

export const ScanningHUD: React.FC<ScanningHUDProps> = ({ goalName }) => {
  const [activeStage, setActiveStage] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  // Progressive stage simulation for smooth non-blocking UX
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
    <Card variant="telemetry" className="p-6 sm:p-10 relative overflow-hidden border-cyan-500/50 shadow-[0_0_40px_rgba(0,240,255,0.12)]">
      {/* Radar scanning grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E2638_1px,transparent_1px)] [background-size:18px_18px] opacity-40 pointer-events-none" />

      {/* Laser scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_25px_#00f0ff] animate-scan-line" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 max-w-2xl mx-auto">
        {/* Radar Reticle Animation */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-pulse-slow" />
          <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-6 rounded-full border border-cyan-400/70" />
          <div className="relative w-11 h-11 rounded-full bg-cyan-950/90 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_30px_rgba(0,240,255,0.8)]">
            <Radio className="w-6 h-6 animate-ping opacity-60 absolute" />
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Status Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI FORENSIC SCANNER ACTIVE
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wide">
            DIAGNOSING AUDIENCE ATTENTION CLIFFS
          </h2>
          <p className="text-xs sm:text-sm font-sans text-carbon-400 max-w-md mx-auto">
            Calibrating engagement heuristics for{' '}
            <span className="text-cyan-300 font-mono font-semibold uppercase">{goalName}</span> objective.
          </p>
        </div>

        {/* 6-Stage Forensic Sequence Progress HUD */}
        <div className="w-full space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left">
            {FORENSIC_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPast = idx < activeStage;
              const isCurrent = idx === activeStage;

              return (
                <div
                  key={stage.id}
                  className={cn(
                    'p-3 rounded-xl border transition-all duration-300 flex items-start gap-2.5',
                    isCurrent
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] text-white'
                      : isPast
                      ? 'bg-carbon-900/90 border-emerald-500/40 text-carbon-200'
                      : 'bg-carbon-950/40 border-carbon-800 text-carbon-500 opacity-50'
                  )}
                >
                  <div
                    className={cn(
                      'p-1.5 rounded-lg shrink-0 mt-0.5',
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : isPast
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-carbon-800 text-carbon-600'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold leading-tight truncate">
                      {stage.label}
                    </div>
                    <div className="text-[10px] font-sans text-carbon-400 truncate">
                      {isCurrent ? 'Running...' : isPast ? 'Complete' : 'Queued'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Telemetry Stream */}
        <div className="w-full bg-carbon-950 border border-carbon-750 rounded-xl p-3.5 font-mono text-left text-xs space-y-1 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-carbon-500 pb-1 border-b border-carbon-800">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Terminal className="w-3.5 h-3.5" /> NEURAL TELEMETRY STREAM
            </span>
            <span className="text-emerald-400 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ACTIVE
            </span>
          </div>

          <div className="pt-1.5 space-y-1 text-[11px]">
            <div className="text-carbon-400">
              &gt; TARGET OBJECTIVE: <span className="text-cyan-300 uppercase">{goalName}</span>
            </div>
            <div className="text-cyan-300 flex items-center gap-2">
              <span className="text-cyan-500">&gt;</span>
              <span className="truncate">{TELEMETRY_STREAM[logIndex]}</span>
              <span className="w-1.5 h-3 bg-cyan-400 animate-pulse ml-auto shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
