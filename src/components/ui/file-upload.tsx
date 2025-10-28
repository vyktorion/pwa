'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, User } from 'lucide-react';
import Image from 'next/image';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/lib/uploadthing';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({ value, onChange, disabled, className }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing('avatarUploader', {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        const url = res[0].url;
        setPreview(url);
        setLocalPreview(null); // Remove local preview after upload
        onChange(url);
      }
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      setLocalPreview(null); // Remove local preview on error
      alert('Upload failed: ' + error.message);
    },
  });

  const createInstantPreview = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const handleFileSelect = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      alert('File size must be less than 2MB');
      return;
    }

    // Create instant preview
    const instantPreviewUrl = createInstantPreview(file);
    setLocalPreview(instantPreviewUrl);

    // Start upload asynchronously without resizing
    await startUpload([file]);
  };

  const handleRemove = () => {
    setPreview(null);
    setLocalPreview(null);
    onChange('');
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileSelect;
    input.click();
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      {/* Avatar Preview */}
      <div className="relative">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-border hover:border-primary/50 transition-colors">
          {(localPreview || preview) ? (
            <Image
              src={localPreview || preview || ""}
              alt="Avatar preview"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNmM2Y0ZjYiLz4KPHBhdGggZD0iTTQwIDQwSDU2VjU2SDQwVjQwWk0zMiAzMkg0OFY0OEgzMloiIGZpbGw9IiM5Y2E0YjAiLz4KPC9zdmc+"
            />
          ) : (
            <User className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Remove button */}
        {(preview || localPreview) && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="cursor-pointer absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive/90 transition-colors"
            disabled={isUploading}
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Upload overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {isUploading ? 'Se încarcă...' : 'Schimbă avatar'}
      </Button>

      {/* No need for hidden input anymore */}
    </div>
  );
}