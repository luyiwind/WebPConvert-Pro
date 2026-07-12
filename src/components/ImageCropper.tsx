import React, { useRef, useState, useEffect } from 'react';
import { ImageFile, CropSettings } from '../types';
import { Maximize, Minimize, Move, Check, Copy, Sliders, Type, Grid } from 'lucide-react';

interface ImageCropperProps {
  activeImage: ImageFile;
  onCropChange: (id: string, crop: CropSettings) => void;
  onApplyToAll: (crop: CropSettings) => void;
}

export function ImageCropper({ activeImage, onCropChange, onApplyToAll }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const { crop } = activeImage;

  // Track target pixel inputs
  const [pixelW, setPixelW] = useState<string>(crop.pixelWidth?.toString() || '');
  const [pixelH, setPixelH] = useState<string>(crop.pixelHeight?.toString() || '');

  // Keep pixel inputs in sync when activeImage or crop changes
  useEffect(() => {
    setPixelW(crop.pixelWidth?.toString() || '');
    setPixelH(crop.pixelHeight?.toString() || '');
  }, [crop.pixelWidth, crop.pixelHeight, activeImage.id]);

  // Handle setting/changing the aspect ratio
  const handleRatioChange = (ratio: 'free' | '1:1' | '4:3' | '16:9') => {
    let newWidth = crop.width;
    let newHeight = crop.height;

    if (ratio !== 'free') {
      const imgWidth = activeImage.dimensions?.width || 800;
      const imgHeight = activeImage.dimensions?.height || 600;
      const imageAspect = imgWidth / imgHeight;

      let targetRatio = 1;
      if (ratio === '1:1') targetRatio = 1;
      if (ratio === '4:3') targetRatio = 4 / 3;
      if (ratio === '16:9') targetRatio = 16 / 9;

      // Adjust height to match ratio based on targetRatio and image scale
      newWidth = crop.width;
      newHeight = (crop.width * imageAspect) / targetRatio;

      // Ensure it doesn't overflow
      if (newHeight > 1) {
        newHeight = 1;
        newWidth = (newHeight * targetRatio) / imageAspect;
      }
      
      // Center the crop box
      const newX = Math.max(0, (1 - newWidth) / 2);
      const newY = Math.max(0, (1 - newHeight) / 2);

      onCropChange(activeImage.id, {
        ...crop,
        aspectRatio: ratio,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    } else {
      onCropChange(activeImage.id, {
        ...crop,
        aspectRatio: ratio,
      });
    }
  };

  // Toggle Crop Enabled status
  const handleToggleEnabled = () => {
    onCropChange(activeImage.id, {
      ...crop,
      enabled: !crop.enabled,
    });
  };

  // Handle dragging the crop box
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!crop.enabled) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setCropStart({ x: crop.x, y: crop.y, w: crop.width, h: crop.height });
  };

  // Handle resizing from bottom-right corner
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!crop.enabled) return;
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setCropStart({ x: crop.x, y: crop.y, w: crop.width, h: crop.height });
  };

  // Handle mouse move for dragging/resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = (e.clientX - dragStart.x) / rect.width;
      const deltaY = (e.clientY - dragStart.y) / rect.height;

      if (isDragging) {
        let newX = cropStart.x + deltaX;
        let newY = cropStart.y + deltaY;

        // Boundary checks
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + cropStart.w > 1) newX = 1 - cropStart.w;
        if (newY + cropStart.h > 1) newY = 1 - cropStart.h;

        onCropChange(activeImage.id, {
          ...crop,
          x: newX,
          y: newY,
        });
      } else if (isResizing) {
        let newWidth = cropStart.w + deltaX;
        let newHeight = cropStart.h + deltaY;

        // If aspect ratio is locked
        if (crop.aspectRatio !== 'free') {
          const imgWidth = activeImage.dimensions?.width || 800;
          const imgHeight = activeImage.dimensions?.height || 600;
          const imageAspect = imgWidth / imgHeight;

          let targetRatio = 1;
          if (crop.aspectRatio === '1:1') targetRatio = 1;
          if (crop.aspectRatio === '4:3') targetRatio = 4 / 3;
          if (crop.aspectRatio === '16:9') targetRatio = 16 / 9;

          // Scale height relative to width
          newHeight = (newWidth * imageAspect) / targetRatio;
        }

        // Boundary checks
        if (cropStart.x + newWidth > 1) {
          newWidth = 1 - cropStart.x;
          if (crop.aspectRatio !== 'free') {
            const imgWidth = activeImage.dimensions?.width || 800;
            const imgHeight = activeImage.dimensions?.height || 600;
            const imageAspect = imgWidth / imgHeight;
            let targetRatio = 1;
            if (crop.aspectRatio === '1:1') targetRatio = 1;
            if (crop.aspectRatio === '4:3') targetRatio = 4 / 3;
            if (crop.aspectRatio === '16:9') targetRatio = 16 / 9;
            newHeight = (newWidth * imageAspect) / targetRatio;
          }
        }
        if (cropStart.y + newHeight > 1) {
          newHeight = 1 - cropStart.y;
          if (crop.aspectRatio !== 'free') {
            const imgWidth = activeImage.dimensions?.width || 800;
            const imgHeight = activeImage.dimensions?.height || 600;
            const imageAspect = imgWidth / imgHeight;
            let targetRatio = 1;
            if (crop.aspectRatio === '1:1') targetRatio = 1;
            if (crop.aspectRatio === '4:3') targetRatio = 4 / 3;
            if (crop.aspectRatio === '16:9') targetRatio = 16 / 9;
            newWidth = (newHeight * targetRatio) / imageAspect;
          }
        }

        // Minimum dimensions (e.g. 10%)
        if (newWidth < 0.1) newWidth = 0.1;
        if (newHeight < 0.1) newHeight = 0.1;

        onCropChange(activeImage.id, {
          ...crop,
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, cropStart, crop, activeImage.id, activeImage.dimensions]);

  // Handle numeric pixels settings
  const applyPixelDimensions = () => {
    const wVal = parseInt(pixelW);
    const hVal = parseInt(pixelH);

    onCropChange(activeImage.id, {
      ...crop,
      pixelWidth: isNaN(wVal) || wVal <= 0 ? undefined : wVal,
      pixelHeight: isNaN(hVal) || hVal <= 0 ? undefined : hVal,
    });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-6 relative">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Image Editor & Crop
          </h2>
          <p className="text-xs text-slate-400 truncate max-w-[280px]" title={activeImage.name}>
            Editing: {activeImage.name}
          </p>
        </div>
        
        {/* Enable / Disable toggle */}
        <button
          onClick={handleToggleEnabled}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            crop.enabled
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          {crop.enabled ? '✓ Crop Enabled' : 'Enable Crop'}
        </button>
      </div>

      {/* Visual Canvas Area */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center min-h-[220px] max-h-[360px] p-2">
        <div ref={containerRef} className="relative inline-block select-none">
          <img
            ref={imageRef}
            src={activeImage.originalPreview}
            alt="To crop"
            className="max-h-[300px] w-auto h-auto max-w-full rounded-lg"
            draggable={false}
          />

          {/* Semi-transparent masks if crop is enabled */}
          {crop.enabled && (
            <>
              {/* Dark backdrop overlay outside the crop box */}
              <div className="absolute inset-0 bg-black/60 pointer-events-none" style={{
                clipPath: `polygon(
                  0% 0%, 100% 0%, 100% 100%, 0% 100%,
                  0% 0%,
                  ${crop.x * 100}% ${crop.y * 100}%,
                  ${crop.x * 100}% ${(crop.y + crop.height) * 100}%,
                  ${(crop.x + crop.width) * 100}% ${(crop.y + crop.height) * 100}%,
                  ${(crop.x + crop.width) * 100}% ${crop.y * 100}%,
                  ${crop.x * 100}% ${crop.y * 100}%
                )`
              }} />

              {/* Draggable Crop Rectangle Overlay */}
              <div
                className="absolute border-2 border-indigo-500 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0)]"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.width * 100}%`,
                  height: `${crop.height * 100}%`,
                }}
                onMouseDown={handleDragStart}
              >
                {/* Visual Grid Lines inside crop box to look extremely neat */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                </div>

                {/* Resize corner handle (bottom-right) */}
                <div
                  className="absolute bottom-[-4px] right-[-4px] w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-20 hover:scale-125 transition-transform"
                  onMouseDown={handleResizeStart}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {crop.enabled && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Ratio settings */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 block">
              Aspect Ratio (比例)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['free', '1:1', '4:3', '16:9'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => handleRatioChange(ratio)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    crop.aspectRatio === ratio
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Pixel Size Output Target */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 block">
              Output Dimensions (具体像素大小)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Width"
                  value={pixelW}
                  onChange={(e) => setPixelW(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">px</span>
              </div>
              <span className="text-slate-500 text-xs font-mono">×</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Height"
                  value={pixelH}
                  onChange={(e) => setPixelH(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">px</span>
              </div>
              <button
                onClick={applyPixelDimensions}
                className="bg-indigo-500 hover:bg-indigo-400 text-white p-2 rounded-xl transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center text-xs gap-1.5 px-3"
                title="Apply custom output dimensions"
              >
                <Check className="w-4 h-4" /> Apply
              </button>
            </div>
            {activeImage.dimensions && (
              <p className="text-[10px] text-slate-500 mt-1.5 font-mono">
                Original image size: {activeImage.dimensions.width}px × {activeImage.dimensions.height}px
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sync Control (批量同步控制) */}
      <div className="border-t border-white/10 pt-4 mt-2">
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-0.5">
              Batch Sync Controls
            </div>
            <p className="text-[10px] text-slate-500">
              Synchronize the current crop configuration to all uploaded images.
            </p>
          </div>
          <button
            onClick={() => onApplyToAll(crop)}
            className="flex items-center gap-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition-all self-stretch sm:self-auto justify-center"
            title="Apply this exact crop settings to all uploaded files"
          >
            <Copy className="w-3.5 h-3.5" />
            Sync To All (批量同步)
          </button>
        </div>
      </div>
    </div>
  );
}
