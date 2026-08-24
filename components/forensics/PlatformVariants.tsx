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
      icon: <Linkedin className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
      subtext: 'Line Breaks & Executive Framing',
      badge: 'Thought Leadership',
    },
    {
      id: 'instagram' as const,
      label: 'Instagram',
      icon: <Instagram className="w-4 h-4 text-pink-600 dark:text-pink-400" />,
      subtext: 'Visual Hook & Carousel Direction',
      badge: 'Carousel & Caption',
    },
    {
      id: 'tiktok' as const,
      label: 'TikTok / Reels',
      icon: <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      subtext: 'Spoken Script & Visual Cues',
      badge: 'Spoken Script',
    },
  ];

  const activeTabMeta = platformTabs.find((t) => t.id === activePlatform);

  return (
    <div className="space-y-3.5 font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            09 — Cross-Platform Adaptation
          </h3>
        </div>
        <Badge variant="cyan" size="sm">
          3 Platform Variants
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
                'flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer',
                isActive
                  ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-sky-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-2xs'
              )}
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                {tab.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">{tab.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{tab.subtext}</div>
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
        className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              {activeTabMeta?.label} Optimized Variant
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Adapted format for {activeTabMeta?.badge}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            className="text-xs w-full sm:w-auto"
            aria-label={`Copy ${activeTabMeta?.label} formatted post copy`}
          >
            {copied ? 'Copied to Clipboard!' : `Copy ${activeTabMeta?.label} Format`}
          </Button>
        </div>

        {/* Formatted Content */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
          {currentContent}
        </div>
      </Card>
    </div>
  );
};
