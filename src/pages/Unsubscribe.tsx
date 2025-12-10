import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
  const [message, setMessage] = useState("");

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus("error");
      setMessage("No email address provided.");
      return;
    }

    setStatus("loading");

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ is_active: false })
        .eq("email", email);

      if (error) throw error;

      setStatus("success");
      setMessage("You have been successfully unsubscribed from our newsletter.");
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      setStatus("error");
      setMessage("Failed to unsubscribe. Please try again or contact support.");
    }
  };

  return (
    <>
      <SEOHead
        title="Unsubscribe | Visas.Guide"
        description="Unsubscribe from Visas.Guide newsletter"
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Unsubscribe
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your email preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "idle" && (
              <>
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You're about to unsubscribe:
                  </p>
                  <p className="font-medium text-foreground bg-muted px-4 py-2 rounded-lg">
                    {email || "No email provided"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You will no longer receive our weekly visa updates and travel tips.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleUnsubscribe}
                    variant="destructive"
                    className="w-full"
                    disabled={!email}
                  >
                    Unsubscribe
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back to Homepage
                    </Link>
                  </Button>
                </div>
              </>
            )}

            {status === "loading" && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Processing your request...</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Successfully Unsubscribed
                  </h3>
                  <p className="text-sm text-muted-foreground">{message}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  We're sorry to see you go. You can always resubscribe from our homepage.
                </p>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Homepage
                  </Link>
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Something Went Wrong
                  </h3>
                  <p className="text-sm text-muted-foreground">{message}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={handleUnsubscribe} className="w-full">
                    Try Again
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/contact">Contact Support</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Unsubscribe;
