import { useEffect } from "react";

const RSS_FEED_URL = "https://awiytryceqehqapytfgn.supabase.co/functions/v1/rss-feed";

const Feed = () => {
  useEffect(() => {
    // Immediately redirect to the RSS feed
    window.location.replace(RSS_FEED_URL);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting to RSS feed...</p>
    </div>
  );
};

export default Feed;
