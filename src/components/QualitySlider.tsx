import React from 'react';

interface QualitySliderProps {
  quality: number;
  setQuality: (val: number) => void;
}

export function QualitySlider({ quality, setQuality }: QualitySliderProps) {
  return (
    <div className="w-full bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <label htmlFor="quality" className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
          WebP Compression Quality
        </label>
        <span className="text-indigo-400 font-mono text-sm">{quality}%</span>
      </div>
      <input
        id="quality"
        type="range"
        min="1"
        max="100"
        value={quality}
        onChange={(e) => setQuality(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
      />
      <div className="flex justify-between text-[10px] text-slate-500 mt-3">
        <span>Smaller File</span>
        <span>Better Quality</span>
      </div>
    </div>
  );
}
