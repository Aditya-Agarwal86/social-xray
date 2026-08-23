'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ArrowRight,
  Sparkles,
  FileText,
  Scan,
  BrainCircuit,
  Wrench,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Zap,
  ShieldCheck,
  MousePointerClick,
  Eye,
  Share2,
  MessageSquare,
  Bookmark,
  Award,
  AlertOctagon,
  FileCode,
  Lightbulb,
  Crosshair,
  RotateCcw,
  KeyRound,
  ShieldAlert,
  PlayCircle,
  FlaskConical,
} from 'lucide-react';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { GoalSelector } from '@/components/upload/GoalSelector';
import { FileDropzone } from '@/components/upload/FileDropzone';
import { ExtractionPreview } from '@/components/upload/ExtractionPreview';
import { ApiKeyModal } from '@/components/upload/ApiKeyModal';
import { ImageCropModal } from '@/components/upload/ImageCropModal';
import { ScanningHUD } from '@/components/forensics/ScanningHUD';
import { DiagnosticReport } from '@/components/forensics/DiagnosticReport';
import { GoalType, UploadedFileState } from '@/types/analysis';
import { SocialXRayAnalysisResult } from '@/lib/analysis/types';
import { extractImageText } from '@/lib/extraction/ocr';

// Built-in realistic weak post for 1-click instant demo
const DEMO_POST = {
  title: 'AI Product Launch Announcement',
  badge: 'Demo Post',
  goal: 'conversation' as GoalType,
  text: `We are excited to announce the launch of our innovative AI-powered productivity platform.

Our platform is designed to help professionals improve productivity and manage their daily tasks more efficiently. In today's fast-paced business environment, having the right digital tools is essential for modern workflow synergy and peak performance.

Learn more about our solution today.`,
};

// Additional test drafts
const SAMPLE_POSTS = [
  {
    title: 'Passive Leadership Monologue',
    goal: 'conversation' as GoalType,
    text: `I've been thinking a lot about leadership lately in the modern tech ecosystem.

As leaders, we often find ourselves facing challenging situations where communication becomes the cornerstone of team alignment. In my 10 years of managing distributed engineering teams, I have observed that when managers fail to actively listen, team members feel disconnected.

What are your thoughts on leadership and communication? Let me know in the comments!`,
  },
  {
    title: 'Generic Productivity Tips',
    goal: 'shares' as GoalType,
    text: `5 Tips To Boost Your Productivity Today:

1. Wake up early: The early bird gets the worm.
2. Drink plenty of water: Staying hydrated keeps your brain sharp.
3. Write a to-do list: Having your tasks organized helps reduce anxiety.
4. Avoid social media distractions: Turn off notifications while doing deep work.
5. Take regular breaks: Use the Pomodoro technique.

Save this post if you found it helpful and share it with someone who needs motivation!`,
  },
];

const FORENSIC_DIMENSIONS = [
  {
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    name: 'Hook Velocity',
    desc: 'Diagnoses whether the first 3 lines break algorithmic feed inertia or cause immediate swipe-away.',
  },
  {
    icon: <Eye className="w-5 h-5 text-cyan-400" />,
    name: 'Signal Clarity',
    desc: 'Measures signal-to-noise ratio, eliminating corporate jargon, fluff, and unnecessary throat-clearing.',
  },
  {
    icon: <BrainCircuit className="w-5 h-5 text-cyan-400" />,
    name: 'Cognitive Ease',
    desc: 'Evaluates structural friction and visual pacing to prevent cognitive overload.',
  },
  {
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    name: 'Emotional Tension',
    desc: 'Identifies emotional resonance, vulnerable stakes, and intellectual intrigue.',
  },
  {
    icon: <HelpCircle className="w-5 h-5 text-purple-400" />,
    name: 'Curiosity Gap',
    desc: 'Detects open loops and information gaps that compel the reader to keep reading.',
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
    name: 'Conversation Catalyst',
    desc: 'Diagnoses whether the copy is a broadcast lecture or invites active debate in comments.',
  },
  {
    icon: <Share2 className="w-5 h-5 text-cyan-400" />,
    name: 'Social Currency',
    desc: 'Determines if the insight reinforces the reader’s identity enough to share with peers.',
  },
  {
    icon: <MousePointerClick className="w-5 h-5 text-rose-400" />,
    name: 'CTA Friction',
    desc: 'Evaluates call-to-action sharpness and eliminates resistance before conversion.',
  },
  {
    icon: <Award className="w-5 h-5 text-amber-400" />,
    name: 'Audience Utility',
    desc: 'Evaluates tangible reference value, actionable frameworks, and save-worthy blueprints.',
  },
  {
    icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
    name: 'Resistance Resistance',
    desc: 'Calculates the overall dropoff cliff where reader attention breaks down entirely.',
  },
];

