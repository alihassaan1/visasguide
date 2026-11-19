import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Eye, ImageIcon } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { AffiliateScriptBanner } from '@/components/AffiliateScriptBanner';
import { validateAffiliateEmbed } from '@/lib/affiliate-embed';

interface Props {
  image: string;
  code: string;
  onChange: (updates: { image_url?: string; html_embed?: string }) => void;
  maxWidth: number;
  maxHeight: number;
}

export function AffiliateCreativeEditor({ image, code, onChange, maxWidth, maxHeight }: Props) {
  const codeId = useId();
  const [mode, setMode] = useState(code ? 'script' : 'image');
  const [preview, setPreview] = useState('');
  const error = code.trim() ? validateAffiliateEmbed(code) : null;
  return <div className="min-w-0 space-y-3">
    <Label>Banner Creative</Label>
    <Tabs value={mode} onValueChange={(next) => {
      setMode(next);
      setPreview('');
      if (next === 'image') onChange({ html_embed: '' });
      else onChange({ image_url: '' });
    }}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="image"><ImageIcon className="mr-1.5 h-4 w-4" />Image</TabsTrigger>
        <TabsTrigger value="script"><Code className="mr-1.5 h-4 w-4" />Script / HTML</TabsTrigger>
      </TabsList>
    </Tabs>
    {mode === 'image' ? <ImageUpload value={image} onChange={(image_url) => onChange({ image_url })}
      label="Banner Image" storagePath="banners" maxWidth={maxWidth} maxHeight={maxHeight} /> : <>
      <Label htmlFor={codeId}>Affiliate Banner Code</Label>
      <Textarea id={codeId} aria-label="Affiliate Banner Code" value={code} rows={7}
        className="max-w-full font-mono text-xs" placeholder="Paste the complete affiliate banner script or HTML"
        onChange={(event) => { setPreview(''); onChange({ html_embed: event.target.value, image_url: '' }); }} />
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <Button variant="outline" size="sm" disabled={!code.trim() || Boolean(error)} onClick={() => setPreview(code)}>
        <Eye className="h-4 w-4" />Preview Banner
      </Button>
      {preview && <AffiliateScriptBanner code={preview} title="Affiliate banner preview" />}
    </>}
  </div>;
}