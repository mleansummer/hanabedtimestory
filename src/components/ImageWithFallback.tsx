import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  onError?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallback,
  onError,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
    if (onError) {
      onError();
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error) {
    return fallback || (
      <div className={`flex items-center justify-center bg-boho-stone/5 ${className}`}>
        <div className="text-center text-boho-stone/50">
          <ImageOff className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      {loading && (
        <div className={`absolute inset-0 ${className} bg-boho-stone/5 animate-pulse`} />
      )}
    </div>
  );
};

export default ImageWithFallback;