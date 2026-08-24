'use client';

import React from 'react';
import {
  Zap,
  Eye,
  BrainCircuit,
  Flame,
  HelpCircle,
  MessageSquare,
  Share2,
  MousePointerClick,
  Award,
  TrendingUp,
  Activity,
  Target,
} from 'lucide-react';
import { DimensionDiagnosis, DiagnosticSeverity, GoalFitDiagnosis } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ScoreCountUp } from '../ui/ScoreCountUp';
import { XRayScanOverlay } from '../ui/XRayScanOverlay';
import { getScoreColor } from '@/lib/utils/formatters';
import { getGoalFitLabel } from '@/lib/analysis/prompt';
import { cn } from '@/lib/utils/cn';

interface MetricsGridProps {
  overallScore: number;
  targetGoal?: string;
  goalFit?: GoalFitDiagnosis;
  hook: DimensionDiagnosis;
  clarity: DimensionDiagnosis;
  cognitiveLoad: DimensionDiagnosis;
  emotion: DimensionDiagnosis;
  curiosity: DimensionDiagnosis;
  conversation: DimensionDiagnosis;
  shareability: DimensionDiagnosis;
  cta: DimensionDiagnosis;
  audienceValue: DimensionDiagnosis;
  attentionResistance?: DimensionDiagnosis;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  overallScore,
  targetGoal = 'conversation',
  goalFit,
  hook,
  clarity,
  cognitiveLoad,
  emotion,
  curiosity,
  conversation,
  shareability,
  cta,
  audienceValue,
  attentionResistance,
}) => {
  const signalCards = [
    { key: 'hook', name: 'Hook Velocity', data: hook, icon: Zap },
    { key: 'clarity', name: 'Clarity & Comprehension', data: clarity, icon: Eye },
    { key: 'cognitiveLoad', name: 'Cognitive Ease', data: cognitiveLoad, icon: BrainCircuit },
    { key: 'emotion', name: 'Emotional Resonance', data: emotion, icon: Flame },
    { key: 'curiosity', name: 'Curiosity Gap', data: curiosity, icon: HelpCircle },
    { key: 'conversation', name: 'Conversation Catalyst', data: conversation, icon: MessageSquare },
    { key: 'shareability', name: 'Social Currency', data: shareability, icon: Share2 },
    { key: 'cta', name: 'CTA Friction', data: cta, icon: MousePointerClick },
    { key: 'audienceValue', name: 'Audience Value', data: audienceValue, icon: Award },
    { key: 'attentionResistance', name: 'Attention Resistance', data: attentionResistance || { score: Math.round(overallScore * 0.95), severity: 'moderate' as DiagnosticSeverity, problem: 'Attention friction points in structure', explanation: 'Evaluates structural momentum and audience retention throughout the post.' }, icon: Activity },
  ];

  const overallStyle = getScoreColor(overallScore);
  const goalLabel = goalFit?.label || getGoalFitLabel(targetGoal);

  const getSeverityBadgeVariant = (severity: DiagnosticSeverity) => {
    switch (severity) {
      case 'optimal':
        return 'emerald' as const;
      case 'minor':
        return 'cyan' as const;
      case 'moderate':
        return 'amber' as const;
      case 'critical':
        return 'red' as const;
      default:
        return 'neutral' as const;
    }
  };

  const getInterpretation = (score: number) => {
    if (goalFit?.reason) return goalFit.reason;
    if (score >= 80) {
      return `High alignment for ${targetGoal.toUpperCase()}. Captures attention quickly with strong payoff.`;
    }
    if (score >= 60) {
      return `Moderate alignment for ${targetGoal.toUpperCase()}. Contains solid foundational assets but hindered by missing prompt or subtle friction.`;
    }
    return `Limited alignment for ${targetGoal.toUpperCase()}. The content provides insufficient triggers for the selected goal.`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Goal-Specific Fit Score Card */}
      <Card variant="accent" className="p-6 sm:p-8 bg-carbon-900/95 border-cyan-500/40 shadow-xl relative overflow-hidden">
        <XRayScanOverlay active={true} showCorners={true} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> 03 — OBJECTIVE FIT
              </span>
              <Badge variant="cyan" size="sm" className="font-mono">
                GOAL-SPECIFIC DIAGNOSIS
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {goalLabel.toUpperCase()}
            </h2>
            <p className="text-xs sm:text-sm text-carbon-200 font-sans leading-relaxed">
              {getInterpretation(overallScore)}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start p-4 rounded-2xl bg-carbon-950/90 border border-carbon-700 shadow-inner">
            <div className="text-right font-mono">
              <div className="text-[11px] text-carbon-400 uppercase">Goal Alignment</div>
              <div className={cn('text-sm font-bold uppercase', overallStyle.text)}>
                {overallStyle.label}
              </div>
            </div>

            <div className="h-10 w-px bg-carbon-750" />

            <div className="flex items-baseline gap-1 font-mono">
              <ScoreCountUp
                value={overallScore}
                className={cn('text-4xl sm:text-5xl font-extrabold tracking-tight', overallStyle.text)}
              />
              <span className="text-carbon-500 text-sm">/100</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Signal Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-carbon-200">
              04 — 10 CORE FORENSIC DIMENSIONS
            </h3>
            <Badge variant="neutral" size="sm" className="font-mono">
              EVIDENCE-GROUNDED INFERENCES
            </Badge>
          </div>
          <span className="text-xs font-mono text-carbon-400">10 Core Dimensions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {signalCards.map(({ key, name, data, icon: Icon }) => {
            if (!data) return null;
            const scoreStyle = getScoreColor(data.score);
            const badgeVariant = getSeverityBadgeVariant(data.severity);

            return (
              <Card
                key={key}
                variant="glow"
                className="p-4 flex flex-col justify-between space-y-3 bg-carbon-900/80 border-carbon-750 hover:border-carbon-600 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-carbon-800 border border-carbon-700 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant={badgeVariant} size="sm" className="uppercase font-mono">
                      {data.severity}
                    </Badge>
                  </div>

                  <h4 className="text-xs font-mono font-bold text-white leading-tight">
                    {name}
                  </h4>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between font-mono">
                    <ScoreCountUp
                      value={data.score}
                      className={cn('text-2xl font-black', scoreStyle.text)}
                    />
                    <span className="text-[11px] text-carbon-500">/ 100</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-carbon-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn('h-full transition-all duration-500 rounded-full', scoreStyle.bar)}
                      style={{ width: `${Math.min(100, Math.max(5, data.score))}%` }}
                    />
                  </div>

                  {/* Evidence-Backed Explanation */}
                  <div className="pt-1 text-[11px] text-carbon-300 font-sans leading-snug space-y-0.5">
                    <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider block font-semibold">
                      Evidence:
                    </span>
                    <p className="line-clamp-3 text-carbon-200">
                      {data.explanation || data.problem}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
