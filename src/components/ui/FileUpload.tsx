'use client';

import { useState, useCallback, useRef, ChangeEvent } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image, File, FileText, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';

type FileType = 'image' | 'document' | 'archive' | 'other';

interface FileWithPreview extends File {
  preview?: string;
  type: FileType;
  id: string;
}

interface FileUploadProps {
  /**
   * Callback when files are selected and validated
   */
  onUpload: (files: File[]) => Promise<void> | void;
  /**
   * Maximum file size in bytes (default: 5MB)
   */
  maxSize?: number;
  /**
   * Allowed file types (MIME types)
   */
  accept?: string;
  /**
   * Maximum number of files allowed (default: 1)
   */
  maxFiles?: number;
  /**
   * Show file preview (default: true for images, false for other types)
   */
  showPreview?: boolean;
  /**
   * Custom upload button text
   */
  buttonText?: string;
  /**
   * Additional class names
   */
  className?: string;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ACCEPT = 'image/*,.pdf,.doc,.docx,.txt';

export function FileUpload({
  onUpload,
  maxSize = DEFAULT_MAX_SIZE,
  accept = DEFAULT_ACCEPT,
  maxFiles = 1,
  showPreview = accept.startsWith('image/') || accept.includes('image/*'),
  buttonText = 'Choose files',
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileType = (file: File): FileType => {
    if (file.type.startsWith('image/')) return 'image';
    if (['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      return 'document';
    }
    if (['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'].includes(file.type)) {
      return 'archive';
    }
    return 'other';
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File ${file.name} is too large. Max size: ${formatFileSize(maxSize)}`,
      };
    }

    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',');
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'));
        }
        return file.type === type || file.name.endsWith(type);
      });

      if (!isAccepted) {
        return {
          valid: false,
          error: `File type not allowed: ${file.name}. Allowed types: ${accept}`,
        };
      }
    }

    return { valid: true };
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    const fileList = Array.from(event.target.files);
    await processFiles(fileList);
  };

  const processFiles = async (fileList: File[]) => {
    setError(null);
    
    // Check max files
    if (files.length + fileList.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} file(s)`);
      return;
    }

    const newFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    for (const file of fileList) {
      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push(validation.error || 'Invalid file');
        continue;
      }

      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.type = getFileType(file);
      fileWithPreview.id = Math.random().toString(36).substring(2, 9);

      if (fileWithPreview.type === 'image' && showPreview) {
        try {
          fileWithPreview.preview = await readFile(file);
        } catch (err) {
          console.error('Error reading file:', err);
        }
      }

      newFiles.push(fileWithPreview);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      toast({
        title: 'Upload Error',
        description: `Failed to process ${errors.length} file(s). ${errors[0]}`,
        variant: 'destructive',
      });
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      await processFiles(fileList);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const totalSteps = 100;
      const step = 100 / totalSteps;
      
      for (let i = 0; i <= totalSteps; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        setUploadProgress(i * step);
      }

      await onUpload(files);
      
      toast({
        title: 'Upload Complete',
        description: `${files.length} file(s) uploaded successfully`,
      });
      
      setFiles([]);
      setUploadProgress(0);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to upload files');
      toast({
        title: 'Upload Failed',
        description: error.message || 'An error occurred during upload',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'archive':
        return <FileArchive className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Click to upload</span> or drag and drop
          </div>
          <p className="text-xs text-muted-foreground">
            {accept === DEFAULT_ACCEPT 
              ? 'Images, PDF, DOC, DOCX, TXT (max 5MB)' 
              : `Accepted: ${accept} (max ${formatFileSize(maxSize)})`}
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={accept}
            multiple={maxFiles > 1}
          />
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {buttonText}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium">Selected files ({files.length}/{maxFiles})</h4>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.name} 
                      className="w-10 h-10 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(file.id)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading {files.length} file(s)...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload button */}
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Clear
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
            >
              {isUploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
