import React from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'quality' | 'loading'> {
  quality?: number;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  blurDataURL?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 75,
  priority = false,
  loading = 'lazy',
  blurDataURL,
  className = '',
  ...props
}) => {
  // Handle different image formats and optimize accordingly
  const isSvg = typeof src === 'string' && src.endsWith('.svg');
  
  // Don't process SVGs with the image optimizer
  if (isSvg) {
    return (
      <img
        src={src as string}
        alt={alt}
        width={width as number}
        height={height as number}
        className={className}
        loading={loading}
        {...props}
      />
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width as number}
        height={height as number}
        quality={quality}
        priority={priority}
        loading={loading}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        style={{
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'cover',
        }}
        {...props}
      />
    </div>
  );
};

export default React.memo(OptimizedImage);
