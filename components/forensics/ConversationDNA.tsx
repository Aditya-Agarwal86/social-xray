'use client';

import React, { useState } from 'react';
import {
  Dna,
  MessageCircleQuestion,
  Users,
  Sparkles,
  Copy,
  Check,
  Activity,
  ArrowDown,
  MessageSquare,
  HelpCircle,
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-mono font-bold uppercase tracking-wider text-white">
            07 — CONVERSATION DNA
          </h3>
          <Badge variant="violet" size="sm">
            INFERENCE + CONFIDENCE
          </Badge>
        </div>
        <span className="text-xs font-mono text-carbon-400">
          Inferred cognitive cascade from feed appearance to response
        </span>
      </div>

      {/* Vertical Flow Diagram */}
      <Card className="p-6 bg-carbon-900/90 border-carbon-750 space-y-4">
        <div className="space-y-3 font-sans">
          {/* Step 1: Post Input */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-carbon-950/80 border border-carbon-800">
            <div className="p-1.5 rounded-lg bg-carbon-800 text-carbon-300 shrink-0 font-mono text-xs font-bold">
              01
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-carbon-400 font-semibold block">
                  Post Delivered to Feed
                </span>
                <Badge variant="neutral" size="sm" className="text-[9px] py-0 px-1.5">
                  OBSERVED FACT
                </Badge>
              </div>
              <p className="text-xs text-carbon-200 pt-0.5">
                {deliveredToFeed}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-purple-400 animate-bounce" />
          </div>

          {/* Step 2: Inferred Audience Reaction */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40">
            <div className="p-1.5 rounded-lg bg-purple-900/60 text-purple-300 shrink-0 font-mono text-xs font-bold">
              02
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Inferred Audience Reaction
                </span>
                <Badge variant="violet" size="sm" className="text-[9px] py-0 px-1.5">
                  INFERENCE · CONFIDENCE: MEDIUM
                </Badge>
              </div>
              <p className="text-xs text-purple-100 italic pt-0.5">
                &ldquo;{audienceReaction}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-purple-400" />
          </div>

          {/* Step 3: Likely Engagement Path */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-carbon-950/80 border border-carbon-800">
            <div className="p-1.5 rounded-lg bg-carbon-800 text-carbon-300 shrink-0 font-mono text-xs font-bold">
              03
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Likely Engagement Path
                </span>
                <Badge variant="cyan" size="sm" className="text-[9px] py-0 px-1.5">
                  INFERENCE
                </Badge>
              </div>
              <p className="text-xs text-white font-mono font-semibold pt-0.5">
                {inducedAction}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-cyan-400" />
          </div>

          {/* Step 4: Conversation Opportunity */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
            <div className="p-1.5 rounded-lg bg-cyan-900/60 text-cyan-300 shrink-0 font-mono text-xs font-bold">
              04
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Conversation Mechanism &amp; Opportunity
                </span>
                <Badge variant="cyan" size="sm" className="text-[9px] py-0 px-1.5">
                  OBSERVED / INFERRED STATE
                </Badge>
              </div>
              <p className="text-xs text-cyan-100 pt-0.5">
                {conversationOpportunity}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Step 5: High-Conversion Better Question */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-carbon-950 to-cyan-950/40 border border-purple-500/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
                <MessageCircleQuestion className="w-4 h-4 text-purple-400" />
                Step 5: High-Conversion Replacement Question
                <Badge variant="emerald" size="sm" className="text-[9px] py-0 px-1.5">
                  RECOMMENDATION
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyQuestion}
                leftIcon={copiedQuestion ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                className="text-xs font-mono text-purple-300 border-purple-700/60 hover:border-purple-400"
                aria-label="Copy high-conversion replacement question"
              >
                {copiedQuestion ? 'Copied' : 'Copy Question'}
              </Button>
            </div>

            <div className="p-3.5 rounded-lg bg-carbon-950 border border-purple-500/30 text-white font-mono text-xs sm:text-sm leading-relaxed">
              &ldquo;{replacementQuestion}&rdquo;
            </div>

            {followUpQuestion && (
              <div className="pt-2 border-t border-carbon-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-carbon-400 font-sans">
                  <strong>Thread Sustainer:</strong> &ldquo;{followUpQuestion}&rdquo;
                </span>
                <button
                  type="button"
                  onClick={handleCopyFollowUp}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded px-1"
                  aria-label="Copy thread sustainer probe question"
                >
                  {copiedFollowUp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
