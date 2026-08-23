'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  X,
  AlertCircle,
  Scan,
  RefreshCw,
  FileUp,
  ShieldAlert,
  Loader2,
  FileCheck,
  RotateCcw,
  Sparkles,
  AlignLeft,
  Type,
  FileBadge,
  AlertTriangle,
} from 'lucide-react';
import {
  validateUploadedFile,
  formatFileSize,
  ALLOWED_EXTENSIONS,
  ValidationResult,
} from '@/lib/utils/fileValidation';
import { extractPdfText, extractImageText, ExtractionError } from '@/lib/extraction';
import { ExtractionProgress, UploadedFileState, UploadState } from '@/types/analysis';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '@/lib/utils/cn';

interface FileDropzoneProps {
  onTextExtracted: (text: string, fileState: UploadedFileState) => void;
  onError: (errorMessage: string) => void;
  onReset: () => void;
  currentFile: UploadedFileState | null;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onTextExtracted,
  onError,
  onReset,
  currentFile,
  disabled = false,
}) => {
  // Explicit Upload State Machine: IDLE | DRAGGING | VALIDATING | PROCESSING | SUCCESS | ERROR
  const [uploadState, setUploadState] = useState<UploadState>(currentFile ? 'SUCCESS' : 'IDLE');
  const [errorMessage, setErrorMessage] = useState<{
    title: string;
    message: string;
    details?: string;
    recoverableWithOcr?: boolean;
  } | null>(null);
  const [extractionWarnings, setExtractionWarnings] = useState<string[]>([]);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress>({
    stage: 'idle',
    progress: 0,
    message: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Sync state if parent resets currentFile
  useEffect(() => {
    if (!currentFile && uploadState === 'SUCCESS') {
      setUploadState('IDLE');
      setErrorMessage(null);
      setExtractionWarnings([]);
    }
  }, [currentFile, uploadState]);

  const processFile = useCallback(
    async (file: File) => {
      if (disabled) return;

      // Transition to VALIDATING
      setUploadState('VALIDATING');
      setErrorMessage(null);
      setExtractionWarnings([]);

      // 1. Run local client-side validation
      const validation: ValidationResult = validateUploadedFile(file);

      if (!validation.isValid) {
        setUploadState('ERROR');
        const errPayload = {
          title: 'Validation Rejected',
          message: validation.error,
          details: validation.details,
        };
        setErrorMessage(errPayload);
        onError(validation.error);
        return;
      }

      // 2. Prepare file preview (Object URL for images)
      let previewUrl: string | undefined = undefined;
      const isImage = validation.fileType === 'image';
      if (isImage) {
        previewUrl = URL.createObjectURL(file);
      }

      const initialFileState: UploadedFileState = {
        file,
        name: file.name,
        size: file.size,
        type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png'),
        previewUrl,
        extractedText: '',
        source: validation.fileType === 'pdf' ? 'pdf' : 'image',
      };

      // 3. Transition to PROCESSING (client-side extraction)
      setUploadState('PROCESSING');
      setExtractionProgress({
        stage: 'extracting',
        progress: 5,
        message: isImage ? 'Preparing image and neural OCR core...' : 'Parsing PDF structural layers...',
      });

      try {
        let extractedText = '';
        let pageCount: number | undefined = undefined;
        let confidence: number | undefined = undefined;
        let words = 0;
        let chars = 0;

        let warningsList: string[] = [];

        if (validation.fileType === 'pdf') {
          const result = await extractPdfText(file, file.name, (progress, message) => {
            setExtractionProgress({ stage: 'extracting', progress, message });
          });
          extractedText = result.extractedText;
          pageCount = result.pageCount;
          words = result.wordCount;
          chars = result.characterCount;
          if (result.extractionWarnings && result.extractionWarnings.length > 0) {
            warningsList = result.extractionWarnings;
            setExtractionWarnings(result.extractionWarnings);
          }
        } else {
          const result = await extractImageText(
            file,
            { fileName: file.name },
            (progress, message) => {
              setExtractionProgress({ stage: 'extracting', progress, message });
            }
          );
          extractedText = result.extractedText;
          confidence = result.confidence;
          words = result.wordCount;
          chars = result.characterCount;
          if (result.processingWarnings && result.processingWarnings.length > 0) {
            warningsList = result.processingWarnings;
            setExtractionWarnings(result.processingWarnings);
          }
        }

        setExtractionProgress({
          stage: 'complete',
          progress: 100,
          message: 'Extraction successfully completed.',
        });

        const completedFileState: UploadedFileState = {
          ...initialFileState,
          extractedText,
          wordCount: words,
          charCount: chars,
          pageCount,
          confidence,
          warnings: warningsList,
        };

        // Transition to SUCCESS
        setUploadState('SUCCESS');
        onTextExtracted(extractedText, completedFileState);
      } catch (err: any) {
        console.error('Forensic Extraction Error:', err);
        setUploadState('ERROR');

        if (err instanceof ExtractionError) {
          setErrorMessage({
            title: isImage ? 'OCR Recognition Notice' : 'PDF Extraction Fault',
            message: err.message,
            details: err.details,
            recoverableWithOcr: err.recoverableWithOcr,
          });
          onError(err.message);
        } else {
          const errMsg = err?.message || 'Failed to extract text from the uploaded file.';
          setErrorMessage({
            title: 'Extraction Incomplete',
            message: errMsg,
            details: 'Ensure the uploaded file contains legible text or high-contrast typography.',
          });
          onError(errMsg);
        }
      }
    },
    [disabled, onError, onTextExtracted]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && uploadState !== 'PROCESSING') {
        setUploadState('DRAGGING');
      }
    },
    [disabled, uploadState]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (uploadState === 'DRAGGING') {
        setUploadState(currentFile ? 'SUCCESS' : 'IDLE');
      }
    },
    [currentFile, uploadState]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || uploadState === 'PROCESSING') return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      } else {
        setUploadState(currentFile ? 'SUCCESS' : 'IDLE');
      }
    },
    [currentFile, disabled, processFile, uploadState]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadState('IDLE');
    setErrorMessage(null);
    setExtractionWarnings([]);
    setExtractionProgress({ stage: 'idle', progress: 0, message: '' });
    onReset();
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setExtractionWarnings([]);
    setUploadState('IDLE');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || uploadState === 'PROCESSING') return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <section
      aria-label="Social Post File Ingestion Zone"
      className="space-y-4 font-sans text-carbon-100"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileInputChange}
        className="sr-only"
        disabled={disabled || uploadState === 'PROCESSING'}
        id="file-upload-input"
        aria-describedby="file-upload-instructions"
      />

      {/* STATE 1 & 2: IDLE or DRAGGING */}
      {(uploadState === 'IDLE' || uploadState === 'DRAGGING') && (
        <div
          ref={dropzoneRef}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          aria-label="Upload social post document or image. Drag and drop file or press Enter to browse."
          className={cn(
            'group relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 select-none min-h-[220px]',
            uploadState === 'DRAGGING'
              ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_35px_rgba(0,240,255,0.25)] scale-[1.01]'
              : 'border-carbon-700 hover:border-cyan-500/60 bg-carbon-900/70 hover:bg-carbon-850/80',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
        >
          {/* Subtle Grid Reticle Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1E2638_1px,transparent_1px)] [background-size:18px_18px] opacity-40 pointer-events-none" />

          {/* Active Drag Laser Line */}
          {uploadState === 'DRAGGING' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00f0ff] animate-scan-line" />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-lg">
            {/* Upload Icon Reticle */}
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105',
                uploadState === 'DRAGGING'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  : 'bg-carbon-800/90 border-carbon-700 text-carbon-300 group-hover:text-cyan-400 group-hover:border-cyan-500/50'
              )}
            >
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-mono text-base sm:text-lg font-bold text-white tracking-wide">
                {uploadState === 'DRAGGING' ? 'DROP POST ASSET TO COMMENCE SCAN' : 'DRAG & DROP SOCIAL POST ASSET'}
              </h3>
              <p
                id="file-upload-instructions"
                className="text-xs sm:text-sm text-carbon-400 leading-relaxed font-sans"
              >
                Drop your PDF post document or screenshot here, or{' '}
                <span className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300 font-semibold">
                  browse files
                </span>{' '}
                from your device.
              </p>
            </div>

            {/* Supported File Specs Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono">
              <Badge variant="cyan" size="sm">
                PDF (.pdf)
              </Badge>
              <Badge variant="neutral" size="sm">
                PNG (.png)
              </Badge>
              <Badge variant="neutral" size="sm">
                JPG / JPEG (.jpg)
              </Badge>
              <Badge variant="neutral" size="sm">
                WEBP (.webp)
              </Badge>
              <span className="text-xs text-carbon-400 font-mono ml-1 font-semibold">
                MAX 10MB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: VALIDATING */}
      {uploadState === 'VALIDATING' && (
        <div
          role="status"
          aria-live="polite"
          className="p-8 rounded-2xl border border-cyan-500/40 bg-carbon-900/90 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]"
        >
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
          <div className="space-y-1 font-mono">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              VALIDATING POST ASSET
            </h4>
            <p className="text-xs text-carbon-400 font-sans">
              Verifying file integrity, MIME structure, and 10MB boundary limits...
            </p>
          </div>
        </div>
      )}

      {/* STATE 4: PROCESSING (In-browser PDF or OCR extraction) */}
      {uploadState === 'PROCESSING' && (
        <div
          role="status"
          aria-live="polite"
          className="p-6 sm:p-8 rounded-2xl border border-cyan-500/50 bg-carbon-900/95 space-y-5 shadow-[0_0_30px_rgba(0,240,255,0.1)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-carbon-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Scan className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white block">
                  LOCAL IN-BROWSER EXTRACTION
                </span>
                <span className="text-[11px] font-sans text-carbon-400">
                  Zero cloud storage. Neural vision and document layout processed locally.
                </span>
              </div>
            </div>

            <Badge variant="cyan" size="sm" className="self-start sm:self-auto font-bold">
              {extractionProgress.progress}%
            </Badge>
          </div>

          {/* Granular Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-carbon-300">
              <span className="flex items-center gap-2 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {extractionProgress.message}
              </span>
            </div>

            <div className="w-full bg-carbon-800 rounded-full h-2.5 overflow-hidden border border-carbon-700/80 p-0.5">
              <div
                className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(0,240,255,0.9)]"
                style={{ width: `${extractionProgress.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* STATE 5: SUCCESS (Dossier card) */}
      {uploadState === 'SUCCESS' && currentFile && (
        <div
          role="region"
          aria-label="Uploaded post file dossier"
          className="p-5 sm:p-6 rounded-2xl border border-carbon-750 bg-carbon-900/95 space-y-4 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* File Info Preview */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Thumbnail or Badge */}
              <div className="w-14 h-14 rounded-xl bg-carbon-800 border border-carbon-700 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                {currentFile.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentFile.previewUrl}
                    alt={currentFile.name}
                    className="w-full h-full object-cover"
                  />
                ) : currentFile.source === 'pdf' ? (
                  <FileText className="w-7 h-7 text-rose-400" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-cyan-400" />
                )}
              </div>

              {/* Metadata */}
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm sm:text-base font-mono font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                    {currentFile.name}
                  </h4>
                  <Badge variant={currentFile.source === 'pdf' ? 'red' : 'cyan'} size="sm">
                    {currentFile.source.toUpperCase()}
                  </Badge>
                  {typeof currentFile.confidence === 'number' && (
                    <Badge variant={currentFile.confidence >= 70 ? 'emerald' : 'amber'} size="sm">
                      CONFIDENCE: {currentFile.confidence}%
                    </Badge>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PARSED
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-carbon-400">
                  <span>Size: <strong className="text-carbon-200">{formatFileSize(currentFile.size)}</strong></span>
                  <span>•</span>
                  <span>Words: <strong className="text-carbon-200">{currentFile.wordCount || currentFile.extractedText.split(/\s+/).filter(Boolean).length}</strong></span>
                  {typeof currentFile.pageCount === 'number' && (
                    <>
                      <span>•</span>
                      <span>Pages: <strong className="text-cyan-300">{currentFile.pageCount}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-carbon-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<FileUp className="w-3.5 h-3.5" />}
                className="text-xs font-mono flex-1 sm:flex-none"
              >
                Replace File
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                leftIcon={<X className="w-3.5 h-3.5 text-carbon-400 hover:text-rose-400" />}
                className="text-xs text-carbon-400 hover:text-rose-300 font-mono hover:bg-rose-950/30"
                aria-label="Remove uploaded file"
              >
                Remove
              </Button>
            </div>
          </div>

          {/* Extraction Warnings if any */}
          {extractionWarnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs font-sans space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" /> Extraction Notice:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-300/90 text-[11px]">
                {extractionWarnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* STATE 6: ERROR */}
      {uploadState === 'ERROR' && errorMessage && (
        <div
          role="alert"
          className="p-5 sm:p-6 rounded-2xl border border-rose-800/80 bg-rose-950/40 space-y-4 animate-fade-in text-rose-100"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-rose-900/60 border border-rose-700 text-rose-300 shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-rose-300 uppercase">
                <span>{errorMessage.title}</span>
                <Badge variant="red" size="sm">
                  ERROR
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-rose-200 font-sans leading-relaxed">
                {errorMessage.message}
              </p>
              {errorMessage.details && (
                <p className="text-xs text-rose-300/80 font-sans italic pt-0.5">
                  💡 {errorMessage.details}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-rose-900/50">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="text-xs font-mono text-rose-200 border-rose-800/80 hover:bg-rose-900/40"
            >
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRetry}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-carbon-950" />}
              className="text-xs font-mono bg-rose-500 hover:bg-rose-400 text-carbon-950 border-rose-400"
            >
              Try Another File
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
