import { useState, useCallback, useRef, useEffect } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Link, Loader2, ImageIcon } from 'lucide-react';
import { uploadImageToR2 } from '@/lib/r2-upload.functions';
import { useToast } from '@/hooks/use-toast';
import { normalizeImageUrl } from '@/lib/affiliate-embed';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
  storagePath?: string;
  maxWidth?: number;
  maxHeight?: number;
}

const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Only downscale, never upscale
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fall back to JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) return resolve(blob);
          // Fallback to JPEG
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) resolve(jpegBlob);
              else reject(new Error('Failed to compress image'));
            },
            'image/jpeg',
            0.85
          );
        },
        'image/webp',
        0.85
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('This file could not be opened as an image.')); };
    img.src = objectUrl;
  });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Featured Image',
  bucket = 'content-images',
  storagePath = 'banners',
  maxWidth = 1200,
  maxHeight = 800,
}) => {
  const { toast } = useToast();
  const uploadToR2 = useServerFn(uploadImageToR2);
  const [urlDraft, setUrlDraft] = useState(value);
  const [failedUrl, setFailedUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setUrlDraft(value); setFailedUrl(''); }, [value]);

  const handleUrlChange = (url: string) => {
    try {
      const normalized = normalizeImageUrl(url);
      setFailedUrl('');
      onChange(normalized);
    } catch (error) {
      toast({ title: 'Invalid image URL', description: error instanceof Error ? error.message : 'Enter a valid image URL.', variant: 'destructive' });
    }
  };

  const clearImage = () => {
    setUrlDraft('');
    setFailedUrl('');
    onChange('');
  };

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 10MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // Step 1: Optimize
      setUploadStatus('Optimizing...');
      const optimizedBlob = file.type === 'image/gif' ? file : await resizeImage(file, maxWidth, maxHeight);
      const isWebP = optimizedBlob.type === 'image/webp';
      const ext = isWebP ? 'webp' : optimizedBlob.type === 'image/gif' ? 'gif' : 'jpg';

      // Step 2: Upload to Cloudflare R2 (served from cdn.visas.guide)
      setUploadStatus('Uploading...');
      const buffer = await optimizedBlob.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      const dataBase64 = btoa(binary);

      const { url: publicUrl } = await uploadToR2({
        data: {
          fileName: `${storagePath}-${Date.now()}.${ext}`,
          contentType: optimizedBlob.type,
          dataBase64,
          folder: storagePath,
        },
      });

      setFailedUrl('');
      onChange(publicUrl);

      const savedKB = ((file.size - optimizedBlob.size) / 1024).toFixed(0);
      toast({ title: `Image uploaded (saved ~${savedKB}KB)` });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  }, [bucket, storagePath, maxWidth, maxHeight, onChange, toast, uploadToR2]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {value && failedUrl !== value && (
        <div className="relative border rounded-lg p-2 bg-muted/30">
          <img
            src={value}
            alt="Preview"
            className="max-h-48 w-auto mx-auto object-contain rounded-sm"
            onError={() => setFailedUrl(value)}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-7 w-7"
            onClick={clearImage}
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      {failedUrl === value && value && <p role="alert" className="text-xs text-destructive">Image preview unavailable. Check the image URL or use Script / HTML for affiliate code.</p>}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-8">
            <TabsTrigger value="upload" className="text-xs gap-1">
              <Upload className="h-3 w-3" /> Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs gap-1">
              <Link className="h-3 w-3" /> URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-2">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">{uploadStatus}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Drop image here or <span className="text-primary font-medium">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground/60">PNG, JPG, WebP up to 10MB · auto-optimized</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-2">
            <div className="flex min-w-0 gap-2">
            <Input
              type="url"
              aria-label="Image URL"
              placeholder="https://example.com/image.png"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlChange(urlDraft); } }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => handleUrlChange(urlDraft)}>Apply URL</Button>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
};
