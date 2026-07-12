import React, { useState, useRef, useEffect } from 'react';
import { Download, Trash2, Loader2, ArrowRight, Crop, Edit2 } from 'lucide-react';
import { ImageFile } from '../types';
import { formatBytes } from '../utils';

interface ImageItemProps {
  item: ImageFile;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export function ImageItem({ item, isSelected, onSelect, onRemove, onRename }: ImageItemProps) {
  const getSavings = () => {
    if (!item.webpSize) return 0;
    const savings = ((item.originalSize - item.webpSize) / item.originalSize) * 100;
    return savings.toFixed(1);
  };

  const isDone = item.status === 'success';
  const isConverting = item.status === 'converting';

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      const lastDot = editName.lastIndexOf('.');
      if (lastDot > 0) {
        inputRef.current.setSelectionRange(0, lastDot);
      } else {
        inputRef.current.select();
      }
    }
  }, [isEditingName]);

  const handleRenameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editName.trim() && editName !== item.name) {
      onRename(item.id, editName.trim());
    } else {
      setEditName(item.name);
    }
    setIsEditingName(false);
  };

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`p-4 rounded-2xl border flex items-center gap-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      } ${isConverting ? 'opacity-75' : ''}`}
    >
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
        <div className="flex items-center gap-1.5 mb-0.5">
          {isEditingName ? (
            <form onSubmit={handleRenameSubmit} className="flex-1 flex items-center min-w-0" onClick={e => e.stopPropagation()}>
              <input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleRenameSubmit()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditName(item.name);
                    setIsEditingName(false);
                  }
                }}
                className="w-full bg-slate-900/50 border border-indigo-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </form>
          ) : (
            <div className="text-sm font-medium text-slate-200 truncate flex-1 group flex items-center gap-2" title={item.name}>
              <span className="truncate">{item.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditingName(true); setEditName(item.name); }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 transition-opacity p-0.5 shrink-0"
                title="Rename file"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
          {item.crop.enabled && (
            <span className="shrink-0 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Crop className="w-2.5 h-2.5" /> Crop
            </span>
          )}
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
      <div className="flex flex-col items-end gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
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

