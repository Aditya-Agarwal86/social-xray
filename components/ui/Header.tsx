'use client';

import React, { useState } from 'react';
import { Activity, ArrowRight, Menu, X, KeyRound, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

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
    <header className="border-b border-carbon-750 bg-carbon-950/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <a
          href="#"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
          aria-label="SOCIAL X-RAY Homepage"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-carbon-900 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:border-cyan-400 transition-colors">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-bold tracking-wider text-white">
                SOCIAL <span className="text-cyan-400">X-RAY</span>
              </span>
              <Badge variant="cyan" size="sm" className="hidden sm:inline-flex text-[10px]">
                LAB
              </Badge>
            </div>
            <p className="text-[10px] text-carbon-400 tracking-tight font-mono hidden sm:block">
              AI SOCIAL CONTENT FORENSICS
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-7 text-xs font-mono text-carbon-300"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-cyan-300 transition-colors focus:outline-none focus-visible:text-cyan-300 cursor-pointer"
          >
            HOW IT WORKS
          </button>
          <button
            onClick={() => scrollToSection('common-reasons')}
            className="hover:text-cyan-300 transition-colors focus:outline-none focus-visible:text-cyan-300 cursor-pointer"
          >
            FRICTIONS
          </button>
          <button
            onClick={() => scrollToSection('dimensions')}
            className="hover:text-cyan-300 transition-colors focus:outline-none focus-visible:text-cyan-300 cursor-pointer"
          >
            10 DIMENSIONS
          </button>
          <button
            onClick={() => scrollToSection('upload-section')}
            className="hover:text-cyan-300 transition-colors focus:outline-none focus-visible:text-cyan-300 cursor-pointer"
          >
            INGEST POST
          </button>
        </nav>

        {/* Action Button & Mobile Hamburger */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => scrollToSection('upload-section')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="hidden sm:inline-flex text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            X-Ray My Post →
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-carbon-300 hover:text-white hover:bg-carbon-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
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
          className="md:hidden border-t border-carbon-800 bg-carbon-950/95 backdrop-blur-xl px-4 py-4 space-y-3 font-mono text-xs animate-fade-in"
          aria-label="Mobile Navigation"
        >
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="block w-full text-left py-2 text-carbon-300 hover:text-cyan-400 transition-colors"
          >
            HOW IT WORKS
          </button>
          <button
            onClick={() => scrollToSection('common-reasons')}
            className="block w-full text-left py-2 text-carbon-300 hover:text-cyan-400 transition-colors"
          >
            FRICTIONS
          </button>
          <button
            onClick={() => scrollToSection('dimensions')}
            className="block w-full text-left py-2 text-carbon-300 hover:text-cyan-400 transition-colors"
          >
            10 DIMENSIONS
          </button>
          <button
            onClick={() => scrollToSection('upload-section')}
            className="block w-full text-left py-2 text-cyan-400 font-bold transition-colors"
          >
            X-RAY MY POST →
          </button>
          {onOpenApiKeyModal && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApiKeyModal();
              }}
              className="block w-full text-left py-2 text-carbon-300 hover:text-cyan-300 transition-colors flex items-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>CONFIGURE GEMINI API KEY</span>
            </button>
          )}
        </nav>
      )}
    </header>
  );
};
