declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}

declare module '*.bmp' {
  const content: string;
  export default content;
}

// Declare types for our custom image utilities
declare module '@/lib/utils/image' {
  export function validateFile(file: File): string | null;
  export function optimizeImage(
    file: File,
    maxWidth?: number,
    quality?: number
  ): Promise<Blob>;
  export function blobToFile(blob: Blob, fileName: string, fileType: string): File;
}
