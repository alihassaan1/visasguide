import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  content?: string;
}

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  is_active: boolean;
}

serve(async (req) => {
  console.log('RSS Fetcher function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get active RSS feeds from database
    const { data: rssFeeds, error: feedsError } = await supabase
      .from('rss_feeds')
      .select('*')
      .eq('is_active', true);

    if (feedsError) {
      console.error('Error fetching RSS feeds:', feedsError);
      throw feedsError;
    }

    console.log(`Found ${rssFeeds?.length || 0} active RSS feeds`);

    let totalProcessed = 0;
    let totalAdded = 0;

    for (const feed of rssFeeds || []) {
      try {
        console.log(`Processing feed: ${feed.name} - ${feed.url}`);
        
        // Fetch RSS content
        const rssResponse = await fetch(feed.url);
        const rssText = await rssResponse.text();
        
        // Simple RSS parsing (basic implementation)
        const items = parseRSSFeed(rssText, feed);
        console.log(`Found ${items.length} items in ${feed.name}`);
        
        totalProcessed += items.length;

        for (const item of items) {
          // Check if article already exists
          const { data: existingArticle } = await supabase
            .from('news_articles')
            .select('id')
            .eq('original_url', item.link)
            .single();

          if (existingArticle) {
            console.log(`Article already exists: ${item.title}`);
            continue;
          }

          // Generate slug from title
          const slug = generateSlug(item.title);

          // Check if slug already exists
          const { data: existingSlug } = await supabase
            .from('news_articles')
            .select('id')
            .eq('slug', slug)
            .single();

          if (existingSlug) {
            console.log(`Slug already exists: ${slug}`);
            continue;
          }

          let enhancedContent = item.content || item.description;
          let seoTitle = item.title;
          let seoDescription = item.description;

          // Enhance content with OpenAI if API key is available
          if (openAIApiKey && item.content) {
            try {
              const enhanced = await enhanceContentWithAI(item.title, item.content);
              if (enhanced) {
                enhancedContent = enhanced.content;
                seoTitle = enhanced.seoTitle;
                seoDescription = enhanced.seoDescription;
              }
            } catch (aiError) {
              console.error('AI enhancement failed:', aiError);
              // Continue with original content if AI fails
            }
          }

          // Insert new article with PUBLISHED status
          const { data: insertedArticle, error: insertError } = await supabase
            .from('news_articles')
            .insert({
              title: item.title,
              slug: slug,
              excerpt: item.description,
              content: enhancedContent,
              original_url: item.link,
              source_name: feed.name,
              source_url: feed.url,
              source_type: 'rss',
              status: 'published', // FIXED: Set as published so it appears on blog
              categories: feed.category ? [feed.category] : ['Immigration News'],
              tags: extractTags(item.title + ' ' + item.description),
              published_at: new Date().toISOString(),
              seo_title: seoTitle,
              seo_description: seoDescription,
              rss_feed_id: feed.id
            })
            .select('slug')
            .single();

          if (insertError) {
            console.error('Error inserting article:', insertError);
            continue;
          }

          // Submit to IndexNow for immediate indexing
          if (insertedArticle?.slug) {
            try {
              await fetch(`${supabaseUrl}/functions/v1/auto-indexnow`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({ urls: [`/news/${insertedArticle.slug}`] })
              });
              console.log(`Submitted to IndexNow: /news/${insertedArticle.slug}`);
            } catch (indexError) {
              console.error('IndexNow submission failed:', indexError);
            }
          }

          totalAdded++;
          console.log(`Added article: ${item.title}`);
        }

        // Update last_fetched timestamp
        await supabase
          .from('rss_feeds')
          .update({ last_fetched: new Date().toISOString() })
          .eq('id', feed.id);

      } catch (feedError) {
        console.error(`Error processing feed ${feed.name}:`, feedError);
        continue;
      }
    }

    console.log(`RSS fetch completed. Processed: ${totalProcessed}, Added: ${totalAdded}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: totalProcessed,
        added: totalAdded,
        message: `Successfully processed ${totalProcessed} items and added ${totalAdded} new articles` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('RSS Fetcher error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to fetch RSS content' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function parseRSSFeed(rssXml: string, feed: RSSFeed): RSSItem[] {
  const items: RSSItem[] = [];
  
  try {
    // Simple regex-based parsing (basic implementation)
    const itemRegex = /<item[^>]*>(.*?)<\/item>/gs;
    const titleRegex = /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/s;
    const linkRegex = /<link[^>]*>(.*?)<\/link>/s;
    const descRegex = /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/s;
    const contentRegex = /<content:encoded[^>]*><!\[CDATA\[(.*?)\]\]><\/content:encoded>/s;
    const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/s;

    let match;
    while ((match = itemRegex.exec(rssXml)) !== null && items.length < 10) {
      const itemXml = match[1];
      
      const titleMatch = titleRegex.exec(itemXml);
      const linkMatch = linkRegex.exec(itemXml);
      const descMatch = descRegex.exec(itemXml);
      const contentMatch = contentRegex.exec(itemXml);
      const pubDateMatch = pubDateRegex.exec(itemXml);

      if (titleMatch && linkMatch && descMatch) {
        items.push({
          title: cleanHtml(titleMatch[1] || titleMatch[2] || ''),
          link: (linkMatch[1] || '').trim(),
          description: cleanHtml(descMatch[1] || descMatch[2] || ''),
          content: contentMatch ? cleanHtml(contentMatch[1]) : undefined,
          pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
  }

  return items;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function extractTags(text: string): string[] {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
  
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1));
}

async function enhanceContentWithAI(title: string, content: string): Promise<{content: string, seoTitle: string, seoDescription: string} | null> {
  if (!openAIApiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content writer specializing in visa and immigration topics. Enhance the given content to be more informative, well-structured, and SEO-friendly. Return a JSON response with "content" (enhanced HTML content), "seoTitle" (optimized title under 60 chars), and "seoDescription" (meta description under 160 chars).'
          },
          {
            role: 'user',
            content: `Title: ${title}\n\nContent: ${content}\n\nPlease enhance this content for a visa/immigration website, making it more informative and better structured with proper HTML formatting.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No content received from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    
    // Try to parse as JSON, fallback to plain text if parsing fails
    try {
      return JSON.parse(aiResponse);
    } catch {
      // If not JSON, return the enhanced content as HTML
      return {
        content: aiResponse,
        seoTitle: title.substring(0, 60),
        seoDescription: content.substring(0, 160)
      };
    }
  } catch (error) {
    console.error('OpenAI enhancement error:', error);
    return null;
  }
}