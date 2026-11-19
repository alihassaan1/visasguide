import { useEffect, useMemo, useRef, useState } from 'react';
import { AFFILIATE_SANDBOX, affiliateFrameHeight, buildAffiliateDocument, validateAffiliateEmbed } from '@/lib/affiliate-embed';

interface Props {
  code: string;
  title: string;
  className?: string;
  onClick?: () => void;
}

export function AffiliateScriptBanner({ code, title, className = '', onClick }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const click = useRef(onClick);
  click.current = onClick;
  const [height, setHeight] = useState(90);
  const invalid = validateAffiliateEmbed(code);
  const document = useMemo(() => invalid ? '' : buildAffiliateDocument(code), [code, invalid]);
  useEffect(() => {
    setHeight(90);
    const receive = (event: MessageEvent) => {
      if (!frame.current || event.source !== frame.current.contentWindow || !event.data) return;
      if (event.data.type === 'affiliate-banner-size') {
        const next = affiliateFrameHeight(event.data.height);
        if (next !== null) setHeight(next);
      }
      if (event.data.type === 'affiliate-banner-click') click.current?.();
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [document]);
  if (invalid) return null;
  return <iframe ref={frame} title={title} srcDoc={document} sandbox={AFFILIATE_SANDBOX}
    referrerPolicy="strict-origin-when-cross-origin" height={height} scrolling="no"
    className={`block w-full border-0 ${className}`} />;
}