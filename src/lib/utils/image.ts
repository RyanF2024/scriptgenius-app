/**
 * Validates a file for image upload
 * @param file The file to validate
 * @returns Error message if validation fails, null if valid
 */
export function validateFile(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return 'Please select a valid image file (JPEG, PNG, or WebP)';
  }

  if (file.size > maxSize) {
    return 'Image size must be less than 5MB';
  }

  return null;
}

/**
 * Optimizes an image file for web
 * @param file The image file to optimize
 * @param maxWidth Maximum width in pixels
 * @param quality Image quality (0-1)
 * @returns Promise that resolves to a Blob of the optimized image
 */
export async function optimizeImage(
  file: File,
  maxWidth = 800,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to webp with specified quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to optimize image'));
            return;
          }
          resolve(blob);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Converts a Blob to a File
 * @param blob The Blob to convert
 * @param fileName The name of the resulting File
 * @param fileType The MIME type of the File
 * @returns A new File object
 */
export function blobToFile(blob: Blob, fileName: string, fileType: string): File {
  return new File([blob], fileName, { type: fileType });
}
