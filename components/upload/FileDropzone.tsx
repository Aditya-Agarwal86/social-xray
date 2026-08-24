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
        let completedFileStateTelemetry: any = undefined;
        let extractedInventory: any = undefined;

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
          extractedInventory = result.inventory;
          if (result.processingWarnings && result.processingWarnings.length > 0) {
            warningsList = result.processingWarnings;
            setExtractionWarnings(result.processingWarnings);
          }
          if (result.socialContent?.telemetry) {
            completedFileStateTelemetry = result.socialContent.telemetry;
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
          telemetry: completedFileStateTelemetry,
          inventory: extractedInventory,
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
      className="space-y-3 font-sans text-slate-900 dark:text-slate-100"
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
            'group relative flex flex-col items-center justify-center p-7 sm:p-10 rounded-2xl border-2 border-dashed transition-all duration-150 cursor-pointer select-none min-h-[190px]',
            uploadState === 'DRAGGING'
              ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 shadow-sm scale-[1.005]'
              : 'border-slate-300 dark:border-slate-700/80 hover:border-sky-500/80 dark:hover:border-sky-500/80 bg-slate-50/50 hover:bg-slate-100/60 dark:bg-slate-900/60 dark:hover:bg-slate-850/80',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
        >
          <div className="relative z-10 flex flex-col items-center text-center space-y-3 max-w-lg">
            {/* Upload Icon */}
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-150',
                uploadState === 'DRAGGING'
                  ? 'bg-sky-100 dark:bg-sky-950 border-sky-400 text-sky-600 dark:text-sky-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:border-sky-300 dark:group-hover:border-sky-700 shadow-sm'
              )}
            >
              <UploadCloud className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                {uploadState === 'DRAGGING' ? 'Drop post asset to start scan' : 'Drop your social post here'}
              </h3>
              <p
                id="file-upload-instructions"
                className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans"
              >
                Drag & drop a screenshot or PDF document, or{' '}
                <span className="text-sky-600 dark:text-sky-400 font-medium underline underline-offset-4 hover:text-sky-700 dark:hover:text-sky-300">
                  browse files
                </span>{' '}
                from your device.
              </p>
            </div>

            {/* Supported File Specs */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono shadow-2xs">
                PDF
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono shadow-2xs">
                PNG
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono shadow-2xs">
                JPG
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono shadow-2xs">
                WEBP
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-xs ml-1">
                • Max 10MB
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
          className="p-8 rounded-2xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center space-y-3 min-h-[190px] shadow-sm"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
            <Loader2 className="w-5 h-5 animate-spin text-sky-600 dark:text-sky-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Validating post asset
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verifying file integrity, MIME structure, and 10MB limits...
            </p>
          </div>
        </div>
      )}

      {/* STATE 4: PROCESSING (In-browser PDF or OCR extraction) */}
      {uploadState === 'PROCESSING' && (
        <div
          role="status"
          aria-live="polite"
          className="p-6 sm:p-7 rounded-2xl border border-sky-200 dark:border-sky-800/80 bg-white dark:bg-slate-900 space-y-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
                <Scan className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  In-Browser Document Extraction
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Zero cloud storage. Vision and document layout processed locally in your browser.
                </span>
              </div>
            </div>

            <Badge variant="cyan" size="sm" className="self-start sm:self-auto font-semibold">
              {extractionProgress.progress}%
            </Badge>
          </div>

          {/* Granular Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                {extractionProgress.message}
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300 ease-out"
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
          className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* File Info Preview */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Thumbnail or Badge */}
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
                {currentFile.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentFile.previewUrl}
                    alt={currentFile.name}
                    className="w-full h-full object-cover"
                  />
                ) : currentFile.source === 'pdf' ? (
                  <FileText className="w-6 h-6 text-rose-500" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-sky-500" />
                )}
              </div>

              {/* Metadata */}
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
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
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-md font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Parsed
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Size: <strong className="text-slate-700 dark:text-slate-200">{formatFileSize(currentFile.size)}</strong></span>
                  <span>•</span>
                  <span>Words: <strong className="text-slate-700 dark:text-slate-200">{currentFile.wordCount || currentFile.extractedText.split(/\s+/).filter(Boolean).length}</strong></span>
                  {typeof currentFile.pageCount === 'number' && (
                    <>
                      <span>•</span>
                      <span>Pages: <strong className="text-slate-700 dark:text-slate-200">{currentFile.pageCount}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<FileUp className="w-3.5 h-3.5" />}
                className="text-xs flex-1 sm:flex-none"
              >
                Replace File
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                leftIcon={<X className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />}
                className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                aria-label="Remove uploaded file"
              >
                Remove
              </Button>
            </div>
          </div>

          {/* Extraction Warnings if any */}
          {extractionWarnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" /> Extraction Notice:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800/90 dark:text-amber-300/90 text-[11px]">
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
          className="p-4 sm:p-5 rounded-2xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 space-y-3 animate-fade-in text-rose-900 dark:text-rose-100"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-300">
                <span>{errorMessage.title}</span>
                <Badge variant="red" size="sm">
                  ERROR
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-200 leading-relaxed">
                {errorMessage.message}
              </p>
              {errorMessage.details && (
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80 italic pt-0.5">
                  💡 {errorMessage.details}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-200/60 dark:border-rose-900/40">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="text-xs text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800/80"
            >
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRetry}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-white dark:text-slate-950" />}
              className="text-xs"
            >
              Try Another File
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
