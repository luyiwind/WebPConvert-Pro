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
}
