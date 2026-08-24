'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crop, X, Check, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface CropBox {
  x: number; // in percentages (0 to 100)
  y: number;
  width: number;
  height: number;
}

interface ImageCropModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onCropAndExtract: (croppedBlob: Blob, croppedFileName: string) => void;
  isProcessing?: boolean;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  file,
  onClose,
  onCropAndExtract,
  isProcessing = false,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cropBox, setCropBox] = useState<CropBox>({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; initialBox: CropBox }>({
    mouseX: 0,
    mouseY: 0,
    initialBox: { x: 10, y: 10, width: 80, height: 80 },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setImageSrc(url);

    setCropBox({
      x: 15,
      y: 15,
      width: 70,
      height: 70,
    });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleMouseDown = (
    e: React.MouseEvent,
    mode: 'move' | 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialBox: { ...cropBox },
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragMode || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const deltaXPercent = ((e.clientX - dragStart.mouseX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStart.mouseY) / rect.height) * 100;
      const init = dragStart.initialBox;

      if (dragMode === 'move') {
        const newX = Math.max(0, Math.min(100 - init.width, init.x + deltaXPercent));
        const newY = Math.max(0, Math.min(100 - init.height, init.y + deltaYPercent));
        setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (dragMode === 'se') {
        const newW = Math.max(10, Math.min(100 - init.x, init.width + deltaXPercent));
        const newH = Math.max(10, Math.min(100 - init.y, init.height + deltaYPercent));
        setCropBox((prev) => ({ ...prev, width: newW, height: newH }));
      } else if (dragMode === 'sw') {
        const rawX = init.x + deltaXPercent;
        const newX = Math.max(0, Math.min(init.x + init.width - 10, rawX));
        const newW = init.width + (init.x - newX);
        const newH = Math.max(10, Math.min(100 - init.y, init.height + deltaYPercent));
        setCropBox((prev) => ({ ...prev, x: newX, width: newW, height: newH }));
      } else if (dragMode === 'ne') {
        const rawY = init.y + deltaYPercent;
        const newY = Math.max(0, Math.min(init.y + init.height - 10, rawY));
        const newH = init.height + (init.y - newY);
        const newW = Math.max(10, Math.min(100 - init.x, init.width + deltaXPercent));
        setCropBox((prev) => ({ ...prev, y: newY, width: newW, height: newH }));
      } else if (dragMode === 'nw') {
        const rawX = init.x + deltaXPercent;
        const newX = Math.max(0, Math.min(init.x + init.width - 10, rawX));
        const newW = init.width + (init.x - newX);

        const rawY = init.y + deltaYPercent;
        const newY = Math.max(0, Math.min(init.y + init.height - 10, rawY));
        const newH = init.height + (init.y - newY);

        setCropBox({ x: newX, y: newY, width: newW, height: newH });
      }
    },
    [isDragging, dragMode, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragMode(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handlePresetSelect = (preset: 'full' | 'top_half' | 'bottom_half' | 'right_column' | 'center') => {
    switch (preset) {
      case 'full':
        setCropBox({ x: 0, y: 0, width: 100, height: 100 });
        break;
      case 'top_half':
        setCropBox({ x: 0, y: 0, width: 100, height: 50 });
        break;
      case 'bottom_half':
        setCropBox({ x: 0, y: 50, width: 100, height: 50 });
        break;
      case 'right_column':
        setCropBox({ x: 45, y: 0, width: 55, height: 100 });
        break;
      case 'center':
        setCropBox({ x: 15, y: 15, width: 70, height: 70 });
        break;
    }
  };

  const handleExecuteCrop = async () => {
    if (!imageRef.current || !file) return;

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    const cropPixelX = (cropBox.x / 100) * naturalW;
    const cropPixelY = (cropBox.y / 100) * naturalH;
    const cropPixelW = (cropBox.width / 100) * naturalW;
    const cropPixelH = (cropBox.height / 100) * naturalH;

    canvas.width = Math.max(1, cropPixelW);
    canvas.height = Math.max(1, cropPixelH);

    ctx.drawImage(
      img,
      cropPixelX,
      cropPixelY,
      cropPixelW,
      cropPixelH,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedName = `cropped_${file.name.replace(/\.[^/.]+$/, '')}.png`;
        onCropAndExtract(blob, croppedName);
      }
    }, 'image/png');
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-sky-400">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Crop &amp; Target OCR Area
                </h3>
                <Badge variant="cyan" size="sm">
                  Precision Scan
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag the crop box to isolate the exact post copy, caption, or thread.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close Crop modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="px-4 py-2.5 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300 shrink-0">
            Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => handlePresetSelect('center')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-300 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
          >
            Main Post Center
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('right_column')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-300 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
          >
            Right Column
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('bottom_half')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-300 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
          >
            Bottom Caption
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('full')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-300 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
          >
            Full Image
          </button>
        </div>

        {/* Interactive Crop Canvas Viewport */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-900 relative min-h-[320px]">
          <div
            ref={containerRef}
            className="relative inline-block select-none max-h-[55vh] max-w-full rounded-lg overflow-hidden border border-slate-700 shadow-xl cursor-crosshair"
          >
            {/* Base Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              className="max-h-[55vh] max-w-full object-contain pointer-events-none block"
            />

            {/* Mask Over Outside Area */}
            <div className="absolute inset-0 bg-slate-950/60 pointer-events-none" />

            {/* Interactive Selected Crop Window */}
            <div
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.width}%`,
                height: `${cropBox.height}%`,
              }}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              className="absolute border-2 border-sky-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] cursor-move z-10 box-border bg-sky-500/10"
            >
              {/* Corner Resize Handles */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'nw')}
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-sky-400 rounded-sm cursor-nwse-resize"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'ne')}
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-sky-400 rounded-sm cursor-nesw-resize"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'sw')}
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-sky-400 rounded-sm cursor-nesw-resize"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'se')}
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-sky-400 rounded-sm cursor-nwse-resize"
              />

              {/* Center target label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-medium text-sky-300 border border-sky-500/30">
                  Target OCR Zone
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Selected Box: <strong className="text-slate-900 dark:text-white">{Math.round(cropBox.width)}% × {Math.round(cropBox.height)}%</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isProcessing}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleExecuteCrop}
              isLoading={isProcessing}
              leftIcon={<Check className="w-4 h-4 text-white dark:text-slate-950" />}
              className="text-xs"
            >
              Run OCR on Selected Area
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
