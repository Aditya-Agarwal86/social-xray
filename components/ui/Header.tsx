'use client';

import React, { useState } from 'react';
import { Activity, ArrowRight, Menu, X, KeyRound } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onOpenApiKeyModal?: () => void;
  hasCustomKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenApiKeyModal, hasCustomKey = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <a
          href="#"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
          aria-label="SOCIAL X-RAY Homepage"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 group-hover:border-sky-400 transition-colors shadow-sm">
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Social <span className="text-sky-600 dark:text-sky-400">X-Ray</span>
              </span>
              <Badge variant="cyan" size="sm" className="hidden sm:inline-flex text-[9px] py-0 px-1 font-semibold">
                LAB
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans hidden sm:block">
              Content Attention Forensics
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300 font-sans"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:text-sky-600 dark:focus-visible:text-sky-400 cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('common-reasons')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:text-sky-600 dark:focus-visible:text-sky-400 cursor-pointer"
          >
            Frictions
          </button>
          <button
            onClick={() => scrollToSection('dimensions')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:text-sky-600 dark:focus-visible:text-sky-400 cursor-pointer"
          >
            10 Dimensions
          </button>
          <button
            onClick={() => scrollToSection('upload-section')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:text-sky-600 dark:focus-visible:text-sky-400 cursor-pointer"
          >
            Ingest Post
          </button>
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Button
            variant="primary"
            size="sm"
            onClick={() => scrollToSection('upload-section')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="hidden sm:inline-flex text-xs font-medium"
          >
            X-Ray My Post →
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-4 space-y-2.5 font-sans text-xs animate-fade-in"
          aria-label="Mobile Navigation"
        >
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="block w-full text-left py-2 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('common-reasons')}
            className="block w-full text-left py-2 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            Frictions
          </button>
          <button
            onClick={() => scrollToSection('dimensions')}
            className="block w-full text-left py-2 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            10 Dimensions
          </button>
          <button
            onClick={() => scrollToSection('upload-section')}
            className="block w-full text-left py-2 text-sky-600 dark:text-sky-400 font-semibold transition-colors"
          >
            X-Ray My Post →
          </button>
          {onOpenApiKeyModal && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApiKeyModal();
              }}
              className="block w-full text-left py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <KeyRound className="w-3.5 h-3.5 text-sky-500" />
              <span>Configure Gemini API Key</span>
            </button>
          )}
        </nav>
      )}
    </header>
  );
};
