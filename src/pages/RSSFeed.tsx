import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rss, Copy, ExternalLink, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RSS_FEED_URL = "https://visas.guide/feed";

const RSSFeed = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(RSS_FEED_URL);
    setCopied(true);
    toast.success("RSS feed URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const feedReaders = [
    { name: "Feedly", url: `https://feedly.com/i/subscription/feed/${encodeURIComponent(RSS_FEED_URL)}`, icon: "🦋" },
    { name: "Inoreader", url: `https://www.inoreader.com/search/feeds/${encodeURIComponent(RSS_FEED_URL)}`, icon: "📖" },
    { name: "NewsBlur", url: `https://newsblur.com/?url=${encodeURIComponent(RSS_FEED_URL)}`, icon: "📰" },
    { name: "The Old Reader", url: `https://theoldreader.com/feeds/subscribe?url=${encodeURIComponent(RSS_FEED_URL)}`, icon: "📚" },
  ];

  return (
    <>
      <SEOHead 
        title="RSS Feed - Subscribe to Visas.Guide Updates | Visa News & Guides"
        description="Subscribe to Visas.Guide RSS feed for the latest visa news, travel guides, and immigration updates. Get real-time notifications in your favorite RSS reader."
        canonical="https://visas.guide/rss"
        keywords={["rss feed", "visa news feed", "travel updates", "visa guide rss", "immigration news"]}
      />
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Rss className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Subscribe to Our RSS Feed</h1>
              <p className="text-xl text-muted-foreground">
                Stay updated with the latest visa news, travel guides, and immigration updates delivered directly to your favorite RSS reader.
              </p>
            </div>

            {/* Feed URL Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rss className="h-5 w-5 text-primary" />
                  RSS Feed URL
                </CardTitle>
                <CardDescription>
                  Copy this URL and paste it into your RSS reader
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-4 py-3 rounded-lg text-sm break-all">
                    {RSS_FEED_URL}
                  </code>
                  <Button onClick={copyToClipboard} variant="outline" size="icon">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild>
                    <a href={RSS_FEED_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Raw Feed
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Subscribe */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Subscribe</CardTitle>
                <CardDescription>
                  Click on your preferred RSS reader to subscribe instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {feedReaders.map((reader) => (
                    <a
                      key={reader.name}
                      href={reader.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <span className="text-3xl">{reader.icon}</span>
                      <span className="font-medium text-sm">{reader.name}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* What You'll Get */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included in Our Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span><strong>Latest Visa Guides</strong> - Comprehensive guides for visa applications worldwide</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span><strong>Breaking News</strong> - Immigration policy changes and travel updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span><strong>Country Updates</strong> - New visa requirements and entry rules</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span><strong>Travel Tips</strong> - Expert advice for smooth visa applications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feedspot Badge */}
            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">Featured on</p>
              <div className="inline-block bg-primary/5 border border-primary/20 px-8 py-4 rounded-lg">
                <p className="font-semibold text-lg">🏆 Feedspot Top Visa Blog</p>
                <p className="text-muted-foreground text-sm mt-1">Among the best visa resources worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RSSFeed;
