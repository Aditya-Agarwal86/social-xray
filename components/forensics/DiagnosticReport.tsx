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

  const wordCount = originalText.split(/\s+/).filter(Boolean).length;
  const readingTimeSeconds = Math.max(5, Math.ceil((wordCount / 200) * 60));

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
              POST ANALYSIS
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
          </div>

          <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            CONTENT FORENSIC AUDIT
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
              {wordCount} words
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-carbon-500" />
              ~{readingTimeSeconds}s read time
            </span>
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
          >
            {downloadSuccess ? 'Exported!' : 'Export JSON'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5 text-carbon-400" />}
            className="text-xs font-mono text-carbon-200 hidden sm:inline-flex"
          >
            Print
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onReanalyze}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-cyan-400" />}
            className="text-xs font-mono text-carbon-200"
          >
            Re-Analyze
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-carbon-950" />}
            className="text-xs font-mono"
          >
            Analyze Another
          </Button>
        </div>
      </div>

      {/* 2. Overall X-Ray Score & Signal Cards */}
      <MetricsGrid
        overallScore={report.overallScore}
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

      {/* 3. Engagement Friction Map */}
      <FrictionMap frictionPoints={report.frictionPoints} fullPostText={originalText} />

      {/* 4. Post Autopsy */}
      <PostAutopsy autopsy={report.postAutopsy} />

      {/* 5. Conversation DNA Sequence */}
      <ConversationDNA dna={report.conversationDNA} />

      {/* 6. Surgical Repair (Original vs Improved) */}
      <RepairDiff repair={report.repair} />

      {/* 7. Platform Variants (LinkedIn, Instagram, TikTok) */}
      <PlatformVariants variants={report.platformVariants} />

      {/* 8. Goal-Based Recommendation */}
      <GoalAdaptiveCard recommendation={report.goalRecommendation} />

      {/* Bottom Re-scan Bar */}
      <div className="pt-6 border-t border-carbon-800 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="text-xs font-mono text-carbon-500">
          SOCIAL X-RAY LAB • HIGH-PRECISION AUDIENCE FORENSICS
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
