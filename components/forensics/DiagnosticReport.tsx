'use client';

import React, { useState } from 'react';
import {
  Activity,
  Download,
  Printer,
  RotateCcw,
  Sparkles,
  Share2,
  FileCheck2,
  Calendar,
  Clock,
  AlignLeft,
  FileText,
  RefreshCw,
  Layers,
  MessageSquare,
  Repeat2,
  Heart,
  Eye,
  Bookmark,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { SocialXRayAnalysisResult } from '@/lib/analysis/types';
import { UploadedFileState } from '@/types/analysis';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
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

  return (
    <div className="space-y-10 animate-fade-in print:space-y-6">
      {/* 1. Analysis Screen Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-carbon-900 border border-carbon-750 rounded-2xl shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              SOCIAL X-RAY
            </span>
            <span className="text-carbon-600 font-mono text-xs">•</span>
            <span className="font-mono text-xs text-white font-bold uppercase tracking-wider">
              FORENSIC DOSSIER
            </span>
            <Badge variant="cyan" size="sm" className="font-mono">
              {targetGoal.toUpperCase()} GOAL
            </Badge>
            {uploadedFile && (
              <Badge
                variant={uploadedFile.source === 'demo' ? 'amber' : uploadedFile.source === 'pdf' ? 'red' : 'cyan'}
                size="sm"
                className="font-mono"
              >
                {uploadedFile.source === 'demo' ? 'DEMO POST' : uploadedFile.source.toUpperCase()}
              </Badge>
            )}
            {report.contentInventory?.captionStatus === 'NOT_DETECTED' && (
              <Badge variant="cyan" size="sm" className="font-mono">
                VISUAL POST
              </Badge>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            GROUNDED FORENSIC AUDIT REPORT
          </h1>

          {/* Telemetry metadata chips */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-carbon-400 pt-0.5">
            {uploadedFile?.name && (
              <>
                <span className="flex items-center gap-1.5 text-carbon-200">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <strong className="font-normal truncate max-w-[200px] sm:max-w-xs">
                    {uploadedFile.name}
                  </strong>
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-carbon-500" />
              {wordCount > 0 ? `${wordCount} words` : 'Visual-only post (0 caption words)'}
            </span>
            {wordCount > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-carbon-500" />
                  ~{readingTimeSeconds}s read time
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            leftIcon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
            className="text-xs font-mono text-carbon-200"
            aria-label="Export complete analysis dossier as JSON"
          >
            {downloadSuccess ? 'Exported!' : 'Export JSON'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5 text-carbon-400" />}
            className="text-xs font-mono text-carbon-200 hidden sm:inline-flex"
            aria-label="Print or save forensic dossier as PDF"
          >
            Print
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onReanalyze}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-cyan-400" />}
            className="text-xs font-mono text-carbon-200"
            aria-label="Re-run forensic AI analysis on this post"
          >
            Re-Analyze
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-carbon-950" />}
            className="text-xs font-mono"
            aria-label="Clear current report and analyze another post"
          >
            Analyze Another
          </Button>
        </div>
      </div>

      {/* 01 — CONTENT SNAPSHOT (Observed Facts) */}
      <div className="p-5 bg-carbon-900 border border-carbon-750 rounded-2xl font-mono text-xs space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="font-bold text-cyan-400 uppercase tracking-wider text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> 01 — CONTENT SNAPSHOT
          </span>
          <Badge variant="cyan" size="sm" className="font-mono">
            OBSERVED FACTS
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {observedFacts.map((fact, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-carbon-950/80 border border-carbon-800 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span className="text-carbon-200 font-sans leading-relaxed text-xs">{fact}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 02 — PERFORMANCE EVIDENCE (Observed Metrics) */}
      {hasObservedMetrics && metrics && (
        <div className="p-5 bg-carbon-900 border border-cyan-900/50 rounded-2xl font-mono text-xs space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300 uppercase tracking-wider text-xs flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" /> 02 — PERFORMANCE EVIDENCE
            </span>
            <Badge variant="cyan" size="sm" className="font-mono">
              OBSERVED METRICS
            </Badge>
          </div>
          <p className="text-[11px] text-carbon-400 font-sans">
            Facts directly extracted from interface counters. These are historical observations, not AI predictions.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {metrics.replies !== null && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-carbon-950/90 border border-carbon-800">
                <MessageSquare className="w-4 h-4 text-carbon-400" />
                <div>
                  <span className="text-[10px] text-carbon-400 block uppercase">Replies (Observed)</span>
                  <span className="font-bold text-white text-lg">{metrics.replies}</span>
                </div>
              </div>
            )}

            {metrics.reposts !== null && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-carbon-950/90 border border-carbon-800">
                <Repeat2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-carbon-400 block uppercase">Reposts (Observed)</span>
                  <span className="font-bold text-white text-lg">{metrics.reposts}</span>
                </div>
              </div>
            )}

            {metrics.likes !== null && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-carbon-950/90 border border-carbon-800">
                <Heart className="w-4 h-4 text-rose-400" />
                <div>
                  <span className="text-[10px] text-carbon-400 block uppercase">Likes (Observed)</span>
                  <span className="font-bold text-white text-lg">{metrics.likes}</span>
                </div>
              </div>
            )}

            {metrics.views !== null && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-carbon-950/90 border border-carbon-800">
                <Eye className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-[10px] text-carbon-400 block uppercase">Views (Observed)</span>
                  <span className="font-bold text-white text-lg">{metrics.views}</span>
                </div>
              </div>
            )}
          </div>

          {/* Observable Descriptive Ratios */}
          {report.descriptiveRatios && report.descriptiveRatios.length > 0 && (
            <div className="pt-3 border-t border-carbon-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Observed Descriptive Ratios:
                </span>
                <span className="text-[10px] text-carbon-500 font-mono">Historical descriptive rates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {report.descriptiveRatios.map((ratio, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-carbon-950/80 border border-carbon-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-carbon-300 font-sans font-semibold">{ratio.metric}</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">{ratio.value}</span>
                    </div>
                    <div className="text-[10px] text-carbon-500 font-mono">
                      {ratio.numerator} / {ratio.denominator}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-carbon-500 font-sans italic pt-1">
                Calculated from visible platform counters at time of capture. Multiple unmeasured factors influence performance; the screenshot alone cannot establish causation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 03 & 04 — OBJECTIVE FIT & CORE DIAGNOSTIC SIGNALS */}
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
      />

      {/* 05 — PRIMARY FRICTION MAP */}
      <FrictionMap
        frictionPoints={report.frictionPoints}
        fullPostText={originalText || report.repair.original || '[Visual-only post]'}
      />

      {/* 06 — STRENGTHS & POST AUTOPSY */}
      <PostAutopsy autopsy={report.postAutopsy} strengths={report.strengths} />

      {/* 07 — CONVERSATION DNA */}
      <ConversationDNA dna={report.conversationDNA} />

      {/* 08 — RECOMMENDED REPAIR */}
      <RepairDiff repair={report.repair} />

      {/* Platform Variants (LinkedIn, Instagram, TikTok) */}
      <PlatformVariants variants={report.platformVariants} />

      {/* Goal-Based Adaptive Strategy */}
      <GoalAdaptiveCard recommendation={report.goalRecommendation} />

      {/* 09 — LIMITATIONS & CONFIDENCE */}
      <div className="p-5 rounded-2xl bg-carbon-950 border border-carbon-800 space-y-4 font-mono text-xs shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="font-bold text-carbon-200 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" /> 09 — LIMITATIONS &amp; CONFIDENCE
            </span>
            <span className="text-[11px] text-carbon-400 font-sans block">
              What the screenshot cannot establish &amp; confidence ratings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-carbon-400">Overall Diagnostic Confidence:</span>
            <Badge
              variant={report.confidence?.level === 'HIGH' ? 'emerald' : report.confidence?.level === 'MEDIUM' ? 'amber' : 'red'}
              size="sm"
            >
              {report.confidence?.level || 'HIGH'}
            </Badge>
          </div>
        </div>

        <p className="text-carbon-300 text-xs font-sans leading-relaxed">
          {report.confidence?.reason || 'Diagnostics based directly on detected visual elements and verified content inventory.'}
        </p>

        {/* Confidence Domains Breakdown */}
        {report.confidence?.breakdown && report.confidence.breakdown.length > 0 && (
          <div className="pt-2 border-t border-carbon-800/80 space-y-2">
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">
              Confidence By Analysis Domain:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {report.confidence.breakdown.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-carbon-900/80 border border-carbon-800 flex items-center justify-between gap-2">
                  <span className="text-carbon-200 font-sans text-xs">{item.domain}</span>
                  <Badge
                    variant={item.level === 'HIGH' ? 'emerald' : item.level === 'MEDIUM' ? 'amber' : 'red'}
                    size="sm"
                    className="font-mono text-[9px] py-0 px-1.5 uppercase"
                  >
                    {item.level}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {report.limitations && report.limitations.length > 0 && (
          <div className="pt-2 border-t border-carbon-800/80 space-y-1">
            <span className="text-[10px] text-carbon-500 uppercase tracking-wider block">
              Forensic Boundary Notes:
            </span>
            <ul className="space-y-1 text-[11px] text-carbon-400 font-sans list-disc list-inside">
              {report.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Re-scan Bar */}
      <div className="pt-6 border-t border-carbon-800 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="text-xs font-mono text-carbon-500">
          SOCIAL X-RAY LAB • GROUNDED AUDIENCE PSYCHOLOGY FORENSICS
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={onReanalyze}
            leftIcon={<RefreshCw className="w-4 h-4 text-cyan-400" />}
            className="flex-1 sm:flex-none text-xs font-mono"
          >
            Re-Analyze Post
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onReset}
            leftIcon={<RotateCcw className="w-4 h-4 text-carbon-950" />}
            className="flex-1 sm:flex-none text-xs font-mono"
          >
            Analyze Another Post
          </Button>
        </div>
      </div>
    </div>
  );
};
