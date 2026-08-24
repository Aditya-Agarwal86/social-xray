'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('social_xray_gemini_key') || '';
      setApiKey(stored);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('social_xray_gemini_key', trimmed);
      } else {
        localStorage.removeItem('social_xray_gemini_key');
      }
    }
    onKeySaved(trimmed);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setApiKey('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('social_xray_gemini_key');
    }
    onKeySaved('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-slate-900 dark:text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close API Key dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-sky-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Google Gemini API Key
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure your Gemini API key for real-time post analysis.
            </p>
          </div>
        </div>

        <Alert
          type="info"
          message="If GEMINI_API_KEY is configured in your server environment (.env.local), you can leave this blank. Alternatively, provide a client-side key here (stored only locally in your browser session)."
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Google Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Get your key from Google AI Studio (https://aistudio.google.com/app/apikey).
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-slate-500">
            Clear Key
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              leftIcon={savedSuccess ? <Check className="w-4 h-4 text-white dark:text-slate-950" /> : undefined}
            >
              {savedSuccess ? 'Saved' : 'Save Key'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
