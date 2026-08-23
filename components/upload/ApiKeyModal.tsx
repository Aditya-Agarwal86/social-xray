'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Check, X, Eye, EyeOff, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-carbon-900 border border-carbon-700 rounded-2xl p-6 shadow-2xl space-y-5 text-carbon-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-carbon-400 hover:text-white p-1 rounded-lg hover:bg-carbon-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-mono font-bold text-white tracking-wide">
              GOOGLE GEMINI API KEY
            </h3>
            <p className="text-xs text-carbon-400">
              Configure your Gemini API key for real-time forensic post analysis.
            </p>
          </div>
        </div>

        <Alert
          type="info"
          message="If GEMINI_API_KEY is configured in your server environment (.env.local), you can leave this blank. Alternatively, provide a client-side key here (stored only locally in your browser session)."
        />

        <div className="space-y-2">
          <label className="block text-xs font-mono font-medium text-carbon-300 uppercase tracking-wider">
            Google Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-carbon-850 border border-carbon-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white placeholder-carbon-500 outline-none transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon-400 hover:text-carbon-200"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-carbon-400 font-sans">
            Get your key from Google AI Studio (https://aistudio.google.com/app/apikey).
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-carbon-400">
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
              leftIcon={savedSuccess ? <Check className="w-4 h-4 text-carbon-950" /> : undefined}
            >
              {savedSuccess ? 'Saved' : 'Save Key'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
