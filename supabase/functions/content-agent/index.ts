import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentIssue {
  id: string;
  type: 'content_page' | 'news_article';
  title: string;
  missingFields: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Content Agent: Starting scan...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get DeepSeek API key from site_settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'deepseek_api_key')
      .single();

    let apiKey = null;
    if (settings?.setting_value && typeof settings.setting_value === 'object') {
      apiKey = (settings.setting_value as any).key;
    }
    
    if (!apiKey) {
      apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    }
    
    if (!apiKey) {
      console.error('DeepSeek API key not found');
      throw new Error('DeepSeek API key not configured');
    }

    const issues: ContentIssue[] = [];
    const logs: any[] = [];

    // Scan content_pages for missing content
    const { data: contentPages } = await supabase
      .from('content_pages')
      .select('*')
      .eq('is_published', true)
      .limit(10); // Process 10 pages per run to avoid timeouts

    if (contentPages) {
      for (const page of contentPages) {
        const missingFields: string[] = [];
        
        if (!page.excerpt || page.excerpt.trim().length < 50) missingFields.push('excerpt');
        if (!page.meta_description || page.meta_description.trim().length < 50) missingFields.push('meta_description');
        if (!page.meta_title || page.meta_title.trim().length < 10) missingFields.push('meta_title');
        if (!page.content || page.content.trim().length < 100) missingFields.push('content');

        if (missingFields.length > 0) {
          issues.push({
            id: page.id,
            type: 'content_page',
            title: page.title,
            missingFields
          });
        }
      }
    }

    // Scan news_articles for missing content
    const { data: newsArticles } = await supabase
      .from('news_articles')
      .select('*')
      .eq('status', 'published')
      .limit(10);

    if (newsArticles) {
      for (const article of newsArticles) {
        const missingFields: string[] = [];
        
        if (!article.excerpt || article.excerpt.trim().length < 50) missingFields.push('excerpt');
        if (!article.seo_description || article.seo_description.trim().length < 50) missingFields.push('seo_description');
        if (!article.seo_title || article.seo_title.trim().length < 10) missingFields.push('seo_title');
        if (!article.content || article.content.trim().length < 100) missingFields.push('content');

        if (missingFields.length > 0) {
          issues.push({
            id: article.id,
            type: 'news_article',
            title: article.title,
            missingFields
          });
        }
      }
    }

    console.log(`Content Agent: Found ${issues.length} pages with missing content`);

    // Process each issue
    for (const issue of issues) {
      try {
        console.log(`Processing ${issue.type}: ${issue.title}`);
        
        // Get current content
        const table = issue.type === 'content_page' ? 'content_pages' : 'news_articles';
        const { data: currentData } = await supabase
          .from(table)
          .select('*')
          .eq('id', issue.id)
          .single();

        if (!currentData) continue;

        const updates: any = {};

        // Generate missing content using DeepSeek
        for (const field of issue.missingFields) {
          let prompt = '';
          
          switch (field) {
            case 'excerpt':
              prompt = `Write a compelling 2-3 sentence excerpt for an article titled "${currentData.title}". ${currentData.content ? `Based on this content: ${currentData.content.substring(0, 500)}` : 'Make it engaging and informative about visa requirements and travel information.'}`;
              break;
            case 'meta_description':
            case 'seo_description':
              prompt = `Write an SEO-optimized meta description (150-160 characters) for an article titled "${currentData.title}". ${currentData.content ? `Based on this content: ${currentData.content.substring(0, 500)}` : 'Focus on visa requirements and travel information.'}`;
              break;
            case 'meta_title':
            case 'seo_title':
              prompt = `Write an SEO-optimized title (50-60 characters) for an article about "${currentData.title}". Make it compelling and include relevant keywords about visa requirements.`;
              break;
            case 'content':
              prompt = `Write a comprehensive 500-word article about "${currentData.title}" covering visa requirements, travel information, and helpful tips for travelers. Include practical advice and important details.`;
              break;
          }

          // Call DeepSeek API
          const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert content writer specializing in visa and travel information. Write clear, accurate, and SEO-friendly content.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 1000,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const generatedContent = data.choices[0].message.content;
            updates[field] = generatedContent;
            
            console.log(`Generated ${field} for ${issue.title}`);
          }
        }

        // Update the record
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from(table)
            .update(updates)
            .eq('id', issue.id);

          if (!updateError) {
            // Log the update
            await supabase.from('activity_log').insert({
              action: 'content_agent_update',
              entity_type: issue.type,
              entity_id: issue.id,
              metadata: {
                title: issue.title,
                fields_updated: Object.keys(updates),
                updated_at: new Date().toISOString()
              }
            });

            logs.push({
              entity: issue.title,
              type: issue.type,
              fields: Object.keys(updates),
              status: 'success'
            });

            console.log(`Successfully updated ${issue.title}`);
          }
        }

      } catch (error) {
        console.error(`Error processing ${issue.title}:`, error);
        logs.push({
          entity: issue.title,
          type: issue.type,
          status: 'error',
          error: error.message
        });
      }
    }

    const summary = {
      total_scanned: (contentPages?.length || 0) + (newsArticles?.length || 0),
      issues_found: issues.length,
      updates_made: logs.filter(l => l.status === 'success').length,
      errors: logs.filter(l => l.status === 'error').length,
      logs
    };

    console.log('Content Agent: Scan complete', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Content Agent error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
