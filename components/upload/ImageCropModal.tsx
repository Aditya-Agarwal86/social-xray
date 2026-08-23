'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crop, X, Check, RotateCcw, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
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

  // Load object URL when file changes
  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setImageSrc(url);

    // Initial default crop: target middle/right area often used for social captions
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

  // Handle Drag / Resize
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
        const maxDelta = init.width - 10;
        const boundedDeltaX = Math.min(maxDelta, Math.max(-init.x, deltaXPercent));
        const newX = init.x + boundedDeltaX;
        const newW = init.width - boundedDeltaX;
        const newH = Math.max(10, Math.min(100 - init.y, init.height + deltaYPercent));
        setCropBox((prev) => ({ ...prev, x: newX, width: newW, height: newH }));
      } else if (dragMode === 'ne') {
        const maxDeltaY = init.height - 10;
        const boundedDeltaY = Math.min(maxDeltaY, Math.max(-init.y, deltaYPercent));
        const newY = init.y + boundedDeltaY;
        const newH = init.height - boundedDeltaY;
        const newW = Math.max(10, Math.min(100 - init.x, init.width + deltaXPercent));
        setCropBox((prev) => ({ ...prev, y: newY, height: newH, width: newW }));
      } else if (dragMode === 'nw') {
        const maxDeltaX = init.width - 10;
        const maxDeltaY = init.height - 10;
        const boundedDeltaX = Math.min(maxDeltaX, Math.max(-init.x, deltaXPercent));
        const boundedDeltaY = Math.min(maxDeltaY, Math.max(-init.y, deltaYPercent));
        setCropBox({
          x: init.x + boundedDeltaX,
          y: init.y + boundedDeltaY,
          width: init.width - boundedDeltaX,
          height: init.height - boundedDeltaY,
        });
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
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Execute Native Canvas Crop and trigger re-extraction
  const handleExecuteCrop = async () => {
    if (!imageRef.current || !file) return;

    const img = imageRef.current;
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    const sourceX = Math.round((cropBox.x / 100) * naturalW);
    const sourceY = Math.round((cropBox.y / 100) * naturalH);
    const sourceW = Math.round((cropBox.width / 100) * naturalW);
    const sourceH = Math.round((cropBox.height / 100) * naturalH);

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(sourceW, 10);
    canvas.height = Math.max(sourceH, 10);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedName = `cropped-${file.name}`;
        onCropAndExtract(blob, croppedName);
        onClose();
      }
    }, 'image/png');
  };

  const handlePresetSelect = (preset: 'full' | 'right_column' | 'bottom_half' | 'top_half') => {
    if (preset === 'full') {
      setCropBox({ x: 0, y: 0, width: 100, height: 100 });
    } else if (preset === 'right_column') {
      setCropBox({ x: 45, y: 5, width: 52, height: 90 });
    } else if (preset === 'bottom_half') {
      setCropBox({ x: 5, y: 50, width: 90, height: 45 });
    } else if (preset === 'top_half') {
      setCropBox({ x: 5, y: 5, width: 90, height: 45 });
    }
  };

  if (!isOpen || !file || !imageSrc) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-carbon-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-carbon-800 bg-carbon-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 id="crop-modal-title" className="text-sm sm:text-base font-mono font-bold text-white uppercase tracking-wider">
                Crop &amp; Target Social Copy
              </h3>
              <p className="text-xs text-carbon-400 font-sans">
                Drag the box over the post caption &amp; hashtags to isolate them from platform UI.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-carbon-400 hover:text-white rounded-lg hover:bg-carbon-800 transition-colors"
            aria-label="Close crop modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Crop Presets */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 bg-carbon-950/40 border-b border-carbon-800/80 text-xs font-mono text-carbon-300">
          <span className="text-carbon-400 text-[11px] uppercase">Quick Presets:</span>
          <button
            type="button"
            onClick={() => handlePresetSelect('right_column')}
            className="px-2.5 py-1 rounded bg-carbon-800 hover:bg-carbon-700 hover:text-cyan-300 transition-colors border border-carbon-700"
          >
            Right Column (Desktop Post)
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('bottom_half')}
            className="px-2.5 py-1 rounded bg-carbon-800 hover:bg-carbon-700 hover:text-cyan-300 transition-colors border border-carbon-700"
          >
            Bottom Area (Mobile Caption)
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('full')}
            className="px-2.5 py-1 rounded bg-carbon-800 hover:bg-carbon-700 hover:text-cyan-300 transition-colors border border-carbon-700"
          >
            Full Image
          </button>
        </div>

        {/* Interactive Crop Canvas Viewport */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-carbon-950/90 relative min-h-[320px]">
          <div
            ref={containerRef}
            className="relative inline-block select-none max-h-[55vh] max-w-full rounded-lg overflow-hidden border border-carbon-800 shadow-xl cursor-crosshair"
          >
            {/* Base Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              className="max-h-[55vh] max-w-full object-contain pointer-events-none block"
            />

            {/* Dark Mask Over Outside Area */}
            <div className="absolute inset-0 bg-carbon-950/60 pointer-events-none" />

            {/* Interactive Selected Crop Window */}
            <div
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.width}%`,
                height: `${cropBox.height}%`,
              }}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              className="absolute border-2 border-cyan-400 shadow-[0_0_0_9999px_rgba(7,8,12,0.65)] cursor-move z-10 box-border bg-cyan-500/10"
            >
              {/* Scan Reticle corners */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white" />

              {/* Corner Resize Handles */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'nw')}
                className="absolute -top-2 -left-2 w-4 h-4 bg-cyan-400 rounded-sm cursor-nwse-resize"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'ne')}
                className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-sm cursor-nesw-resize"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'sw')}
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-cyan-400 rounded-sm cursor-nesw-resize"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'se')}
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-400 rounded-sm cursor-nwse-resize"
              />

              {/* Center target indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-carbon-950/80 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                  TARGET OCR ZONE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-carbon-800 bg-carbon-950/80">
          <div className="text-xs font-mono text-carbon-400">
            Selected Box: <strong className="text-white">{Math.round(cropBox.width)}% × {Math.round(cropBox.height)}%</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isProcessing}
              className="text-xs font-mono"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleExecuteCrop}
              isLoading={isProcessing}
              leftIcon={<Check className="w-4 h-4 text-carbon-950" />}
              className="text-xs font-mono"
            >
              Run OCR on Selected Area
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
