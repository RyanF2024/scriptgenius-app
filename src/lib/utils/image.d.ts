export function validateFile(file: File): string | null;

export function optimizeImage(
  file: File,
  maxWidth?: number,
  quality?: number
): Promise<Blob>;

export function blobToFile(blob: Blob, fileName: string, fileType: string): File;
