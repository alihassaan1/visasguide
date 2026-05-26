import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

const EtiasScamWarning = () => (
  <Alert className="border-destructive/40 bg-destructive/5">
    <ShieldAlert className="h-5 w-5 text-destructive" />
    <AlertTitle className="text-destructive font-semibold">Avoid ETIAS scam websites</AlertTitle>
    <AlertDescription className="text-sm text-foreground/90 mt-1">
      The only official ETIAS portal is{" "}
      <a
        href="https://travel-europe.europa.eu/etias_en"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium hover:text-destructive"
      >
        travel-europe.europa.eu/etias
      </a>
      . The fee is <strong>€20</strong> — anyone charging more, asking for unrelated documents,
      or claiming "express processing" is a third-party reseller, not the EU. Apply directly to avoid overpaying.
    </AlertDescription>
  </Alert>
);

export default EtiasScamWarning;
