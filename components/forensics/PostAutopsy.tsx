'use client';

import React from 'react';
import { AlertTriangle, Sparkles, Stethoscope, CheckCircle2, ShieldAlert, Zap } from 'lucide-react';
import { GroundedPostAutopsy, PostAutopsyData, StrengthItem } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { XRayScanOverlay } from '../ui/XRayScanOverlay';

interface PostAutopsyProps {
  autopsy: (GroundedPostAutopsy & PostAutopsyData) | any;
  strengths?: StrengthItem[];
}

export const PostAutopsy: React.FC<PostAutopsyProps> = ({ autopsy, strengths }) => {
  if (!autopsy) return null;

  const primaryFriction = autopsy.primaryFriction || autopsy.primaryFailure || autopsy.causeOfDeath || 'Limited conversation trigger';
  const secondaryFriction = autopsy.secondaryFriction || autopsy.secondaryFailure || 'No explicit CTA is visible';
  const hiddenStrength = autopsy.hiddenStrength || 'Strong visual presentation';
  const treatment = autopsy.treatment || 'Add a specific audience prompt aligned with the selected objective.';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-mono font-bold uppercase tracking-wider text-white">
            06 — STRENGTHS & POST AUTOPSY
          </h3>
        </div>
        <Badge variant="cyan" size="sm">
          FORENSIC AUTOPSY
        </Badge>
      </div>

      {/* Hero Primary Friction Banner */}
      <Card className="p-5 sm:p-6 bg-gradient-to-r from-amber-950/40 via-carbon-900 to-carbon-900 border-amber-500/50 space-y-2 relative overflow-hidden shadow-lg">
        <XRayScanOverlay active={false} showCorners={true} />
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider relative z-10">
          <Zap className="w-4 h-4 text-amber-400" />
          PRIMARY ENGAGEMENT FRICTION
        </div>
        <h4 className="text-base sm:text-lg font-mono font-bold text-white leading-snug relative z-10">
          {primaryFriction}
        </h4>
        <p className="text-xs text-carbon-300 font-sans leading-relaxed relative z-10">
          The main structural or psychological friction point dampening audience conversion.
        </p>
      </Card>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Primary Friction */}
        <Card className="p-5 bg-carbon-900/90 border-amber-900/40 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Primary Friction Point
            </div>
            <h5 className="text-sm font-mono font-bold text-white leading-snug">
              {primaryFriction}
            </h5>
          </div>
          <p className="text-xs text-carbon-400 font-sans leading-relaxed pt-1 border-t border-carbon-800/60">
            Identified barrier limiting audience response.
          </p>
        </Card>

        {/* 2. Secondary Friction */}
        <Card className="p-5 bg-carbon-900/90 border-carbon-750 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-carbon-300 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-carbon-400" />
              Secondary Friction Point
            </div>
            <h5 className="text-sm font-mono font-bold text-white leading-snug">
              {secondaryFriction}
            </h5>
          </div>
          <p className="text-xs text-carbon-400 font-sans leading-relaxed pt-1 border-t border-carbon-800/60">
            Secondary element that could be improved for higher conversion.
          </p>
        </Card>

        {/* 3. Hidden Strength */}
        <Card className="p-5 bg-carbon-900/90 border-emerald-900/40 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Hidden Strength
            </div>
            <h5 className="text-sm font-mono font-bold text-white leading-snug">
              {hiddenStrength}
            </h5>
          </div>
          <p className="text-xs text-carbon-400 font-sans leading-relaxed pt-1 border-t border-carbon-800/60">
            Strong foundational asset preserved in the recommendation.
          </p>
        </Card>

        {/* 4. Recommended Treatment */}
        <Card className="p-5 bg-carbon-900/90 border-cyan-900/40 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              Recommended Treatment
            </div>
            <p className="text-xs text-carbon-100 font-sans leading-relaxed font-medium">
              {treatment}
            </p>
          </div>
          <p className="text-xs text-carbon-400 font-sans leading-relaxed pt-1 border-t border-carbon-800/60">
            Actionable next step aligned with the selected objective.
          </p>
        </Card>
      </div>

      {/* Additional Strengths List if provided */}
      {strengths && strengths.length > 0 && (
        <div className="p-4 rounded-xl bg-carbon-950/80 border border-emerald-900/30 space-y-2">
          <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> OBSERVED ASSETS & ADVANTAGES
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {strengths.map((str, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-carbon-900/60 border border-carbon-800 text-xs">
                <span className="font-mono font-bold text-white block mb-0.5">{str.title}</span>
                <span className="text-carbon-400">{str.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
