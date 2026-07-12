import React from 'react';
import { Download, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { ImageFile } from '../types';
import { formatBytes } from '../utils';

interface ImageItemProps {
  item: ImageFile;
  onRemove: (id: string) => void;
}

export function ImageItem({ item, onRemove }: ImageItemProps) {
  const getSavings = () => {
    if (!item.webpSize) return 0;
    const savings = ((item.originalSize - item.webpSize) / item.originalSize) * 100;
    return savings.toFixed(1);
  };

  const isDone = item.status === 'success';
  const isConverting = item.status === 'converting';

  return (
    <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 transition-all hover:bg-white/10 ${isConverting ? 'opacity-70' : ''}`}>
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden border border-white/5 relative">
        <img src={item.originalPreview} alt={item.name} className="w-full h-full object-cover opacity-80" />
        {isConverting && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-200 truncate" title={item.name}>
          {item.name}
        </div>
        
        {isConverting ? (
          <div className="mt-2">
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 animate-pulse w-full"></div>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Converting...</div>
          </div>
        ) : isDone && item.webpSize ? (
          <div className="flex items-center gap-2 mt-1 font-mono text-[10px]">
            <span className="text-slate-500">{formatBytes(item.originalSize)}</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="text-emerald-400 font-bold">{formatBytes(item.webpSize)}</span>
          </div>
        ) : item.status === 'error' ? (
          <div className="text-[10px] text-red-400 mt-1">Conversion failed</div>
        ) : (
          <div className="text-[10px] text-slate-500 mt-1">Waiting...</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        {isDone && item.webpSize && (
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
            -{getSavings()}%
          </span>
        )}
        <div className="flex items-center gap-3">
          {isDone && item.webpPreview && (
            <a
              href={item.webpPreview}
              download={item.name.replace(/\.[^/.]+$/, "") + ".webp"}
              className="text-indigo-400 text-xs hover:text-indigo-300 hover:underline transition-colors flex items-center gap-1"
              title="Download WebP"
            >
              <Download className="w-3 h-3" />
              Download
            </a>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="text-slate-500 hover:text-red-400 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