export default function Home() {
  const [targetGoal, setTargetGoal] = useState<GoalType>('conversation');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [workflowState, setWorkflowState] = useState<'idle' | 'scanning' | 'results' | 'error'>('idle');
  const [analysisResult, setAnalysisResult] = useState<SocialXRayAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractionNotification, setExtractionNotification] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isCroppingOcr, setIsCroppingOcr] = useState(false);
  const [clientApiKey, setClientApiKey] = useState('');

  const workbenchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load client API key from localStorage on mount if set
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('social_xray_gemini_key') || '';
      setClientApiKey(storedKey);
    }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTextExtracted = (text: string, fileState: UploadedFileState) => {
    setUploadedFile(fileState);
    setExtractedText(text);
    setErrorMessage(null);
    setExtractionNotification(
      `Extracted ${fileState.source.toUpperCase()} content (${text.split(/\s+/).filter(Boolean).length} words). You can review and refine the text below.`
    );
  };

  const handleCropAndExtract = async (croppedBlob: Blob, croppedFileName: string) => {
    setIsCroppingOcr(true);
    setErrorMessage(null);
    try {
      const result = await extractImageText(croppedBlob, { fileName: croppedFileName });
      setExtractedText(result.extractedText);
      setExtractionNotification(
        `Extracted cropped area (${result.wordCount} words, detection confidence: ${result.confidence}%). Review copy below.`
      );

      if (uploadedFile) {
        setUploadedFile({
          ...uploadedFile,
          extractedText: result.extractedText,
          wordCount: result.wordCount,
          charCount: result.characterCount,
          confidence: result.confidence,
          confidenceLabel: result.confidenceLabel,
          warnings: result.processingWarnings,
          telemetry: result.socialContent?.telemetry,
        });
      }
    } catch (err: any) {
      setErrorMessage(`Crop OCR failed: ${err?.message || 'Unknown recognition error'}`);
    } finally {
      setIsCroppingOcr(false);
    }
  };

  const handleRerunOcr = async () => {
    if (!uploadedFile?.file) return;
    setIsCroppingOcr(true);
    setErrorMessage(null);
    try {
      const result = await extractImageText(uploadedFile.file, { fileName: uploadedFile.name });
      setExtractedText(result.extractedText);
      setExtractionNotification(
        `Re-ran OCR extraction (${result.wordCount} words, detection confidence: ${result.confidence}%).`
      );

      setUploadedFile({
        ...uploadedFile,
        extractedText: result.extractedText,
        wordCount: result.wordCount,
        charCount: result.characterCount,
        confidence: result.confidence,
        confidenceLabel: result.confidenceLabel,
        warnings: result.processingWarnings,
        telemetry: result.socialContent?.telemetry,
      });
    } catch (err: any) {
      setErrorMessage(`Re-run OCR failed: ${err?.message || 'Unknown recognition error'}`);
    } finally {
      setIsCroppingOcr(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setExtractedText('');
    setAnalysisResult(null);
    setWorkflowState('idle');
    setErrorMessage(null);
    setExtractionNotification(null);
    scrollToSection('upload-section');
  };

  // Load Demo Post handler
  const handleLoadDemoPost = (autoAnalyze = false) => {
    setTargetGoal(DEMO_POST.goal);
    setExtractedText(DEMO_POST.text);
    setUploadedFile({
      file: new File([DEMO_POST.text], 'demo-post.txt', { type: 'text/plain' }),
      name: 'Demo Post (AI Launch Announcement)',
      size: DEMO_POST.text.length,
      type: 'text/plain',
      extractedText: DEMO_POST.text,
      source: 'demo',
      wordCount: DEMO_POST.text.split(/\s+/).filter(Boolean).length,
      charCount: DEMO_POST.text.length,
    });
    setAnalysisResult(null);
    setErrorMessage(null);
    setExtractionNotification(
      'Loaded Demo Post: "AI Product Launch Announcement". Demonstrating company-first language, weak hook, and inert CTA.'
    );

    if (autoAnalyze) {
      setTimeout(() => {
        executeAnalysisWithText(DEMO_POST.text, DEMO_POST.goal);
      }, 100);
    } else {
      scrollToSection('upload-section');
    }
  };

  const handleLoadSample = (sample: (typeof SAMPLE_POSTS)[0]) => {
    setTargetGoal(sample.goal);
    setExtractedText(sample.text);
    setUploadedFile(null);
    setAnalysisResult(null);
    setWorkflowState('idle');
    setErrorMessage(null);
    setExtractionNotification(
      `Loaded benchmark draft for ${sample.goal.toUpperCase()} objective. Review and edit copy below.`
    );
    scrollToSection('upload-section');
  };

  const executeAnalysisWithText = async (textToAnalyze: string, goal: GoalType) => {
    if (!textToAnalyze.trim()) {
      setErrorMessage('Cannot proceed with empty text. Please upload a file or enter copy.');
      return;
    }

    setWorkflowState('scanning');
    setErrorMessage(null);

    workbenchRef.current?.scrollIntoView({ behavior: 'smooth' });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (clientApiKey) {
        headers['x-gemini-key'] = clientApiKey;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          content: textToAnalyze.trim(),
          targetGoal: goal,
        }),
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'AUTH_KEY_MISSING' || response.status === 401) {
          throw new Error(
            'Google Gemini API key is missing or invalid. Please configure GEMINI_API_KEY in your server environment (.env.local) or click "Configure API Key" above.'
          );
        }
        throw new Error(data.message || 'Failed to analyze post content.');
      }

      setAnalysisResult(data);
      setWorkflowState('results');

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Forensic Analysis Execution Error:', err);
      setWorkflowState('error');
      if (err.name === 'AbortError') {
        setErrorMessage('The AI diagnostic analysis timed out after 45 seconds. Please verify your connection or try again.');
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred during AI analysis.');
      }
    }
  };

  const executeAnalysis = () => {
    executeAnalysisWithText(extractedText, targetGoal);
  };

  return (
    <div className="min-h-screen flex flex-col bg-carbon-950 text-carbon-100 selection:bg-cyan-500/25 selection:text-white">
      {/* Responsive Laboratory Navigation */}
      <Header onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} hasCustomKey={!!clientApiKey} />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={(key) => {
          setClientApiKey(key);
          setExtractionNotification(
            key ? 'Client Google Gemini API key configured.' : 'Client API key cleared.'
          );
        }}
      />

      {/* Image Region Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        file={uploadedFile?.file || null}
        onClose={() => setIsCropModalOpen(false)}
        onCropAndExtract={handleCropAndExtract}
        isProcessing={isCroppingOcr}
      />

      <main className="flex-1 space-y-24 pb-20">
        {/* HERO SECTION */}
        <section
          className="relative pt-12 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
          aria-labelledby="hero-title"
        >
          {/* Subtle Grid Reticle & Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#1E2638_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            {/* Pre-header badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>AI SOCIAL CONTENT FORENSICS</span>
            </div>

            {/* Brand Title & Tagline */}
            <div className="space-y-3">
              <h1
                id="hero-title"
                className="text-4xl sm:text-5xl md:text-6xl font-mono font-extrabold text-white tracking-tight leading-[1.1]"
              >
                SOCIAL <span className="text-cyan-400">X-RAY</span>
                <span className="block text-2xl sm:text-3xl md:text-4xl font-normal text-carbon-200 mt-2">
                  &ldquo;Find the moment your audience stops caring.&rdquo;
                </span>
              </h1>

              {/* Required Supporting Text */}
              <p className="text-base sm:text-lg text-carbon-300 font-sans max-w-2xl mx-auto leading-relaxed pt-2">
                Upload a social post and uncover the attention leaks, engagement friction, and conversation opportunities hiding inside it.
              </p>
            </div>

            {/* Primary, Demo & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToSection('upload-section')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto font-mono text-sm tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.25)]"
              >
                X-Ray My Post
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleLoadDemoPost(false)}
                leftIcon={<FlaskConical className="w-4 h-4 text-amber-400" />}
                className="w-full sm:w-auto font-mono text-sm border-amber-500/40 text-amber-200 hover:border-amber-400"
              >
                Try a Demo Post
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('how-it-works')}
                className="w-full sm:w-auto font-mono text-sm text-carbon-300"
              >
                See How It Works
              </Button>
            </div>

            {/* Hero Forensic Blueprint Schematic */}
            <div className="w-full pt-8">
              <Card
                variant="telemetry"
                className="p-6 sm:p-8 bg-carbon-900/90 border-carbon-750 text-left relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-carbon-800 pb-3 mb-4 font-mono text-xs text-carbon-400">
                  <span className="flex items-center gap-2 text-cyan-400">
                    <Crosshair className="w-4 h-4" /> FORENSIC DIAGNOSTIC SCHEMATIC
                  </span>
                  <span className="text-carbon-500">ATTENTION DECAY MODEL</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-carbon-950 border border-cyan-500/30 space-y-1.5">
                    <div className="text-cyan-400 font-bold uppercase">01. Hook Velocity</div>
                    <p className="text-carbon-300 font-sans leading-relaxed">
                      First 3 lines measured for cognitive stopping power and feed momentum.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-carbon-950 border border-rose-500/30 space-y-1.5">
                    <div className="text-rose-400 font-bold uppercase">02. Attention Cliff</div>
                    <p className="text-carbon-300 font-sans leading-relaxed">
                      Identifies exact dropoff phrases, throat-clearing, and cognitive fatigue.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-carbon-950 border border-purple-500/30 space-y-1.5">
                    <div className="text-purple-400 font-bold uppercase">03. Conversation DNA</div>
                    <p className="text-carbon-300 font-sans leading-relaxed">
                      Diagnoses audience psychological reaction and replaces inert CTAs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-carbon-950 border border-emerald-500/30 space-y-1.5">
                    <div className="text-emerald-400 font-bold uppercase">04. Surgical Repair</div>
                    <p className="text-carbon-300 font-sans leading-relaxed">
                      Provides side-by-side diff rewrites optimized for LinkedIn, Instagram & TikTok.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION: THE ANATOMY OF ATTENTION DROP */}
        <section
          id="forensic-breakdown"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
          aria-labelledby="breakdown-title"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="cyan" size="sm">
              CONTENT AUTOPSY
            </Badge>
            <h2 id="breakdown-title" className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              THE 4 REASONS POSTS LOSE AUDIENCES
            </h2>
            <p className="text-sm text-carbon-400 font-sans">
              Generic metrics tell you how many scrolled past. Social X-Ray explains why.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="glow" glowColor="red" className="p-5 space-y-3 bg-carbon-900/80 border-carbon-750">
              <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-400 w-fit">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-sm font-bold text-white uppercase">
                1. Throat Clearing
              </h3>
              <p className="text-xs text-carbon-300 font-sans leading-relaxed">
                Starting with passive preamble (&ldquo;I’ve been thinking lately...&rdquo;) instead of placing the highest-tension premise in line 1.
              </p>
            </Card>

            <Card variant="glow" glowColor="amber" className="p-5 space-y-3 bg-carbon-900/80 border-carbon-750">
              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-400 w-fit">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-sm font-bold text-white uppercase">
                2. Cognitive Drag
              </h3>
              <p className="text-xs text-carbon-300 font-sans leading-relaxed">
                Dense walls of text and unstructured transitions that require too much mental energy to scan and decode.
              </p>
            </Card>

            <Card variant="glow" glowColor="cyan" className="p-5 space-y-3 bg-carbon-900/80 border-carbon-750">
              <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-400 w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-sm font-bold text-white uppercase">
                3. Broadcast Monologue
              </h3>
              <p className="text-xs text-carbon-300 font-sans leading-relaxed">
                Lecturing the audience rather than creating psychological open loops that invite disagreement, reflection, or debate.
              </p>
            </Card>

            <Card variant="glow" glowColor="emerald" className="p-5 space-y-3 bg-carbon-900/80 border-carbon-750">
              <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 w-fit">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-sm font-bold text-white uppercase">
                4. Inert CTAs
              </h3>
              <p className="text-xs text-carbon-300 font-sans leading-relaxed">
                Ending with passive questions (&ldquo;Thoughts?&rdquo;) that create zero urgency compared to high-conversion catalyst prompts.
              </p>
            </Card>
          </div>
        </section>

        {/* SECTION: HOW IT WORKS */}
        <section
          id="how-it-works"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
          aria-labelledby="how-title"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="cyan" size="sm">
              FORENSIC PIPELINE
            </Badge>
            <h2 id="how-title" className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              HOW SOCIAL X-RAY OPERATES
            </h2>
            <p className="text-sm text-carbon-400 font-sans">
              Zero server-side image hoarding. In-browser extraction paired with deep psychological diagnosis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-carbon-900/90 border-carbon-750 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 font-mono text-cyan-400 font-bold flex items-center justify-center text-sm">
                01
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-mono font-bold text-white">
                  Ingest & Client-Side OCR
                </h3>
                <p className="text-xs text-carbon-300 font-sans leading-relaxed">
                  Drop a PDF carousel, screenshot, or graphic. Text is parsed directly in your browser using Tesseract Web Workers and PDF.js—preserving structural line breaks.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-carbon-900/90 border-carbon-750 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 font-mono text-cyan-400 font-bold flex items-center justify-center text-sm">
                02
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-mono font-bold text-white">
                  Attention Friction Mapping
                </h3>
                <p className="text-xs text-carbon-300 font-sans leading-relaxed">
                  The forensic engine evaluates the post against your selected optimization objective, identifying exact dropoff sentences, cognitive load spikes, and weak transitions.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-carbon-900/90 border-carbon-750 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 font-mono text-cyan-400 font-bold flex items-center justify-center text-sm">
                03
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-mono font-bold text-white">
                  Surgical Repairs & Platform Adaptation
                </h3>
                <p className="text-xs text-carbon-300 font-sans leading-relaxed">
                  Receive line-by-line Before/After diffs with rationale, high-converting opening questions, and adapted versions for LinkedIn, Instagram, and TikTok.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION: 10 FORENSIC DIMENSIONS */}
        <section
          id="dimensions"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
          aria-labelledby="dimensions-title"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="cyan" size="sm">
              TELEMETRY SPECS
            </Badge>
            <h2 id="dimensions-title" className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              10 EXECUTIVE FORENSIC DIMENSIONS
            </h2>
            <p className="text-sm text-carbon-400 font-sans">
              Comprehensive diagnostics designed to test every layer of audience psychology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {FORENSIC_DIMENSIONS.map((dim, idx) => (
              <Card key={idx} variant="glow" className="p-4 bg-carbon-900/80 border-carbon-750 space-y-2.5">
                <div className="p-2 rounded-lg bg-carbon-800 border border-carbon-700 w-fit">
                  {dim.icon}
                </div>
                <h3 className="text-xs font-mono font-bold text-white uppercase">
                  {dim.name}
                </h3>
                <p className="text-[11px] text-carbon-400 font-sans leading-snug">
                  {dim.desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION: DEDICATED UPLOAD & WORKBENCH */}
        <section
          id="upload-section"
          ref={workbenchRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8"
          aria-labelledby="upload-title"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-mono">
              <Scan className="w-3.5 h-3.5" />
              <span>INTERACTIVE FORENSIC WORKBENCH</span>
            </div>
            <h2 id="upload-title" className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              INGEST POST & RUN X-RAY
            </h2>
            <p className="text-sm text-carbon-400 font-sans">
              Upload your post document/image, or try the built-in Demo Post to test the forensic engine.
            </p>
          </div>

          {/* Global Error Notification */}
          {errorMessage && (
            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/80 space-y-3 text-rose-100 animate-fade-in">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <h4 className="font-mono text-sm font-bold text-rose-300 uppercase">
                    Forensic Pipeline Notice
                  </h4>
                  <p className="text-xs sm:text-sm font-sans leading-relaxed text-rose-200">
                    {errorMessage}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-rose-900/40">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsApiKeyModalOpen(true)}
                  leftIcon={<KeyRound className="w-3.5 h-3.5 text-cyan-400" />}
                  className="text-xs font-mono"
                >
                  Configure API Key
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={executeAnalysis}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5 text-carbon-950" />}
                  className="text-xs font-mono"
                >
                  Retry Analysis
                </Button>
              </div>
            </div>
          )}

          {extractionNotification && !errorMessage && (
            <Alert
              type="success"
              title="Extraction Telemetry"
              message={extractionNotification}
              onDismiss={() => setExtractionNotification(null)}
            />
          )}

          {/* STATE 1: SCANNING IN PROGRESS */}
          {workflowState === 'scanning' && (
            <ScanningHUD goalName={targetGoal} />
          )}

          {/* STATE 2: RESULTS DASHBOARD */}
          {workflowState === 'results' && analysisResult && (
            <div ref={resultsRef} className="space-y-8 animate-fade-in">
              <DiagnosticReport
                report={analysisResult}
                uploadedFile={uploadedFile}
                targetGoal={targetGoal}
                originalText={extractedText}
                onReset={handleReset}
                onReanalyze={executeAnalysis}
              />
            </div>
          )}

          {/* STATE 3: IDLE WORKBENCH (Upload, Goal Selection, Review) */}
          {workflowState !== 'scanning' && workflowState !== 'results' && (
            <div className="space-y-6">
              {/* FEATURED: Try a Demo Post Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-carbon-900 via-carbon-900 to-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="amber" size="sm" className="font-mono">
                      DEMO POST
                    </Badge>
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      Test with a Realistic Weak Post
                    </span>
                  </div>
                  <p className="text-xs text-carbon-300 font-sans max-w-xl leading-relaxed">
                    Instantly load an AI launch announcement demonstrating company-first language, weak hook velocity, and inert CTA—no file upload required.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadDemoPost(false)}
                    leftIcon={<FileText className="w-3.5 h-3.5 text-amber-400" />}
                    className="text-xs font-mono text-amber-200 border-amber-700/60 hover:border-amber-400 flex-1 sm:flex-none"
                  >
                    Load Demo Post
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleLoadDemoPost(true)}
                    leftIcon={<PlayCircle className="w-3.5 h-3.5 text-cyan-400" />}
                    className="text-xs font-mono bg-amber-500/10 border-amber-500/50 hover:bg-amber-500/20 text-amber-200 flex-1 sm:flex-none"
                  >
                    Analyze Demo Now
                  </Button>
                </div>
              </div>

              {/* Step 1: Goal Objective Selector */}
              <GoalSelector
                selectedGoal={targetGoal}
                onSelectGoal={(goal) => {
                  setTargetGoal(goal);
                  setExtractionNotification(`Target objective switched to: ${goal.toUpperCase()}`);
                }}
              />

              {/* Step 2: Primary File Dropzone (PDF / Image / OCR) */}
              <div className="space-y-2" id="formats">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-carbon-200">
                    Step 1: Upload Post Asset (PDF or Image)
                  </span>
                  <span className="text-[11px] font-mono text-carbon-400">
                    Client-side PDF parsing & OCR Web Worker
                  </span>
                </div>
                <FileDropzone
                  onTextExtracted={handleTextExtracted}
                  onError={(err) => {
                    setErrorMessage(err);
                    setExtractionNotification(null);
                  }}
                  onReset={handleReset}
                  currentFile={uploadedFile}
                />
              </div>

              {/* Quick Test Benchmark Drafts */}
              <div className="p-4 rounded-xl bg-carbon-900/60 border border-carbon-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-carbon-400 font-medium">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>MORE TEST BENCHMARK DRAFTS:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_POSTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className="px-3 py-1.5 rounded-lg bg-carbon-800 border border-carbon-700 hover:border-cyan-500/50 hover:text-white text-xs font-mono text-carbon-300 transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                    >
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Editable Extracted Text Review Panel */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-carbon-200">
                  Step 2: Review & Refine Extracted Post Copy
                </span>
                <ExtractionPreview
                  text={extractedText}
                  onTextChange={(newText) => {
                    setExtractedText(newText);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onStartAnalysis={executeAnalysis}
                  onReset={handleReset}
                  onOpenCrop={() => setIsCropModalOpen(true)}
                  onRerunOcr={handleRerunOcr}
                  isAnalyzing={false}
                  sourceType={uploadedFile?.source || 'text'}
                  telemetry={uploadedFile?.telemetry}
                  warnings={uploadedFile?.warnings}
                  confidence={uploadedFile?.confidence}
                />
              </div>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-carbon-800 bg-carbon-950 py-8 text-xs font-mono text-carbon-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">SOCIAL X-RAY</span>
            <span>• AI SOCIAL CONTENT FORENSICS</span>
          </div>
          <p className="text-carbon-600">
            &ldquo;Find the moment your audience stops caring.&rdquo;
          </p>
        </div>
      </footer>
    </div>
  );
}
