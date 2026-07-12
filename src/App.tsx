import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, FileImage, Download } from 'lucide-react';
import { Dropzone } from './components/Dropzone';
import { QualitySlider } from './components/QualitySlider';
import { ImageItem } from './components/ImageItem';
import { ImageCropper } from './components/ImageCropper';
import { ImageFile, CropSettings } from './types';
import { convertToWebp, getImageDimensions } from './utils';

export default function App() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [debouncedQuality, setDebouncedQuality] = useState(80);

  // Use a ref to access the latest files within useEffect without adding it as a dependency
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Debounce quality changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuality(quality);
    }, 500);
    return () => clearTimeout(timer);
  }, [quality]);

  // Re-convert files when debouncedQuality changes
  useEffect(() => {
    if (filesRef.current.length === 0) return;
    
    filesRef.current.forEach(file => {
      // Re-convert everything when quality changes, except those actively converting
      if (file.status !== 'converting') {
        processFile(file.id, file.file, debouncedQuality, file.crop);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuality]); 

  const processFile = async (id: string, fileData: File, targetQuality: number, cropSettings?: CropSettings) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'converting' } : f));
    
    try {
      const webpBlob = await convertToWebp(fileData, targetQuality, cropSettings);
      const webpPreview = URL.createObjectURL(webpBlob);
      
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          if (f.webpPreview) URL.revokeObjectURL(f.webpPreview);
          return {
            ...f,
            webpBlob,
            webpPreview,
            webpSize: webpBlob.size,
            status: 'success'
          };
        }
        return f;
      }));
    } catch (error) {
      console.error("Conversion error:", error);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error' } : f));
    }
  };

  const onFilesAdded = useCallback(async (newFiles: File[]) => {
    const newImageFiles: ImageFile[] = [];

    for (const file of newFiles) {
      const id = Math.random().toString(36).substring(7) + Date.now().toString();
      const originalPreview = URL.createObjectURL(file);
      
      let dimensions = { width: 800, height: 600 };
      try {
        dimensions = await getImageDimensions(file);
      } catch (err) {
        console.error("Failed to get dimensions:", err);
      }

      newImageFiles.push({
        id,
        file,
        name: file.name,
        originalPreview,
        originalSize: file.size,
        webpBlob: null,
        webpPreview: null,
        webpSize: null,
        status: 'idle',
        crop: {
          enabled: false,
          aspectRatio: 'free',
          x: 0.1,
          y: 0.1,
          width: 0.8,
          height: 0.8
        },
        dimensions
      });
    }

    setFiles(prev => {
      const updated = [...prev, ...newImageFiles];
      return updated;
    });

    // Automatically select the first file from the newly added files if nothing is selected
    setSelectedId(prev => prev || newImageFiles[0]?.id || null);

    // Start processing immediately with current quality
    newImageFiles.forEach(f => {
      processFile(f.id, f.file, debouncedQuality, f.crop);
    });
  }, [debouncedQuality]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.originalPreview);
        if (fileToRemove.webpPreview) URL.revokeObjectURL(fileToRemove.webpPreview);
      }
      const filtered = prev.filter(f => f.id !== id);
      
      // Update selectedId if the deleted one was selected
      setSelectedId(prevSelectedId => {
        if (prevSelectedId === id) {
          return filtered.length > 0 ? filtered[0].id : null;
        }
        return prevSelectedId;
      });

      return filtered;
    });
  }, []);

  const handleCropChange = useCallback((id: string, newCrop: CropSettings) => {
    setFiles(prev => {
      return prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            crop: newCrop
          };
        }
        return f;
      });
    });

    const targetFile = filesRef.current.find(f => f.id === id);
    if (targetFile) {
      processFile(id, targetFile.file, debouncedQuality, newCrop);
    }
  }, [debouncedQuality]);

  const handleApplyCropToAll = useCallback((cropSettings: CropSettings) => {
    setFiles(prev => {
      return prev.map(f => {
        return {
          ...f,
          crop: { ...cropSettings }
        };
      });
    });

    // Re-process all images with the synced crop settings
    filesRef.current.forEach(file => {
      processFile(file.id, file.file, debouncedQuality, cropSettings);
    });
  }, [debouncedQuality]);

  const downloadAll = () => {
    const completedFiles = files.filter(f => f.status === 'success' && f.webpPreview);
    completedFiles.forEach((file, index) => {
      // Slight delay to prevent browser from blocking multiple downloads
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = file.webpPreview!;
        a.download = file.name.replace(/\.[^/.]+$/, "") + ".webp";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 200);
    });
  };

  const activeImage = files.find(f => f.id === selectedId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 relative flex flex-col overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/15 rounded-full blur-[120px]"></div>
      </div>

      <header className="h-16 px-6 border-b border-white/10 bg-white/5 backdrop-blur-md z-10 sticky top-0">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileImage className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">WebP<span className="text-indigo-400">Convert</span> Pro</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Controls */}
          <div className="space-y-6 lg:col-span-1">
            <Dropzone onFilesAdded={onFilesAdded} />
            <QualitySlider quality={quality} setQuality={setQuality} />
            
            {files.length > 0 && (
              <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 text-sm text-indigo-200 backdrop-blur-sm">
                <p className="flex items-center gap-2 font-bold mb-1 uppercase text-xs tracking-wider text-indigo-300">
                  <Settings className="w-4 h-4" /> Auto-Process
                </p>
                <p className="opacity-90 text-[11px] text-indigo-300/80">Adjusting quality or crop settings will automatically re-compress all uploaded images instantly.</p>
              </div>
            )}
          </div>

          {/* Right Column: Editor & List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Active Image Cropper */}
            {activeImage && (
              <ImageCropper
                activeImage={activeImage}
                onCropChange={handleCropChange}
                onApplyToAll={handleApplyCropToAll}
              />
            )}

            {/* List */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  Processing Queue 
                  {files.length > 0 && (
                    <span className="text-indigo-400 font-mono">
                      ({files.length})
                    </span>
                  )}
                </h2>
                
                {files.some(f => f.status === 'success') && (
                  <button
                    onClick={downloadAll}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-full transition-colors shadow-lg shadow-indigo-500/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </button>
                )}
              </div>

              {files.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5 text-slate-400 backdrop-blur-sm">
                  <FileImage className="w-12 h-12 mb-3 text-slate-600" />
                  <p className="text-sm">No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {files.map(item => (
                    <ImageItem
                      key={item.id}
                      item={item}
                      isSelected={item.id === selectedId}
                      onSelect={setSelectedId}
                      onRemove={removeFile}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
