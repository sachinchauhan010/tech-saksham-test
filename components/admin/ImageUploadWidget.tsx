'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import apiClient from '@/lib/api-client';

interface ImageUploadWidgetProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export default function ImageUploadWidget({
  value,
  onChange,
  onRemove,
  disabled,
}: ImageUploadWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await apiClient.post('/api/upload', formData);

      if (data.success && data.url) {
        onChange(data.url);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image to Cloudinary');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {value ? (
        <div className="relative rounded-xl overflow-hidden h-[200px] w-full border border-blue-200 shadow-sm">
          <div className="absolute top-2 right-2 z-10">
            <Button
              type="button"
              onClick={onRemove}
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full shadow-md"
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Image
            fill
            className="object-cover"
            alt="Uploaded Image"
            src={value}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : null}

      {!value && (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
            title="Click to upload an image"
          />
          <Button
            type="button"
            disabled={disabled || isUploading}
            variant="outline"
            className="w-full h-32 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600 transition-all rounded-xl relative pointer-events-none"
          >
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="font-medium">Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-8 w-8" />
                  <span className="font-medium">Click to upload an image</span>
                </>
              )}
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
