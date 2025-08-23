interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

/**
 * Checks if WebP format is supported in the browser
 */
async function isWebPSupported(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  
  const webpData = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  return testImageFormat(webpData);
}

/**
 * Tests if a specific image format is supported
 */
async function testImageFormat(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

/**
 * Optimizes an image file with the specified options
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 85,
    format = 'webp',
  } = options;

  // Check if the browser supports the specified format
  const supportedFormats = await getSupportedImageFormats();
  const outputFormat = supportedFormats.includes(format) ? format : 'jpeg';

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context is not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = calculateAspectRatio(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image with high quality settings
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to the desired format
        const mimeType = `image/${outputFormat}`;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            resolve(blob);
          },
          mimeType,
          quality / 100
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Start loading the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculates new dimensions while maintaining aspect ratio
 */
function calculateAspectRatio(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.floor(width * ratio),
    height: Math.floor(height * ratio)
  };
}

/**
 * Gets the list of supported image formats in the current browser
 */
async function getSupportedImageFormats(): Promise<('webp' | 'avif' | 'jpeg' | 'png')[]> {
  const formats: ('webp' | 'avif' | 'jpeg' | 'png')[] = ['jpeg', 'png'];
  
  // Check for WebP support
  if (await isWebPSupported()) {
    formats.push('webp');
  }
  
  // Note: AVIF check is more complex and may not be needed for all use cases
  // For now, we'll assume it's not supported unless explicitly needed
  
  return formats;
}

/**
 * Creates a File object from a Blob with the specified filename
 */
export function blobToFile(blob: Blob, filename: string, type: string): File {
  return new File([blob], filename, { type });
}

/**
 * Validates a file against size and type constraints
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size should be less than ${maxSizeMB}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type' };
  }
  
  return { valid: true };
}
