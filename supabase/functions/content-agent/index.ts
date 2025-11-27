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

    // Scan countries for missing guide content
    const { data: countries } = await supabase
      .from('countries')
      .select('id, name, slug, code')
      .limit(5); // Process 5 countries per run

    if (countries) {
      for (const country of countries) {
        // Check if guide content exists for this country
        const { data: existingGuide } = await supabase
          .from('content_pages')
          .select('id')
          .eq('slug', `countries/${country.slug}`)
          .maybeSingle();

        if (!existingGuide) {
          // Generate country guide content
          const countryGuidePrompt = `Write a comprehensive travel and visa guide for ${country.name}. Structure it with these sections:

1. About ${country.name} (2-3 paragraphs about tourism, attractions, why people visit)

2. Available Visa Types (Tourist Visa, Business Visa, Student Visa, Work Visa, Transit Visa - with requirements for each)

3. Entry Requirements for All Visitors (passport validity, funds, accommodation proof, tickets, insurance)

4. Who Doesn't Need a Visa (list visa-exempt countries and travelers)

5. How to Apply (step-by-step application process)

6. Visa Processing Time (standard and peak season times)

7. Frequently Asked Questions (3-5 common questions with answers)

8. Travel Tips (5-6 practical tips for visitors)

Format the content in HTML with proper semantic tags (h2, h3, ul, li, p, div with appropriate Tailwind classes). 
IMPORTANT: Do NOT use any border classes (border, border-l, border-r, border-t, border-b). Keep styling minimal and clean.
Make it SEO-optimized and comprehensive.`;

          try {
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
                    content: 'You are an expert travel and visa content writer. Create comprehensive, SEO-optimized guides with proper HTML formatting and Tailwind CSS classes.'
                  },
                  {
                    role: 'user',
                    content: countryGuidePrompt
                  }
                ],
                temperature: 0.7,
                max_tokens: 3000,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const generatedContent = data.choices[0].message.content;

              // Create the country guide content page
              const { data: insertedPage, error: insertError } = await supabase
                .from('content_pages')
                .insert({
                  slug: `countries/${country.slug}`,
                  title: `${country.name} Travel & Visa Guide 2025`,
                  content: generatedContent,
                  excerpt: `Complete guide to ${country.name} visa requirements, types, and application process. Essential information for travelers visiting ${country.name}.`,
                  meta_title: `${country.name} Visa Guide 2025 – Requirements & Application | Visas.Guide`,
                  meta_description: `Complete ${country.name} visa requirements guide for 2025. Tourist, business, student, and work visa information, processing times, and application process.`,
                  keywords: [`${country.name.toLowerCase()} visa`, `${country.name.toLowerCase()} visa requirements`, `${country.name.toLowerCase()} travel guide`, `visit ${country.name.toLowerCase()}`],
                  is_published: true,
                  status: 'published',
                  ai_generated: true
                })
                .select()
                .single();

              if (!insertError && insertedPage) {
                await supabase.from('activity_log').insert({
                  action: 'content_agent_create',
                  entity_type: 'country_guide',
                  entity_id: insertedPage.id,
                  metadata: {
                    country_name: country.name,
                    country_code: country.code,
                    country_slug: country.slug,
                    content_slug: `countries/${country.slug}`,
                    title: `${country.name} Travel & Visa Guide 2025`,
                    content_preview: generatedContent.substring(0, 200) + '...',
                    ai_generated: true,
                    fields_generated: ['content', 'excerpt', 'meta_title', 'meta_description', 'keywords'],
                    created_at: new Date().toISOString()
                  }
                });

                logs.push({
                  entity: `${country.name} Guide`,
                  type: 'country_guide',
                  status: 'success',
                  message: 'Country guide created',
                  page_id: insertedPage.id
                });

                console.log(`✅ Created comprehensive country guide for ${country.name} (ID: ${insertedPage.id})`);
              } else {
                logs.push({
                  entity: `${country.name} Guide`,
                  type: 'country_guide',
                  status: 'error',
                  error: insertError?.message || 'Unknown error'
                });
              }
            }
          } catch (error) {
            console.error(`Error creating guide for ${country.name}:`, error);
            logs.push({
              entity: `${country.name} Guide`,
              type: 'country_guide',
              status: 'error',
              error: error.message
            });
          }
        }
      }
    }

    // Scan content_pages for missing content
    const { data: contentPages } = await supabase
      .from('content_pages')
      .select('*')
      .eq('is_published', true)
      .limit(10); // Process 10 pages per run to avoid timeouts

    if (contentPages) {
      for (const page of contentPages) {
        // Check if this page was already processed by the agent recently (within last 24 hours)
        const { data: recentUpdate } = await supabase
          .from('activity_log')
          .select('created_at')
          .eq('action', 'content_agent_update')
          .eq('entity_id', page.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (recentUpdate) {
          console.log(`Skipping ${page.title} - already updated by agent in last 24 hours`);
          continue; // Skip this page to avoid duplicate processing
        }

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
        // Check if this article was already processed by the agent recently (within last 24 hours)
        const { data: recentUpdate } = await supabase
          .from('activity_log')
          .select('created_at')
          .eq('action', 'content_agent_update')
          .eq('entity_id', article.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (recentUpdate) {
          console.log(`Skipping ${article.title} - already updated by agent in last 24 hours`);
          continue; // Skip this article to avoid duplicate processing
        }

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
            // Log the update with full details
            await supabase.from('activity_log').insert({
              action: 'content_agent_update',
              entity_type: issue.type,
              entity_id: issue.id,
              metadata: {
                title: issue.title,
                slug: currentData.slug,
                fields_updated: Object.keys(updates),
                updates_preview: Object.keys(updates).reduce((acc, key) => {
                  acc[key] = updates[key].substring(0, 100) + (updates[key].length > 100 ? '...' : '');
                  return acc;
                }, {}),
                ai_generated: true,
                updated_at: new Date().toISOString()
              }
            });

            logs.push({
              entity: issue.title,
              type: issue.type,
              fields: Object.keys(updates),
              status: 'success'
            });

            console.log(`Successfully updated ${issue.title} - Fields: ${Object.keys(updates).join(', ')}`);
          } else {
            logs.push({
              entity: issue.title,
              type: issue.type,
              status: 'error',
              error: updateError.message
            });
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
      total_scanned: (countries?.length || 0) + (contentPages?.length || 0) + (newsArticles?.length || 0),
      countries_processed: countries?.length || 0,
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
