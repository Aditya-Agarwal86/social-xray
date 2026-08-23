'use client';

import React from 'react';
import { Target, CheckCircle2, TrendingUp, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { GoalRecommendationData } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface GoalAdaptiveCardProps {
  recommendation: GoalRecommendationData;
}

export const GoalAdaptiveCard: React.FC<GoalAdaptiveCardProps> = ({ recommendation }) => {
  if (!recommendation) return null;

  return (
    <Card variant="accent" className="p-5 sm:p-6 bg-carbon-900/90 border-cyan-500/40 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-carbon-800 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-mono font-bold uppercase tracking-wider text-white">
            Goal-Adaptive Strategic Tuning
          </h3>
          <Badge variant="cyan" size="sm">
            {recommendation.selectedGoal.toUpperCase()} OBJECTIVE
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reasoning */}
        <div className="p-4 rounded-xl bg-carbon-950/80 border border-carbon-800 space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Goal Alignment Reasoning:
          </span>
          <p className="text-xs text-carbon-200 font-sans leading-relaxed">
            {recommendation.reasoning}
          </p>
        </div>

        {/* Highest-Priority Change */}
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Highest-Priority Strategic Change:
          </span>
          <p className="text-xs text-white font-mono leading-relaxed font-semibold">
            {recommendation.recommendedChange}
          </p>
        </div>
      </div>
    </Card>
  );
};
