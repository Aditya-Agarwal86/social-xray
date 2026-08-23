'use client';

import React from 'react';
import { Skull, AlertTriangle, Sparkles, Stethoscope, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PostAutopsyData } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { XRayScanOverlay } from '../ui/XRayScanOverlay';

interface PostAutopsyProps {
  autopsy: PostAutopsyData;
}

export const PostAutopsy: React.FC<PostAutopsyProps> = ({ autopsy }) => {
  if (!autopsy) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-mono font-bold uppercase tracking-wider text-white">
            Post Autopsy Dossier
          </h3>
        </div>
        <Badge variant="cyan" size="sm">
          CLINICAL PATHOLOGY
        </Badge>
      </div>

      {/* Hero Cause of Death Banner */}
      <Card className="p-5 sm:p-6 bg-gradient-to-r from-rose-950/70 via-carbon-900 to-carbon-900 border-rose-500/50 space-y-2 relative overflow-hidden shadow-lg">
        <XRayScanOverlay active={false} showCorners={true} />
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider relative z-10">
          <Skull className="w-4 h-4 text-rose-400 animate-pulse" />
          Cause of Attention Death
        </div>
        <h4 className="text-base sm:text-lg font-mono font-bold text-white leading-snug relative z-10">
          {autopsy.causeOfDeath}
        </h4>
        <p className="text-xs text-carbon-300 font-sans leading-relaxed relative z-10">
          The decisive friction point where reader attention dropped below the cognitive retention threshold.
        </p>
      </Card>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Primary Failure */}
        <Card className="p-5 bg-carbon-900/90 border-rose-900/50 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Primary Failure Mechanism
            </div>
            <h5 className="text-sm font-mono font-bold text-white leading-snug">
              {autopsy.primaryFailure}
            </h5>
          </div>
          <p className="text-xs text-carbon-400 font-sans leading-relaxed pt-1 border-t border-carbon-800/60">
            The fundamental structural flaw breaking feed momentum.
          </p>
        </Card>

        {/* 2. Secondary Failure */}
        <Card className="p-5 bg-carbon-900/90 border-amber-900/50 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Secondary Drag Bottleneck
            </div>
            <h5 className="text-sm font-mono font-bold text-white leading-snug">
              {autopsy.secondaryFailure}
            </h5>
          </div>
          <p className="text-xs text-carbon-400 font-sans leading-relaxed pt-1 border-t border-carbon-800/60">
            Secondary friction point preventing comments, saves, or shares.
          </p>
        </Card>

        {/* 3. Hidden Strength */}
        <Card className="p-5 bg-carbon-900/90 border-emerald-900/50 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Hidden Core Strength
            </div>
            <h5 className="text-sm font-mono font-bold text-white leading-snug">
              {autopsy.hiddenStrength}
            </h5>
          </div>
          <p className="text-xs text-carbon-400 font-sans leading-relaxed pt-1 border-t border-carbon-800/60">
            The salvageable intellectual foundation worth preserving during repair.
          </p>
        </Card>

        {/* 4. Recommended Treatment */}
        <Card className="p-5 bg-carbon-900/90 border-cyan-900/50 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              Recommended Treatment Protocol
            </div>
            <p className="text-xs text-carbon-100 font-sans leading-relaxed font-medium">
              {autopsy.treatment}
            </p>
          </div>
          <p className="text-xs text-carbon-400 font-sans leading-relaxed pt-1 border-t border-carbon-800/60">
            Actionable prescription to restore reader engagement.
          </p>
        </Card>
      </div>
    </div>
  );
};
