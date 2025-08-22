import { z } from 'zod';

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/xml', // For FDX
  'text/plain',
  'text/x-fountain',
  'application/x-fountain',
  'application/octet-stream', // Fallback for some FDX files
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const fileValidationSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  type: z.string().refine(
    (type) => SUPPORTED_FILE_TYPES.some(supported => type.includes(supported.replace('application/', '').replace('text/', ''))),
    'Unsupported file type. Please upload a PDF, FDX, or Fountain file.'
  ),
  size: z.number().max(MAX_FILE_SIZE, 'File size must be less than 10MB'),
});

export function validateFile(file: File): { valid: boolean; error?: string } {
  try {
    fileValidationSchema.parse({
      name: file.name,
      type: file.type || file.name.split('.').pop()?.toLowerCase(),
      size: file.size,
    });
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Invalid file' };
  }
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isFDXFile(filename: string, mimeType: string): boolean {
  const ext = getFileExtension(filename);
  return (
    ext === 'fdx' ||
    mimeType.includes('fdx') ||
    mimeType === 'application/xml' && filename.endsWith('.fdx')
  );
}

export function isFountainFile(filename: string, mimeType: string): boolean {
  const ext = getFileExtension(filename);
  return (
    ext === 'fountain' ||
    mimeType.includes('fountain') ||
    (mimeType === 'text/plain' && filename.endsWith('.fountain'))
  );
}
