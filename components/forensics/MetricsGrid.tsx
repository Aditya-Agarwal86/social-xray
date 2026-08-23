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
} from 'lucide-react';
import { DimensionDiagnosis, DiagnosticSeverity } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ScoreCountUp } from '../ui/ScoreCountUp';
import { XRayScanOverlay } from '../ui/XRayScanOverlay';
import { getScoreColor } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

interface MetricsGridProps {
  overallScore: number;
  hook: DimensionDiagnosis;
  clarity: DimensionDiagnosis;
  cognitiveLoad: DimensionDiagnosis;
  emotion: DimensionDiagnosis;
  curiosity: DimensionDiagnosis;
  conversation: DimensionDiagnosis;
  shareability: DimensionDiagnosis;
  cta: DimensionDiagnosis;
  audienceValue: DimensionDiagnosis;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  overallScore,
  hook,
  clarity,
  cognitiveLoad,
  emotion,
  curiosity,
  conversation,
  shareability,
  cta,
  audienceValue,
}) => {
  const signalCards = [
    { key: 'hook', name: 'Hook Velocity', data: hook, icon: Zap },
    { key: 'clarity', name: 'Clarity', data: clarity, icon: Eye },
    { key: 'cognitiveLoad', name: 'Cognitive Ease', data: cognitiveLoad, icon: BrainCircuit },
    { key: 'emotion', name: 'Emotional Impact', data: emotion, icon: Flame },
    { key: 'curiosity', name: 'Curiosity Gap', data: curiosity, icon: HelpCircle },
    { key: 'conversation', name: 'Conversation Potential', data: conversation, icon: MessageSquare },
    { key: 'shareability', name: 'Shareability', data: shareability, icon: Share2 },
    { key: 'cta', name: 'Call to Action', data: cta, icon: MousePointerClick },
    { key: 'audienceValue', name: 'Audience Value', data: audienceValue, icon: Award },
  ];

  const overallStyle = getScoreColor(overallScore);

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
    if (score >= 80) {
      return 'Exceptional stopping power and cognitive flow. The post captures attention quickly and provides strong debate and sharing incentives.';
    }
    if (score >= 65) {
      return 'Solid premise with moderate friction points. Minor structural bottlenecks in the opening lines or closing question limit viral velocity.';
    }
    return 'Critical attention dropoff detected. The post suffers from slow hook velocity, cognitive drag, or inert call-to-action mechanics.';
  };

  return (
    <div className="space-y-6">
      {/* 1. Overall X-Ray Score Card */}
      <Card variant="accent" className="p-6 sm:p-8 bg-carbon-900/95 border-cyan-500/40 shadow-xl relative overflow-hidden">
        <XRayScanOverlay active={true} showCorners={true} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
                FORENSIC SURVIVABILITY SCORE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              OVERALL POST HEALTH
            </h2>
            <p className="text-xs sm:text-sm text-carbon-200 font-sans leading-relaxed">
              {getInterpretation(overallScore)}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start p-4 rounded-2xl bg-carbon-950/90 border border-carbon-700 shadow-inner">
            <div className="text-right font-mono">
              <div className="text-[11px] text-carbon-400 uppercase">Diagnosis</div>
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
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-carbon-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Core Diagnostic Signals
          </h3>
          <span className="text-xs font-mono text-carbon-400">9 Core Dimensions</span>
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

                  {/* One-Line Explanation */}
                  <p className="text-[11px] text-carbon-300 font-sans leading-snug pt-1 line-clamp-2">
                    {data.explanation}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
