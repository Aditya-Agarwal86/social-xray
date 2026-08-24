'use client';

import React, { useState } from 'react';
import {
  Activity,
  Download,
  Printer,
  RotateCcw,
  Calendar,
  Clock,
  AlignLeft,
  RefreshCw,
  MessageSquare,
  Repeat2,
  Heart,
  Eye,
  CheckCircle2,
  Info,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { SocialXRayAnalysisResult } from '@/lib/analysis/types';
import { UploadedFileState } from '@/types/analysis';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MetricsGrid } from './MetricsGrid';
import { FrictionMap } from './FrictionMap';
import { PostAutopsy } from './PostAutopsy';
import { ConversationDNA } from './ConversationDNA';
import { RepairDiff } from './RepairDiff';
import { PlatformVariants } from './PlatformVariants';
import { GoalAdaptiveCard } from './GoalAdaptiveCard';

interface DiagnosticReportProps {
  report: SocialXRayAnalysisResult;
  uploadedFile: UploadedFileState | null;
  targetGoal: string;
  originalText: string;
  onReset: () => void;
  onReanalyze: () => void;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  report,
  uploadedFile,
  targetGoal,
  originalText,
  onReset,
  onReanalyze,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportJson = () => {
    const exportData = {
      analyzedAt: new Date().toISOString(),
      sourceFile: uploadedFile?.name || 'Direct Copy Input',
      sourceType: uploadedFile?.source || 'text',
      targetGoal,
      analysis: report,
    };

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `social-xray-analysis-${Date.now().toString().slice(-6)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const wordCount = originalText ? originalText.split(/\s+/).filter(Boolean).length : 0;
  const readingTimeSeconds = Math.max(5, Math.ceil((wordCount / 200) * 60));

  const metrics = report.observedMetrics || report.contentInventory?.engagementMetrics;
  const hasObservedMetrics = Boolean(
    metrics &&
    (metrics.replies !== null || metrics.reposts !== null || metrics.likes !== null || metrics.views !== null || metrics.saves !== null)
  );

  const observedFacts = report.observedFacts || [];

  // Compute 10-Dimension Executive Verdict Summary
  const allDimensions = [
    { name: 'Hook Velocity', score: report.hook.score },
    { name: 'Clarity & Comprehension', score: report.clarity.score },
    { name: 'Cognitive Ease', score: report.cognitiveLoad.score },
    { name: 'Emotional Resonance', score: report.emotion.score },
    { name: 'Curiosity Gap', score: report.curiosity.score },
    { name: 'Conversation Catalyst', score: report.conversation.score },
    { name: 'Social Currency', score: report.shareability.score },
    { name: 'CTA Friction', score: report.cta.score },
    { name: 'Audience Value', score: report.audienceValue.score },
    { name: 'Attention Resistance', score: report.attentionResistance?.score ?? 70 },
  ];
  const strongestDimension = allDimensions.reduce(
    (max, curr) => (curr.score > max.score ? curr : max),
    allDimensions[0]
  );

  const primaryFrictionSummary =
    report.postAutopsy?.primaryFriction ||
    report.frictionPoints[0]?.explanation ||
    'Limited explicit conversational trigger in the content.';

  const biggestOpportunitySummary =
    report.postAutopsy?.treatment ||
    report.goalRecommendation?.reasoning ||
    'Convert viewpoint or visual asset into an active, open-ended question.';

  const highestPriorityActionSummary =
    report.goalRecommendation?.recommendedChange ||
    report.repair?.recommended ||
    'Add a grounded question that invites audience perspectives.';

  const overallSeverity =
    report.overallScore >= 80 ? 'Optimal' : report.overallScore >= 60 ? 'Moderate' : 'Critical Attention Friction';

  return (
    <div className="space-y-8 animate-fade-in print:space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* 1. Analysis Screen Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Social X-Ray
            </span>
            <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
            <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold uppercase tracking-wider">
              Diagnostic Dossier
            </span>
            <Badge variant="cyan" size="sm">
              {targetGoal.toUpperCase()} GOAL
            </Badge>
            {uploadedFile && (
              <Badge
                variant={uploadedFile.source === 'demo' ? 'amber' : uploadedFile.source === 'pdf' ? 'red' : 'cyan'}
                size="sm"
              >
                {uploadedFile.source === 'demo' ? 'DEMO POST' : uploadedFile.source.toUpperCase()}
              </Badge>
            )}
            {report.contentInventory?.captionStatus === 'NOT_DETECTED' && (
              <Badge variant="cyan" size="sm">
                VISUAL POST
              </Badge>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Grounded Forensic Audit Report
          </h1>

          {/* Telemetry metadata chips */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ~{readingTimeSeconds}s reading load
            </span>
            {wordCount > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5" />
                  {wordCount} words analyzed
                </span>
              </>
            )}
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
            aria-label="Export complete diagnostic report as structured JSON"
          >
            {downloadSuccess ? 'Exported!' : 'Export JSON'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            className="text-xs"
            aria-label="Print or save PDF report"
          >
            Print
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onReanalyze}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
            className="text-xs"
            aria-label="Re-analyze this post"
          >
            Re-Analyze
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-white dark:text-slate-950" />}
            className="text-xs font-semibold"
            aria-label="Analyze Another"
          >
            Analyze Another
          </Button>
        </div>
      </div>

      {/* 01 — CONTENT SNAPSHOT (Observed Facts & Ground Truth) */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="font-semibold text-sky-700 dark:text-sky-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" /> 01 — Content Snapshot
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              Facts directly detected from the screenshot or verified metadata. Unobserved motivations and assumptions are strictly excluded.
            </p>
          </div>
          <Badge variant="cyan" size="sm">
            Observed Facts (Ground Truth)
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {observedFacts.map((fact, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 mt-1 shrink-0" />
              <span className="text-slate-700 dark:text-slate-200 leading-relaxed text-xs">{fact}</span>
            </div>
          ))}
        </div>

        {/* Observed Performance Metrics (if present in asset) */}
        {hasObservedMetrics && metrics && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Observed Performance Counters
              </span>
              <Badge variant="cyan" size="sm" className="text-[10px]">
                Historical Evidence (Observed)
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Extracted directly from visible interface counters. Historical descriptive evidence, not AI predictions or causal claims.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {metrics.replies !== null && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Replies</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{metrics.replies}</span>
                  </div>
                </div>
              )}

              {metrics.reposts !== null && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <Repeat2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Reposts</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{metrics.reposts}</span>
                  </div>
                </div>
              )}

              {metrics.likes !== null && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Likes</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{metrics.likes}</span>
                  </div>
                </div>
              )}

              {metrics.views !== null && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <Eye className="w-4 h-4 text-sky-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Views</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{metrics.views}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Observable Descriptive Ratios */}
            {report.descriptiveRatios && report.descriptiveRatios.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Observed Descriptive Rates:
                  </span>
                  <span className="text-[11px] text-slate-400">Platform counter ratios at time of capture</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {report.descriptiveRatios.map((ratio, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{ratio.metric}</span>
                        <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">{ratio.value}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {ratio.numerator} / {ratio.denominator}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Calculated from visible platform counters at time of capture. Unmeasured factors influence performance; the screenshot alone cannot establish causation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 02 — EXECUTIVE VERDICT */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="font-semibold text-sky-700 dark:text-sky-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
            <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" /> 02 — Executive Verdict
          </span>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                report.overallScore >= 80
                  ? 'emerald'
                  : report.overallScore >= 60
                  ? 'amber'
                  : 'red'
              }
              size="sm"
              className="font-semibold uppercase"
            >
              {overallSeverity}
            </Badge>
            <span className="text-slate-900 dark:text-white font-bold text-sm">{report.overallScore} / 100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-rose-600 dark:text-rose-400 block">
              Primary Friction (Inference):
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {primaryFrictionSummary}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">
              Strongest Dimension (Inference):
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">{strongestDimension.name}</strong> — {strongestDimension.score}/100
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-sky-600 dark:text-sky-400 block">
              Biggest Opportunity (Inference):
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {biggestOpportunitySummary}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 block">
              Highest-Priority Action (Recommendation):
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {highestPriorityActionSummary}
            </p>
          </div>
        </div>
      </div>

      {/* 03 & 04 — OBJECTIVE FIT & 10 CORE FORENSIC DIMENSIONS */}
      <MetricsGrid
        overallScore={report.overallScore}
        targetGoal={targetGoal}
        goalFit={report.goalFit}
        hook={report.hook}
        clarity={report.clarity}
        cognitiveLoad={report.cognitiveLoad}
        emotion={report.emotion}
        curiosity={report.curiosity}
        conversation={report.conversation}
        shareability={report.shareability}
        cta={report.cta}
        audienceValue={report.audienceValue}
        attentionResistance={report.attentionResistance}
      />

      {/* 05 — PRIMARY FRICTION MAP */}
      <FrictionMap
        frictionPoints={report.frictionPoints}
        fullPostText={originalText || report.repair.original || '[Visual-only post]'}
      />

      {/* 06 — STRENGTHS & POST AUTOPSY */}
      <PostAutopsy
        autopsy={report.postAutopsy}
        strengths={report.strengths}
        targetGoal={targetGoal}
      />

      {/* 07 — CONVERSATION DNA */}
      <ConversationDNA dna={report.conversationDNA} />

      {/* 08 — RECOMMENDED REPAIR */}
      <RepairDiff repair={report.repair} />

      {/* 09 — CROSS-PLATFORM ADAPTATION */}
      <PlatformVariants variants={report.platformVariants} />

      {/* 10 — GOAL-ADAPTIVE STRATEGIC TUNING */}
      <GoalAdaptiveCard recommendation={report.goalRecommendation} />

      {/* 11 — LIMITATIONS & CONFIDENCE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" /> 11 — Limitations &amp; Confidence Framework
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Clear distinction between text extraction quality, visual evidence, and diagnostic certainty
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Overall Diagnostic Confidence:</span>
            <Badge
              variant={report.confidence?.level === 'HIGH' ? 'emerald' : report.confidence?.level === 'MEDIUM' ? 'amber' : 'red'}
              size="sm"
            >
              {report.confidence?.level || 'HIGH'}
            </Badge>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
          {report.confidence?.reason || 'Diagnostics based directly on detected visual elements, layout composition, and verified content inventory.'}
        </p>

        {/* Confidence Domains Hierarchy */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-semibold">
            Confidence By Analysis Domain:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200 font-semibold text-xs">Extraction Confidence</span>
                <Badge variant={uploadedFile?.confidence && uploadedFile.confidence < 60 ? 'amber' : 'emerald'} size="sm">
                  {uploadedFile?.confidence && uploadedFile.confidence < 60 ? 'Medium' : 'High'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Accuracy of OCR/PDF text recognition from the uploaded asset.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200 font-semibold text-xs">Visual Analysis</span>
                <Badge variant="emerald" size="sm">
                  High
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Certainty in interpreting visible imagery, layout hierarchy, and design stopping power.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-200 font-semibold text-xs">Diagnostic Confidence</span>
                <Badge variant={report.confidence?.level === 'HIGH' ? 'emerald' : report.confidence?.level === 'MEDIUM' ? 'amber' : 'red'} size="sm">
                  {report.confidence?.level || 'High'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Grounding of findings in cognitive psychology and copywriting principles.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
            Note: Imperfect OCR text extraction does not degrade visual diagnostic validity when the underlying graphic and layout are clear.
          </p>
        </div>

        {/* Forensic Boundary Notes */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wider block font-semibold">
            Forensic Boundary Notes (What the screenshot cannot establish):
          </span>
          <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400 list-disc list-inside">
            {report.limitations && report.limitations.length > 0 ? (
              report.limitations.map((lim, idx) => <li key={idx}>{lim}</li>)
            ) : (
              <>
                <li>Exact unrendered comments and shares cannot be determined beyond visible platform counters.</li>
                <li>Audio quality or background music cannot be evaluated from a static screenshot.</li>
                <li>Subsequent carousel frames or video footage beyond this view cannot be assessed.</li>
                <li>Underlying audience psychological motivations cannot be proven; findings represent grounded diagnostic inferences.</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom Action Bar (Non-redundant navigation) */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Diagnostic Dossier Complete • 11 Forensic Modules Synthesized</span>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={onReanalyze}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
            className="flex-1 sm:flex-none text-xs"
          >
            Re-Analyze Post
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-white dark:text-slate-950" />}
            className="flex-1 sm:flex-none text-xs font-semibold"
          >
            Analyze Another Post
          </Button>
        </div>
      </div>
    </div>
  );
};
