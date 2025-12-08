import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentEvent {
  id: string;
  event_type: string;
  content_type: string;
  content_page_id: string | null;
  news_article_id: string | null;
  title: string;
  slug: string;
  featured_image_url: string | null;
}

interface PlatformAccount {
  id: string;
  platform: string;
  account_name: string;
  account_id: string | null;
  access_token_encrypted: string | null;
  is_active: boolean;
}

interface PostingRules {
  cooldown_hours: number;
  max_posts_per_day: number;
  auto_publish: boolean;
  retry_max: number;
  retry_delay_minutes: number;
}

const DEFAULT_POSTING_RULES: PostingRules = {
  cooldown_hours: 24,
  max_posts_per_day: 10,
  auto_publish: true,
  retry_max: 1,
  retry_delay_minutes: 30,
};

// Generate AI captions using DeepSeek
async function generateCaptions(
  title: string,
  contentType: string,
  slug: string,
  supabase: any
): Promise<{ instagram: string; facebook: string; hashtags: string[] }> {
  try {
    // Get DeepSeek API key
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'deepseek_api_key')
      .single();

    const apiKey = settings?.setting_value;
    if (!apiKey) {
      console.log('DeepSeek API key not found, using default captions');
      return getDefaultCaptions(title, contentType, slug);
    }

    const prompt = `Generate social media captions for a visa/travel article.
Title: "${title}"
Content Type: ${contentType}
URL slug: ${slug}

Generate:
1. Instagram caption (max 200 chars, engaging, use emojis, NO links, end with "Link in bio!")
2. Facebook post (max 300 chars, informative, can mention the website visas.guide)
3. 8-10 relevant hashtags (travel, visa, country-specific)

Respond in JSON format:
{
  "instagram": "caption here",
  "facebook": "caption here",
  "hashtags": ["hashtag1", "hashtag2", ...]
}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        instagram: parsed.instagram || getDefaultCaptions(title, contentType, slug).instagram,
        facebook: parsed.facebook || getDefaultCaptions(title, contentType, slug).facebook,
        hashtags: parsed.hashtags || getDefaultCaptions(title, contentType, slug).hashtags,
      };
    }

    return getDefaultCaptions(title, contentType, slug);
  } catch (error) {
    console.error('Error generating captions:', error);
    return getDefaultCaptions(title, contentType, slug);
  }
}

function getDefaultCaptions(title: string, contentType: string, slug: string) {
  const emoji = contentType === 'visa_requirements' ? '✈️' : 
                contentType === 'country_guide' ? '🌍' : 
                contentType === 'news' ? '📰' : '📝';
  
  return {
    instagram: `${emoji} ${title.substring(0, 150)}... \n\n🔗 Link in bio!`,
    facebook: `${emoji} ${title}\n\nRead more at visas.guide/${slug}`,
    hashtags: ['travel', 'visa', 'passport', 'wanderlust', 'travelguide', 'visaguide', 'traveltips', 'explore'],
  };
}

// Build tracked URL with UTM parameters
function buildTrackedUrl(slug: string, platform: string, contentType: string): string {
  const baseUrl = `https://visas.guide/${slug}`;
  const params = new URLSearchParams({
    utm_source: platform,
    utm_medium: 'social',
    utm_campaign: `${contentType}_${slug.replace(/\//g, '-')}`,
  });
  return `${baseUrl}?${params.toString()}`;
}

// Check if content is within cooldown period
async function isInCooldown(
  supabase: any,
  contentPageId: string | null,
  newsArticleId: string | null,
  platform: string,
  cooldownHours: number
): Promise<boolean> {
  const cooldownUntil = new Date();
  cooldownUntil.setHours(cooldownUntil.getHours() - cooldownHours);

  let query = supabase
    .from('social_posts')
    .select('id')
    .eq('platform', platform)
    .gte('created_at', cooldownUntil.toISOString())
    .in('status', ['published', 'pending', 'queued']);

  if (contentPageId) {
    query = query.eq('content_page_id', contentPageId);
  }
  if (newsArticleId) {
    query = query.eq('news_article_id', newsArticleId);
  }

  const { data } = await query.limit(1);
  return data && data.length > 0;
}

