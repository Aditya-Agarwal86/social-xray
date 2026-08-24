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
  AlertTriangle,
  HelpCircle,
  Zap,
  MousePointerClick,
  Eye,
  Share2,
  MessageSquare,
  Award,
  AlertOctagon,
  FileCode,
  Lightbulb,
  Crosshair,
  RotateCcw,
  KeyRound,
  ShieldAlert,
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
import { SocialXRayAnalysisResult, NormalizedApiError } from '@/lib/analysis/types';
import { extractImageText } from '@/lib/extraction/ocr';

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

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
    icon: <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
    name: 'Hook Velocity',
    desc: 'Diagnoses whether the first 3 lines break feed inertia or cause immediate swipe-away.',
  },
  {
    icon: <Eye className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
    name: 'Clarity & Comprehension',
    desc: 'Measures signal-to-noise ratio, eliminating fluff, filler, and unnecessary throat-clearing.',
  },
  {
    icon: <BrainCircuit className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
    name: 'Cognitive Ease',
    desc: 'Evaluates structural friction and visual pacing to prevent cognitive overload.',
  },
  {
    icon: <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    name: 'Emotional Resonance',
    desc: 'Identifies affective resonance, authentic stakes, and intellectual intrigue.',
  },
  {
    icon: <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
    name: 'Curiosity Gap',
    desc: 'Detects open loops and information gaps that compel the reader to keep reading.',
  },
  {
    icon: <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    name: 'Conversation Catalyst',
    desc: 'Diagnoses whether copy is a broadcast monologue or invites active debate in comments.',
  },
  {
    icon: <Share2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
    name: 'Social Currency',
    desc: 'Determines if the insight reinforces reader identity enough to share with peers.',
  },
  {
    icon: <MousePointerClick className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    name: 'CTA Friction',
    desc: 'Evaluates call-to-action sharpness and eliminates friction before conversion.',
  },
  {
    icon: <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    name: 'Audience Value',
    desc: 'Evaluates tangible reference value, actionable frameworks, and save-worthy blueprints.',
  },
  {
    icon: <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    name: 'Attention Resistance',
    desc: 'Calculates the overall dropoff resistance and attention retention across the post.',
  },
];

