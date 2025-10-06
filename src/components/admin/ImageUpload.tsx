import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Featured Image'
}) => {
  const [previewUrl, setPreviewUrl] = useState(value);

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    onChange(url);
  };

  const clearImage = () => {
    setPreviewUrl('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Enter image URL"
          value={previewUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {previewUrl && (
        <div className="mt-2 border rounded-lg p-2">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-48 w-auto mx-auto object-contain"
            onError={() => setPreviewUrl('')}
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Enter a direct URL to an image (e.g., from Unsplash, Imgur, or your own hosting)
      </p>
    </div>
  );
};