// Publish to Meta Graph API (placeholder)
async function publishToMeta(
  post: any,
  account: PlatformAccount
): Promise<{ success: boolean; postId?: string; error?: string; placeholder?: boolean }> {
  // Check if Meta is configured
  if (!account.access_token_encrypted || !account.account_id) {
    console.log(`[PLACEHOLDER] Would publish to ${account.platform}:`, {
      caption: post.caption.substring(0, 100) + '...',
      image: post.image_url,
      hashtags: post.hashtags?.slice(0, 5),
    });
    
    return {
      success: true,
      placeholder: true,
      postId: `placeholder_${Date.now()}`,
    };
  }

  // TODO: Implement real Meta Graph API publishing
  // For Facebook Page:
  // POST /{page-id}/feed with message, link
  // For Instagram Business:
  // POST /{ig-user-id}/media with image_url, caption
  // POST /{ig-user-id}/media_publish with creation_id

  try {
    const accessToken = account.access_token_encrypted; // In production, decrypt this
    
    if (account.platform === 'facebook') {
      // Placeholder for Facebook API call
      console.log(`[META API] Publishing to Facebook Page ${account.account_id}`);
      // const response = await fetch(
      //   `https://graph.facebook.com/v18.0/${account.account_id}/feed`,
      //   {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       message: post.caption,
      //       link: post.tracked_url,
      //       access_token: accessToken,
      //     }),
      //   }
      // );
    } else if (account.platform === 'instagram') {
      // Placeholder for Instagram API call
      console.log(`[META API] Publishing to Instagram ${account.account_id}`);
      // Step 1: Create media container
      // Step 2: Publish media
    }

    return {
      success: true,
      placeholder: true,
      postId: `placeholder_${Date.now()}`,
    };
  } catch (error: any) {
    console.error('Meta API error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const batchSize = body.batchSize || 10;
    const forceProcess = body.forceProcess || false;

    console.log(`Starting social content publisher. Batch size: ${batchSize}`);

    // Get posting rules from settings
    const { data: rulesData } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'social_posting_rules')
      .single();

    const postingRules: PostingRules = rulesData?.setting_value || DEFAULT_POSTING_RULES;

    if (!postingRules.auto_publish && !forceProcess) {
      return new Response(
        JSON.stringify({ message: 'Auto-publish is disabled', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch unprocessed content events
    const { data: events, error: eventsError } = await supabase
      .from('content_events')
      .select('*')
      .eq('processed', false)
      .is('processing_started_at', null)
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (eventsError) {
      throw eventsError;
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No content events to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${events.length} content events to process`);

    // Get active platform accounts
    const { data: accounts } = await supabase
      .from('platform_accounts')
      .select('*')
      .eq('is_active', true);

    if (!accounts || accounts.length === 0) {
      // Create placeholder accounts if none exist
      console.log('No platform accounts found, creating placeholders...');
      
      await supabase.from('platform_accounts').insert([
        { platform: 'facebook', account_name: 'Visas.Guide Facebook (Not Connected)', is_active: true },
        { platform: 'instagram', account_name: 'Visas.Guide Instagram (Not Connected)', is_active: true },
      ]);

      const { data: newAccounts } = await supabase
        .from('platform_accounts')
        .select('*')
        .eq('is_active', true);
      
      if (!newAccounts || newAccounts.length === 0) {
        throw new Error('Failed to create platform accounts');
      }
    }

    const activeAccounts = accounts || [];
    const results: any[] = [];

    for (const event of events as ContentEvent[]) {
      // Mark event as processing
      await supabase
        .from('content_events')
        .update({ processing_started_at: new Date().toISOString() })
        .eq('id', event.id);

      try {
        // Generate captions
        const captions = await generateCaptions(
          event.title,
          event.content_type,
          event.slug,
          supabase
        );

        const socialPostIds: string[] = [];

        // Create posts for each platform
        for (const account of activeAccounts as PlatformAccount[]) {
          // Check cooldown
          const inCooldown = await isInCooldown(
            supabase,
            event.content_page_id,
            event.news_article_id,
            account.platform,
            postingRules.cooldown_hours
          );

          if (inCooldown && !forceProcess) {
            console.log(`Skipping ${account.platform} for "${event.title}" - in cooldown`);
            continue;
          }

          const caption = account.platform === 'instagram' 
            ? captions.instagram 
            : captions.facebook;

          const trackedUrl = buildTrackedUrl(event.slug, account.platform, event.content_type);

          // Create social post record
          const { data: socialPost, error: postError } = await supabase
            .from('social_posts')
            .insert({
              platform: account.platform,
              platform_account_id: account.id,
              content_type: event.content_type,
              content_page_id: event.content_page_id,
              news_article_id: event.news_article_id,
              caption: `${caption}\n\n${captions.hashtags.map(h => `#${h}`).join(' ')}`,
              hashtags: captions.hashtags,
              image_url: event.featured_image_url,
              tracked_url: trackedUrl,
              status: 'queued',
            })
            .select()
            .single();

          if (postError) {
            console.error('Error creating social post:', postError);
            continue;
          }

          // Attempt to publish
          const publishResult = await publishToMeta(socialPost, account);

          if (publishResult.success) {
            await supabase
              .from('social_posts')
              .update({
                status: publishResult.placeholder ? 'published' : 'published',
                post_id: publishResult.postId,
                published_at: new Date().toISOString(),
                error_message: publishResult.placeholder ? 'Meta not connected - simulated publish' : null,
              })
              .eq('id', socialPost.id);

            socialPostIds.push(socialPost.id);
          } else {
            await supabase
              .from('social_posts')
              .update({
                status: 'failed',
                error_message: publishResult.error,
                retry_count: socialPost.retry_count + 1,
              })
              .eq('id', socialPost.id);
          }
        }

        // Mark event as processed
        await supabase
          .from('content_events')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            social_post_ids: socialPostIds,
          })
          .eq('id', event.id);

        results.push({
          eventId: event.id,
          title: event.title,
          postsCreated: socialPostIds.length,
        });
      } catch (error: any) {
        console.error(`Error processing event ${event.id}:`, error);

        await supabase
          .from('content_events')
          .update({
            error_message: error.message,
            processing_started_at: null,
          })
          .eq('id', event.id);
      }
    }

    // Log API usage
    await supabase.from('api_logs').insert({
      api_provider: 'social-publisher',
      status: 'success',
      task_type: 'social_media_publish',
      response_summary: { eventsProcessed: results.length, results },
    });

    return new Response(
      JSON.stringify({
        message: 'Social content publishing complete',
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Social content publisher error:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});