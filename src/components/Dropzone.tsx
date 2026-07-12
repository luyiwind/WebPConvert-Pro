import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export function Dropzone({ onFilesAdded }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type === 'image/jpeg' || file.type === 'image/png'
    );
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFilesAdded(files);
      // Reset input value so the same files can be selected again if removed
      e.target.value = '';
    }
  }, [onFilesAdded]);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl transition-colors cursor-pointer backdrop-blur-sm ${
        isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
        <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
      </div>
      <p className="text-sm text-slate-400">
        Drag & drop more images, or <span className="text-indigo-400">browse files</span>
      </p>
      <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 20MB</p>
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/png, image/jpeg"
        className="hidden"
        onChange={onFileInput}
      />
    </div>
  );
}
