export interface CropSettings {
  enabled: boolean;
  aspectRatio: 'free' | '1:1' | '4:3' | '16:9';
  x: number;      // 0 to 1
  y: number;      // 0 to 1
  width: number;  // 0 to 1
  height: number; // 0 to 1
  pixelWidth?: number;
  pixelHeight?: number;
}

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  originalPreview: string;
  originalSize: number;
  webpBlob: Blob | null;
  webpPreview: string | null;
  webpSize: number | null;
  status: 'idle' | 'converting' | 'success' | 'error';
  crop: CropSettings;
  dimensions?: { width: number; height: number };
}

