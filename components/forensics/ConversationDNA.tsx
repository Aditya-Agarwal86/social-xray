'use client';

import React, { useState } from 'react';
import {
  Dna,
  MessageCircleQuestion,
  Users,
  Copy,
  Check,
  Activity,
  ArrowDown,
  MessageSquare,
} from 'lucide-react';
import { GroundedConversationDNA, ConversationDNAData } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ConversationDNAProps {
  dna: (GroundedConversationDNA & ConversationDNAData) | any;
}

export const ConversationDNA: React.FC<ConversationDNAProps> = ({ dna }) => {
  const [copiedQuestion, setCopiedQuestion] = useState(false);
  const [copiedFollowUp, setCopiedFollowUp] = useState(false);

  if (!dna) return null;

  const deliveredToFeed = dna.deliveredToFeed || 'Audience encounters post in feed while scrolling.';
  const audienceReaction = dna.audienceReaction || dna.likelyAudienceReaction || 'Passive visual appreciation.';
  const inducedAction = dna.inducedAction || dna.engagementType || 'Passive View / Like';
  const conversationOpportunity = dna.conversationOpportunity || dna.conversationPotential || 'No explicit conversation prompt is visible.';
  const replacementQuestion = dna.replacementQuestion || dna.betterQuestion || 'Which bouquet would you choose for someone special?';
  const followUpQuestion = dna.followUpQuestion || 'What do you look for first when buying flowers?';

  const handleCopyQuestion = () => {
    if (replacementQuestion) {
      navigator.clipboard.writeText(replacementQuestion);
      setCopiedQuestion(true);
      setTimeout(() => setCopiedQuestion(false), 1500);
    }
  };

  const handleCopyFollowUp = () => {
    if (followUpQuestion) {
      navigator.clipboard.writeText(followUpQuestion);
      setCopiedFollowUp(true);
      setTimeout(() => setCopiedFollowUp(false), 1500);
    }
  };

  return (
    <div className="space-y-3.5 font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            07 — Conversation DNA
          </h3>
          <Badge variant="violet" size="sm">
            Inference + Confidence
          </Badge>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Inferred cognitive cascade from feed appearance to response
        </span>
      </div>

      {/* Vertical Flow Diagram */}
      <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
        <div className="space-y-3">
          {/* Step 1: Post Input */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="p-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 font-mono text-xs font-bold w-6 h-6 flex items-center justify-center">
              01
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold block">
                  Post Delivered to Feed
                </span>
                <Badge variant="neutral" size="sm" className="text-[9px] py-0 px-1">
                  Observed Fact
                </Badge>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 pt-0.5">
                {deliveredToFeed}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-indigo-400 opacity-60" />
          </div>

          {/* Step 2: Inferred Audience Reaction */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40">
            <div className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0 font-mono text-xs font-bold w-6 h-6 flex items-center justify-center">
              02
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Inferred Audience Reaction
                </span>
                <Badge variant="violet" size="sm" className="text-[9px] py-0 px-1">
                  Inference · Medium
                </Badge>
              </div>
              <p className="text-xs text-indigo-900 dark:text-indigo-100 italic pt-0.5">
                &ldquo;{audienceReaction}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-indigo-400 opacity-60" />
          </div>

          {/* Step 3: Likely Engagement Path */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="p-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 font-mono text-xs font-bold w-6 h-6 flex items-center justify-center">
              03
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Likely Engagement Path
                </span>
                <Badge variant="cyan" size="sm" className="text-[9px] py-0 px-1">
                  Inference
                </Badge>
              </div>
              <p className="text-xs text-slate-900 dark:text-white font-semibold pt-0.5">
                {inducedAction}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-sky-400 opacity-60" />
          </div>

          {/* Step 4: Conversation Opportunity */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40">
            <div className="p-1 rounded-md bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 shrink-0 font-mono text-xs font-bold w-6 h-6 flex items-center justify-center">
              04
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] uppercase tracking-wider text-sky-800 dark:text-sky-300 font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Conversation Mechanism &amp; Opportunity
                </span>
                <Badge variant="cyan" size="sm" className="text-[9px] py-0 px-1">
                  State
                </Badge>
              </div>
              <p className="text-xs text-sky-900 dark:text-sky-100 pt-0.5">
                {conversationOpportunity}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-emerald-400 opacity-60" />
          </div>

          {/* Step 5: High-Conversion Replacement Question */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wider">
                <MessageCircleQuestion className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Step 5: High-Conversion Replacement Question
                <Badge variant="emerald" size="sm" className="text-[9px] py-0 px-1">
                  Recommendation
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyQuestion}
                leftIcon={copiedQuestion ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                className="text-xs text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                aria-label="Copy high-conversion replacement question"
              >
                {copiedQuestion ? 'Copied' : 'Copy Question'}
              </Button>
            </div>

            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm leading-relaxed font-sans font-medium shadow-2xs">
              &ldquo;{replacementQuestion}&rdquo;
            </div>

            {followUpQuestion && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Thread Sustainer:</strong> &ldquo;{followUpQuestion}&rdquo;
                </span>
                <button
                  type="button"
                  onClick={handleCopyFollowUp}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium flex items-center gap-1 shrink-0 cursor-pointer"
                  aria-label="Copy thread sustainer probe question"
                >
                  {copiedFollowUp ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedFollowUp ? 'Copied' : 'Copy Probe'}
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
