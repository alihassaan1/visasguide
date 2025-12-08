import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostInsights {
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
}

// Placeholder function to fetch insights from Meta
async function fetchMetaInsights(
  postId: string,
  platform: string,
  accessToken: string
): Promise<PostInsights | null> {
  // TODO: Implement real Meta Graph API calls
  // For Facebook:
  // GET /{post-id}/insights?metric=post_impressions,post_reach,post_clicks
  // For Instagram:
  // GET /{media-id}/insights?metric=impressions,reach,engagement

  console.log(`[PLACEHOLDER] Fetching insights for ${platform} post ${postId}`);

  // Return null to indicate no real data available
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting social insights fetch...');

    // Get all published posts from the last 30 days that have a post_id
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: posts, error: postsError } = await supabase
      .from('social_posts')
      .select(`
        id,
        platform,
        post_id,
        platform_account_id,
        reach,
        impressions,
        engagement_count,
        link_clicks
      `)
      .eq('status', 'published')
      .not('post_id', 'is', null)
      .gte('published_at', thirtyDaysAgo.toISOString());

    if (postsError) {
      throw postsError;
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No posts to fetch insights for', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${posts.length} posts to fetch insights for`);

    // Get platform accounts for access tokens
    const { data: accounts } = await supabase
      .from('platform_accounts')
      .select('id, platform, access_token_encrypted')
      .eq('is_active', true);

    const accountMap = new Map(
      (accounts || []).map(a => [a.id, a])
    );

    let updated = 0;
    const results: any[] = [];

    for (const post of posts) {
      const account = accountMap.get(post.platform_account_id);
      
      if (!account?.access_token_encrypted) {
        // No access token - can't fetch real insights
        // Instead, aggregate clicks from marketing_clicks table
        const { count } = await supabase
          .from('marketing_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('social_post_id', post.id);

        const trackedClicks = count || 0;

        if (trackedClicks !== post.link_clicks) {
          await supabase
            .from('social_posts')
            .update({ link_clicks: trackedClicks })
            .eq('id', post.id);

          updated++;
          results.push({
            postId: post.id,
            platform: post.platform,
            clicks: trackedClicks,
            source: 'tracked_clicks',
          });
        }

        continue;
      }

      // Fetch real insights from Meta
      const insights = await fetchMetaInsights(
        post.post_id!,
        post.platform,
        account.access_token_encrypted
      );

      if (insights) {
        await supabase
          .from('social_posts')
          .update({
            reach: insights.reach,
            impressions: insights.impressions,
            engagement_count: insights.engagement,
            link_clicks: insights.clicks,
          })
          .eq('id', post.id);

        updated++;
        results.push({
          postId: post.id,
          platform: post.platform,
          insights,
          source: 'meta_api',
        });
      }
    }

    // Log the sync
    await supabase.from('api_logs').insert({
      api_provider: 'social-insights',
      status: 'success',
      task_type: 'insights_sync',
      response_summary: { postsChecked: posts.length, updated, results },
    });

    return new Response(
      JSON.stringify({
        message: 'Insights fetch complete',
        postsChecked: posts.length,
        updated,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Insights fetcher error:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});