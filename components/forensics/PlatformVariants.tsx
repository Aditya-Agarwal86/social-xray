'use client';

import React, { useState } from 'react';
import {
  Layers,
  Copy,
  Check,
  Linkedin,
  Instagram,
  Video,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { PlatformVariantsData } from '@/lib/analysis/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils/cn';

interface PlatformVariantsProps {
  variants: PlatformVariantsData;
}

export const PlatformVariants: React.FC<PlatformVariantsProps> = ({ variants }) => {
  const [activePlatform, setActivePlatform] = useState<'linkedin' | 'instagram' | 'tiktok'>('linkedin');
  const [copied, setCopied] = useState(false);

  if (!variants) return null;

  const currentContent = variants[activePlatform] || '';

  const handleCopy = () => {
    if (currentContent) {
      navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const platformTabs = [
    {
      id: 'linkedin' as const,
      label: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4 text-sky-400" />,
      subtext: 'Line Breaks & Executive Framing',
      badge: 'THOUGHT LEADERSHIP',
    },
    {
      id: 'instagram' as const,
      label: 'Instagram',
      icon: <Instagram className="w-4 h-4 text-pink-400" />,
      subtext: 'Visual Hook & Carousel Direction',
      badge: 'CAROUSEL & CAPTION',
    },
    {
      id: 'tiktok' as const,
      label: 'TikTok / Reels',
      icon: <Video className="w-4 h-4 text-cyan-400" />,
      subtext: 'Spoken Script & Visual Cues',
      badge: 'SPOKEN SCRIPT',
    },
  ];

  const activeTabMeta = platformTabs.find((t) => t.id === activePlatform);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-mono font-bold uppercase tracking-wider text-white">
            Cross-Platform Adaptation Engine
          </h3>
        </div>
        <Badge variant="cyan" size="sm">
          3 PLATFORM VARIANTS
        </Badge>
      </div>

      {/* Platform Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" role="tablist" aria-label="Social Media Platforms">
        {platformTabs.map((tab) => {
          const isActive = activePlatform === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`platform-panel-${tab.id}`}
              id={`platform-tab-${tab.id}`}
              type="button"
              onClick={() => {
                setActivePlatform(tab.id);
                setCopied(false);
              }}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                isActive
                  ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/50'
                  : 'bg-carbon-900/80 border-carbon-750 text-carbon-300 hover:border-carbon-600 hover:bg-carbon-850'
              )}
            >
              <div className="p-2 rounded-lg bg-carbon-800 border border-carbon-700 shrink-0">
                {tab.icon}
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xs font-bold text-white">{tab.label}</div>
                <div className="text-[10px] text-carbon-400 truncate">{tab.subtext}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Platform Variant Card */}
      <Card
        id={`platform-panel-${activePlatform}`}
        role="tabpanel"
        aria-labelledby={`platform-tab-${activePlatform}`}
        className="p-5 sm:p-6 bg-carbon-900/90 border-carbon-750 space-y-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-carbon-800 pb-3">
          <div className="space-y-0.5">
            <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {activeTabMeta?.label} Optimized Variant
            </span>
            <span className="text-[11px] text-carbon-400 font-sans">
              Adapted format for {activeTabMeta?.badge}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            className="text-xs font-mono w-full sm:w-auto text-cyan-300 border-cyan-700/60 hover:border-cyan-400"
            aria-label={`Copy ${activeTabMeta?.label} formatted post copy`}
          >
            {copied ? 'Copied to Clipboard' : `Copy ${activeTabMeta?.label} Post`}
          </Button>
        </div>

        {/* Post Text */}
        <div className="p-4 rounded-xl bg-carbon-950/90 border border-carbon-800 text-carbon-100 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30 selection:text-white">
          {currentContent}
        </div>
      </Card>
    </div>
  );
};
