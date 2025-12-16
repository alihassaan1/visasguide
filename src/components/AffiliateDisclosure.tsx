import { Info } from 'lucide-react';

interface AffiliateDisclosureProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const AffiliateDisclosure = ({ variant = 'default', className = '' }: AffiliateDisclosureProps) => {
  if (variant === 'compact') {
    return (
      <p className={`text-xs text-muted-foreground italic ${className}`}>
        * We may earn a commission if you book through our links – at no extra cost to you.
      </p>
    );
  }

  return (
    <div className={`flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border/50 ${className}`}>
      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">Affiliate Disclosure:</span> Some links on this page are affiliate links. 
        If you make a booking through these links, we may earn a small commission at no extra cost to you. 
        This helps us keep providing free visa information.
      </p>
    </div>
  );
};

export default AffiliateDisclosure;
