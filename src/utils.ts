import { CropSettings } from './types';

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for dimensions'));
    };
    img.src = objectUrl;
  });
};

export const convertToWebp = (file: File, quality: number, crop?: CropSettings): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      
      let sx = 0;
      let sy = 0;
      let sWidth = img.width;
      let sHeight = img.height;
      
      if (crop && crop.enabled) {
        sx = img.width * crop.x;
        sy = img.height * crop.y;
        sWidth = img.width * crop.width;
        sHeight = img.height * crop.height;
      }
      
      // Determine canvas target dimensions
      if (crop && crop.enabled && crop.pixelWidth && crop.pixelHeight) {
        canvas.width = crop.pixelWidth;
        canvas.height = crop.pixelHeight;
      } else {
        canvas.width = sWidth;
        canvas.height = sHeight;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw sub-rectangle
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert to webp'));
        },
        'image/webp',
        quality / 100
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    
    img.src = objectUrl;
  });
};