export default function Home() {
  const [targetGoal, setTargetGoal] = useState<GoalType>('conversation');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [workflowState, setWorkflowState] = useState<'idle' | 'scanning' | 'results' | 'error'>('idle');
  const [analysisResult, setAnalysisResult] = useState<SocialXRayAnalysisResult | null>(null);
  const [errorDetails, setErrorDetails] = useState<NormalizedApiError | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractionNotification, setExtractionNotification] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isCroppingOcr, setIsCroppingOcr] = useState(false);
  const [clientApiKey, setClientApiKey] = useState('');
  const [showMoreExamples, setShowMoreExamples] = useState(false);

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
    setErrorDetails(null);
    if (fileState.inventory?.captionStatus === 'NOT_DETECTED') {
      setExtractionNotification(
        'Visual asset loaded. No post caption detected in screenshot. You can analyze visual stopping power directly or enter a draft caption below.'
      );
    } else {
      setExtractionNotification(
        `Extracted ${fileState.source.toUpperCase()} content (${text.split(/\s+/).filter(Boolean).length} words). You can review and refine the text below.`
      );
    }
  };

  const handleCropAndExtract = async (croppedBlob: Blob, croppedFileName: string) => {
    setIsCroppingOcr(true);
    setErrorMessage(null);
    setErrorDetails(null);
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
          inventory: result.inventory,
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
    setErrorDetails(null);
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
        inventory: result.inventory,
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
    setErrorDetails(null);
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
    setErrorDetails(null);
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
    setErrorDetails(null);
    setExtractionNotification(
      `Loaded benchmark draft for ${sample.goal.toUpperCase()} objective. Review and edit copy below.`
    );
    scrollToSection('upload-section');
  };

  const executeAnalysisWithText = async (textToAnalyze: string, goal: GoalType) => {
    const hasText = Boolean(textToAnalyze && textToAnalyze.trim());
    const isImage = Boolean(
      uploadedFile?.file &&
      (uploadedFile.type.startsWith('image/') || uploadedFile.source === 'image')
    );
    const hasVisualInventory = Boolean(uploadedFile?.inventory?.hasVisualMedia);

    if (!hasText && !isImage && !hasVisualInventory) {
      setErrorMessage('Cannot proceed with empty text. Please upload a file or enter copy.');
      return;
    }

    setWorkflowState('scanning');
    setErrorMessage(null);
    setErrorDetails(null);

    workbenchRef.current?.scrollIntoView({ behavior: 'smooth' });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (clientApiKey) {
        headers['x-gemini-key'] = clientApiKey;
      }

      let imageData: { mimeType: string; base64: string } | undefined;
      if (isImage && uploadedFile?.file) {
        try {
          const b64 = await fileToBase64(uploadedFile.file);
          const mimeType = uploadedFile.file.type || 'image/png';
          imageData = { mimeType, base64: b64 };
        } catch (e) {
          console.warn('Could not read image as base64 for multimodal analysis:', e);
        }
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          content: textToAnalyze.trim(),
          targetGoal: goal,
          inventory: uploadedFile?.inventory,
          imageData,
        }),
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        if (data?.error && typeof data.error === 'object') {
          setErrorDetails(data.error);
          setErrorMessage(data.error.message || 'Failed to analyze post content.');
        } else {
          setErrorMessage(data.message || 'An error occurred during AI forensic analysis.');
        }
        setWorkflowState('error');
        return;
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
        setErrorDetails({
          category: 'TIMEOUT',
          status: 408,
          title: 'Request timed out',
          message: 'The AI diagnostic analysis timed out after 60 seconds. Please verify your connection and try again.',
          retryable: true,
          requiresKeyConfig: false,
        });
        setErrorMessage('The AI diagnostic analysis timed out.');
      } else {
        setErrorMessage(err.message || 'An unexpected network error occurred.');
      }
    }
  };

  const executeAnalysis = () => {
    executeAnalysisWithText(extractedText, targetGoal);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-500/20 selection:text-sky-900 dark:selection:text-sky-100 transition-colors duration-150">
      {/* Responsive Navigation */}
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

      <main className="flex-1 space-y-16 sm:space-y-20 pb-16">
        {/* 1. HERO SECTION */}
        <section
          className="relative pt-12 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
          aria-labelledby="hero-title"
        >
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            {/* Pre-header badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold tracking-wide">
              <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Content Attention &amp; Audience Psychology</span>
            </div>

            {/* Brand Title & Tagline */}
            <div className="space-y-3">
              <h1
                id="hero-title"
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]"
              >
                Social <span className="text-sky-600 dark:text-sky-400">X-Ray</span>
                <span className="block text-2xl sm:text-3xl md:text-4xl font-normal text-slate-600 dark:text-slate-300 mt-2">
                  &ldquo;Find the moment your audience stops caring.&rdquo;
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-sans max-w-2xl mx-auto leading-relaxed pt-2">
                Upload a social post and discover where attention drops, why engagement stalls, and how to repair it with evidence-grounded rewrites.
              </p>
            </div>

            {/* Primary, Demo & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToSection('upload-section')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto text-sm font-semibold"
              >
                X-Ray My Post →
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleLoadDemoPost(false)}
                leftIcon={<FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                className="w-full sm:w-auto text-sm"
              >
                Try a Demo Post
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('how-it-works')}
                className="w-full sm:w-auto text-sm text-slate-700 dark:text-slate-300"
              >
                See How It Works
              </Button>
            </div>

            {/* Hero Blueprint Schematic */}
            <div className="w-full pt-6">
              <Card
                className="p-5 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left relative overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    <Crosshair className="w-4 h-4" /> Diagnostic Schematic
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">Attention Decay Model</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-sky-700 dark:text-sky-400 font-semibold uppercase">01. Hook Velocity</div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      First 3 lines measured for cognitive stopping power and feed momentum.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-rose-700 dark:text-rose-400 font-semibold uppercase">02. Attention Cliff</div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Identifies exact dropoff phrases, throat-clearing, and cognitive fatigue.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-indigo-700 dark:text-indigo-400 font-semibold uppercase">03. Conversation DNA</div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Diagnoses audience psychological reaction and replaces inert CTAs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-emerald-700 dark:text-emerald-400 font-semibold uppercase">04. Surgical Repair</div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Provides side-by-side diff rewrites optimized for LinkedIn, Instagram &amp; TikTok.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 2. QUICK ANALYZER CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Ready to X-Ray a post?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Upload a screenshot or PDF, choose your optimization goal, and get your diagnostic report.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => scrollToSection('upload-section')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto text-xs shrink-0 font-semibold"
            >
              Analyze My Post →
            </Button>
          </div>
        </section>

        {/* 3. HOW SOCIAL X-RAY OPERATES */}
        <section
          id="how-it-works"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
          aria-labelledby="how-title"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="cyan" size="sm">
              Forensic Pipeline
            </Badge>
            <h2 id="how-title" className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              How Social X-Ray Operates
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Post assets are processed in-browser before analysis paired with deep psychological diagnosis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-xs">
                01
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ingest &amp; In-Browser OCR
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Drop a PDF carousel, screenshot, or graphic. Text is extracted directly in your browser using Web Workers and PDF.js—preserving structural line breaks.
                </p>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-xs">
                02
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Attention Friction Mapping
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  The forensic engine evaluates the post against your selected optimization objective, identifying exact dropoff sentences, cognitive load spikes, and weak transitions.
                </p>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-xs">
                03
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Surgical Repairs &amp; Platform Variants
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Receive line-by-line Before/After diffs with rationale, high-converting opening questions, and adapted versions for LinkedIn, Instagram, and TikTok.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* 4. 4 COMMON REASONS POSTS LOSE ATTENTION */}
        <section
          id="common-reasons"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
          aria-labelledby="reasons-title"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="cyan" size="sm">
              Content Autopsy
            </Badge>
            <h2 id="reasons-title" className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              4 Common Reasons Posts Lose Attention
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generic metrics tell you how many scrolled past. Social X-Ray explains why.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 space-y-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 w-fit">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Throat Clearing
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Starting with passive preamble (&ldquo;I’ve been thinking lately...&rdquo;) instead of placing the highest-tension premise in line 1.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 w-fit">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Cognitive Drag
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dense walls of text and unstructured transitions that require too much mental energy to scan and decode.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/50 text-sky-600 dark:text-sky-400 w-fit">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Broadcast Monologue
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Lecturing the audience rather than creating psychological open loops that invite disagreement, reflection, or debate.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 w-fit">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                4. Inert CTAs
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Ending with passive questions (&ldquo;Thoughts?&rdquo;) that create zero urgency compared to high-conversion catalyst prompts.
              </p>
            </Card>
          </div>
        </section>

        {/* 5. WHAT YOUR X-RAY REVEALS */}
        <section
          id="what-you-get"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
          aria-labelledby="what-reveals-title"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="cyan" size="sm">
              Output Dossier
            </Badge>
            <h2 id="what-reveals-title" className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              What Your X-Ray Reveals
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Every analysis generates a structured forensic breakdown with actionable repairs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>01 — Attention Drop-Off</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Identify where the post loses momentum and why audience interest decays.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 text-xs font-semibold uppercase tracking-wider">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>02 — Forensic Dimensions</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Evaluate the post across 10 core audience-psychology dimensions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Crosshair className="w-3.5 h-3.5" />
                <span>03 — Friction Map</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                See the specific text or structural elements creating engagement friction.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5" />
                <span>04 — Surgical Repair</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Get evidence-grounded recommendations for improving the post.
              </p>
            </div>
          </div>
        </section>

        {/* 6. 10 FORENSIC DIMENSIONS */}
        <section
          id="dimensions"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
          aria-labelledby="dimensions-title"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="cyan" size="sm">
              Telemetry Specs
            </Badge>
            <h2 id="dimensions-title" className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              10 Forensic Dimensions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Measure the psychological and structural factors that influence audience response.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {FORENSIC_DIMENSIONS.map((dim, idx) => (
              <Card key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
                  {dim.icon}
                </div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  {dim.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {dim.desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* 7. DEDICATED UPLOAD & WORKBENCH */}
        <section
          id="upload-section"
          ref={workbenchRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4"
          aria-labelledby="upload-title"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold">
              <Scan className="w-3.5 h-3.5" />
              <span>Interactive Diagnostic Workbench</span>
            </div>
            <h2 id="upload-title" className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ingest Post &amp; Run X-Ray
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choose your optimization objective, upload your post asset, review extracted copy, and generate your diagnosis.
            </p>
          </div>

          {/* Global Error Notification */}
          {(errorMessage || errorDetails) && (
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 space-y-3 text-rose-950 dark:text-rose-100 animate-fade-in">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300 uppercase">
                    {errorDetails?.title || 'Diagnostic Pipeline Notice'}
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-rose-800 dark:text-rose-200">
                    {errorDetails?.message || errorMessage}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-200 dark:border-rose-900/40">
                {errorDetails?.requiresKeyConfig && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsApiKeyModalOpen(true)}
                    leftIcon={<KeyRound className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
                    className="text-xs"
                  >
                    Configure API Key
                  </Button>
                )}
                {errorDetails?.retryable !== false && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={executeAnalysis}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5 text-white dark:text-slate-950" />}
                    className="text-xs"
                  >
                    Retry Analysis
                  </Button>
                )}
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
            <div className="space-y-8">
              {/* FEATURED: Try a Demo Post Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="amber" size="sm">
                      Demo Post
                    </Badge>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase">
                      Try a Demo Post
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                    See how Social X-Ray analyzes a realistic weak post before uploading your own.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleLoadDemoPost(true)}
                    leftIcon={<FlaskConical className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                    className="text-xs flex-1 sm:flex-none"
                  >
                    Try Demo Analysis →
                  </Button>
                </div>
              </div>

              {/* STEP 1: Goal Objective Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    Step 1 — Choose Your Objective
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Diagnostics adapt to your selected goal
                  </span>
                </div>
                <GoalSelector
                  selectedGoal={targetGoal}
                  onSelectGoal={(goal) => {
                    setTargetGoal(goal);
                    setExtractionNotification(`Target objective switched to: ${goal.toUpperCase()}`);
                  }}
                />
              </div>

              {/* STEP 2: Primary File Dropzone (PDF / Image / OCR) */}
              <div className="space-y-2.5" id="formats">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    Step 2 — Upload Your Post
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    In-browser PDF &amp; OCR extraction
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

              {/* Collapsible Benchmark Examples */}
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setShowMoreExamples(!showMoreExamples)}
                  className="w-full p-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold">More Benchmark Examples</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {showMoreExamples ? 'Hide Examples ▴' : 'Explore Examples ▾'}
                  </span>
                </button>

                {showMoreExamples && (
                  <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 animate-fade-in">
                    {SAMPLE_POSTS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLoadSample(sample)}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 hover:text-slate-900 dark:hover:text-white text-xs text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        {sample.title} ({sample.goal.toUpperCase()})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 3 & STEP 4: Review Extracted Copy & Run Analysis */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    Step 3 — Review Extracted Content
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Edit copy freely before final scan
                  </span>
                </div>
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
                  inventory={uploadedFile?.inventory}
                  warnings={uploadedFile?.warnings}
                  confidence={uploadedFile?.confidence}
                  previewUrl={uploadedFile?.previewUrl}
                />
              </div>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-slate-900 dark:text-white font-semibold">Social X-Ray</span>
            <span>• Content Attention &amp; Audience Forensics</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500">
            &ldquo;Find the moment your audience stops caring.&rdquo;
          </p>
        </div>
      </footer>
    </div>
  );
}
