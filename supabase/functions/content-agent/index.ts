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

// Country name abbreviations mapping for CTR optimization
const COUNTRY_ABBREVIATIONS: Record<string, string[]> = {
  'saint-kitts-and-nevis': ['St Kitts', 'Saint Kitts', 'St Kitts and Nevis'],
  'united-states': ['USA', 'US', 'United States', 'America'],
  'united-kingdom': ['UK', 'Britain', 'United Kingdom', 'Great Britain'],
  'united-arab-emirates': ['UAE', 'Dubai', 'United Arab Emirates'],
  'czech-republic': ['Czech Republic', 'Czechia'],
  'south-korea': ['South Korea', 'Korea'],
  'new-zealand': ['New Zealand', 'NZ'],
  'hong-kong': ['Hong Kong', 'HK'],
  'saudi-arabia': ['Saudi Arabia', 'KSA'],
};

// Get CTR-optimized country display name
function getCTROptimizedName(slug: string, name: string): string {
  const abbrevs = COUNTRY_ABBREVIATIONS[slug];
  if (abbrevs && abbrevs.length > 0) {
    return abbrevs[0]; // Return shortest/most common abbreviation
  }
  return name;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Content Agent: Starting scan...');
    
    // Parse request body for priority country
    let priorityCountrySlug: string | null = null;
    let targetAudience: string = 'global';
    
    try {
      const body = await req.json();
      priorityCountrySlug = body?.priorityCountry || null;
      targetAudience = body?.targetAudience || 'global';
      console.log(`Priority country: ${priorityCountrySlug}, Target audience: ${targetAudience}`);
    } catch {
      // No body provided, continue with default behavior
    }
    
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

    // Broadcast agent start
    await supabase
      .from('activity_log')
      .insert({
        action: 'content_agent_status',
        entity_type: 'system',
        metadata: {
          status: 'started',
          priorityCountry: priorityCountrySlug,
          targetAudience,
          timestamp: new Date().toISOString()
        }
      });

    // If priority country specified, process it first with CTR-optimized content
    if (priorityCountrySlug) {
      console.log(`Processing priority country: ${priorityCountrySlug}`);
      
      const { data: priorityCountry } = await supabase
        .from('countries')
        .select('id, name, slug, code')
        .eq('slug', priorityCountrySlug)
        .single();

      if (priorityCountry) {
        const ctrName = getCTROptimizedName(priorityCountry.slug, priorityCountry.name);
        const alternativeNames = COUNTRY_ABBREVIATIONS[priorityCountry.slug] || [priorityCountry.name];
        
        // Generate CTR-optimized content with search intent keywords
        const ctrPrompt = `Write a comprehensive, CTR-optimized visa guide for ${priorityCountry.name}. 

CRITICAL: This content must rank for these exact search queries:
- "${ctrName} visa requirements"
- "${ctrName.toLowerCase()} visa requirements 2025"
- "do i need a visa for ${ctrName.toLowerCase()}"
- "do ${targetAudience === 'US' ? 'US citizens' : 'Americans'} need a visa for ${ctrName.toLowerCase()}"

${targetAudience === 'US' ? `TARGET AUDIENCE: US citizens and American travelers. Include US-specific information prominently.

Start with: "Do US citizens need a visa for ${ctrName}?" and answer immediately.` : ''}

Structure the content with these sections:

1. **Opening Hook** (Answer the main question immediately - do visitors need a visa?)
   - State visa-free entry policy upfront if applicable
   - Mention allowed stay duration

2. **Visa-Free Entry Details** for ${priorityCountry.name}
   - List countries that can enter visa-free
   - Duration of visa-free stay
   - Passport validity requirements

3. **Entry Requirements** (What You Need to Enter)
   - Valid passport requirements
   - Proof of accommodation
   - Return/onward ticket
   - Sufficient funds
   - Health insurance requirements

4. **Step-by-Step Visa Application Process** (for those who need a visa)
   - Document checklist
   - Application steps
   - Processing times
   - Fees

5. **US Citizens Section** (if targeting US audience)
   - Specific requirements for American travelers
   - Direct flights from US cities
   - Embassy/consulate information

6. **Frequently Asked Questions** (Target "People Also Ask")
   - "Can I extend my stay in ${ctrName}?"
   - "What documents do I need to visit ${ctrName}?"
   - "Is ${ctrName} visa-free for Americans?"
   - "How long can I stay in ${ctrName} without a visa?"

7. **Travel Tips for ${priorityCountry.name}**
   - Best time to visit
   - Currency information
   - Safety tips
   - Local customs

Format in clean HTML with h2, h3, p, ul, li tags. Use Tailwind CSS classes for styling.
IMPORTANT: Do NOT use border classes. Keep styling minimal and clean.
Make it comprehensive (1500+ words) and SEO-optimized.`;

        try {
          // Broadcast processing status
          await supabase.from('activity_log').insert({
            action: 'content_agent_status',
            entity_type: 'priority_country',
            metadata: {
              status: 'processing',
              country_name: priorityCountry.name,
              country_slug: priorityCountry.slug,
              ctr_optimized: true,
              target_audience: targetAudience,
              timestamp: new Date().toISOString()
            }
          });

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
                  content: `You are an expert travel and visa content writer specializing in SEO-optimized, high-CTR content. Your goal is to create content that:
1. Matches exact search queries users type into Google
2. Answers the main question immediately (no fluff)
3. Uses power words that drive clicks
4. Includes target keywords naturally throughout
5. Provides comprehensive, accurate visa information`
                },
                {
                  role: 'user',
                  content: ctrPrompt
                }
              ],
              temperature: 0.7,
              max_tokens: 4000,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const generatedContent = data.choices[0].message.content;

            // CTR-optimized meta title and description
            const metaTitle = `${ctrName} Visa Requirements 2025 | ${targetAudience === 'US' ? 'Do US Citizens Need a Visa?' : 'Entry Guide & Requirements'}`;
            const metaDescription = `${targetAudience === 'US' ? 'Do US citizens need a visa for ' + ctrName + '?' : 'Complete ' + ctrName + ' visa guide.'} ✓ ${priorityCountry.name === 'Saint Kitts and Nevis' ? '90-day visa-free entry' : 'Entry requirements'} ✓ Required documents ✓ Step-by-step application process. Updated 2025.`;
            
            // Keywords optimized for search queries
            const keywords = [
              `${ctrName.toLowerCase()} visa requirements`,
              `${ctrName.toLowerCase()} visa`,
              `do i need a visa for ${ctrName.toLowerCase()}`,
              `${priorityCountry.name.toLowerCase()} visa requirements`,
              `${ctrName.toLowerCase()} entry requirements`,
              `visit ${ctrName.toLowerCase()}`,
              `${ctrName.toLowerCase()} travel guide 2025`,
              ...(targetAudience === 'US' ? [`us citizens ${ctrName.toLowerCase()}`, `americans ${ctrName.toLowerCase()} visa`] : [])
            ];

            // Check if content page exists
            const { data: existingPage } = await supabase
              .from('content_pages')
              .select('id')
              .eq('slug', `countries/${priorityCountry.slug}`)
              .maybeSingle();

            if (existingPage) {
              // Update existing page with CTR-optimized content
              const { error: updateError } = await supabase
                .from('content_pages')
                .update({
                  title: `${ctrName} Visa Requirements 2025 | ${priorityCountry.name} Entry Guide`,
                  content: generatedContent,
                  excerpt: `Complete guide to ${ctrName} visa requirements for 2025. ${targetAudience === 'US' ? 'Essential info for US citizens and American travelers.' : 'Everything you need to know before visiting ' + priorityCountry.name + '.'}`,
                  meta_title: metaTitle,
                  meta_description: metaDescription,
                  keywords: keywords,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingPage.id);

              if (!updateError) {
                logs.push({
                  entity: `${priorityCountry.name} Guide (CTR Optimized)`,
                  type: 'priority_country',
                  status: 'success',
                  message: 'CTR-optimized content updated',
                  page_id: existingPage.id
                });
                console.log(`✅ Updated CTR-optimized content for ${priorityCountry.name}`);
              }
            } else {
              // Create new CTR-optimized page
              const { data: insertedPage, error: insertError } = await supabase
                .from('content_pages')
                .insert({
                  slug: `countries/${priorityCountry.slug}`,
                  title: `${ctrName} Visa Requirements 2025 | ${priorityCountry.name} Entry Guide`,
                  content: generatedContent,
                  excerpt: `Complete guide to ${ctrName} visa requirements for 2025. ${targetAudience === 'US' ? 'Essential info for US citizens and American travelers.' : 'Everything you need to know before visiting ' + priorityCountry.name + '.'}`,
                  meta_title: metaTitle,
                  meta_description: metaDescription,
                  keywords: keywords,
                  is_published: true,
                  status: 'published',
                  ai_generated: true
                })
                .select()
                .single();

              if (!insertError && insertedPage) {
                logs.push({
                  entity: `${priorityCountry.name} Guide (CTR Optimized)`,
                  type: 'priority_country',
                  status: 'success',
                  message: 'CTR-optimized content created',
                  page_id: insertedPage.id
                });
                console.log(`✅ Created CTR-optimized content for ${priorityCountry.name}`);
              }
            }

            // Log the CTR optimization
            await supabase.from('activity_log').insert({
              action: 'content_agent_ctr_optimization',
              entity_type: 'country_guide',
              metadata: {
                country_name: priorityCountry.name,
                country_slug: priorityCountry.slug,
                ctr_name: ctrName,
                meta_title: metaTitle,
                meta_description: metaDescription,
                keywords: keywords,
                target_audience: targetAudience,
                ai_generated: true,
                timestamp: new Date().toISOString()
              }
            });

            // Submit to IndexNow for faster re-indexing
            try {
              const indexNowResponse = await fetch(`${supabaseUrl}/functions/v1/indexnow`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  urls: [`/countries/${priorityCountry.slug}`]
                })
              });
              
              if (indexNowResponse.ok) {
                console.log(`✅ Submitted ${priorityCountry.slug} to IndexNow`);
                logs.push({
                  entity: `IndexNow: ${priorityCountry.name}`,
                  type: 'indexnow',
                  status: 'success',
                  message: 'URL submitted to IndexNow for re-indexing'
                });
              }
            } catch (indexError) {
              console.error('IndexNow submission error:', indexError);
            }
          }
        } catch (error) {
          console.error(`Error processing priority country ${priorityCountry.name}:`, error);
          logs.push({
            entity: `${priorityCountry.name} Guide`,
            type: 'priority_country',
            status: 'error',
            error: error.message
          });
        }
      }
    }

    // Continue with regular country processing (only if no priority country)
    if (!priorityCountrySlug) {
      const { data: countries } = await supabase
        .from('countries')
        .select('id, name, slug, code')
        .limit(5);

      if (countries) {
        for (const country of countries) {
          const { data: existingGuide } = await supabase
            .from('content_pages')
            .select('id')
            .eq('slug', `countries/${country.slug}`)
            .maybeSingle();

          if (!existingGuide) {
            const ctrName = getCTROptimizedName(country.slug, country.name);
            
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

                const { data: insertedPage, error: insertError } = await supabase
                  .from('content_pages')
                  .insert({
                    slug: `countries/${country.slug}`,
                    title: `${ctrName} Visa Requirements 2025 | ${country.name} Travel Guide`,
                    content: generatedContent,
                    excerpt: `Complete guide to ${country.name} visa requirements, types, and application process. Essential information for travelers visiting ${country.name}.`,
                    meta_title: `${ctrName} Visa Requirements 2025 | Entry Guide | Visas.Guide`,
                    meta_description: `Complete ${ctrName} visa requirements guide for 2025. Tourist, business, student visa info, processing times, and application process. Updated guide.`,
                    keywords: [`${ctrName.toLowerCase()} visa`, `${ctrName.toLowerCase()} visa requirements`, `${country.name.toLowerCase()} travel guide`, `visit ${ctrName.toLowerCase()}`],
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
    }

    // Scan content_pages for missing content
    const { data: contentPages } = await supabase
      .from('content_pages')
      .select('*')
      .eq('is_published', true)
      .limit(10);

    if (contentPages) {
      for (const page of contentPages) {
        const { data: recentUpdate } = await supabase
          .from('activity_log')
          .select('created_at')
          .eq('action', 'content_agent_update')
          .eq('entity_id', page.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (recentUpdate) {
          console.log(`Skipping ${page.title} - already updated by agent in last 24 hours`);
          continue;
        }

        await supabase
          .from('activity_log')
          .insert({
            action: 'content_agent_status',
            entity_type: 'content_page',
            entity_id: page.id,
            metadata: {
              status: 'processing',
              title: page.title,
              slug: page.slug,
              timestamp: new Date().toISOString()
            }
          });

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
        const { data: recentUpdate } = await supabase
          .from('activity_log')
          .select('created_at')
          .eq('action', 'content_agent_update')
          .eq('entity_id', article.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (recentUpdate) {
          console.log(`Skipping ${article.title} - already updated by agent in last 24 hours`);
          continue;
        }

        await supabase
          .from('activity_log')
          .insert({
            action: 'content_agent_status',
            entity_type: 'news_article',
            entity_id: article.id,
            metadata: {
              status: 'processing',
              title: article.title,
              slug: article.slug,
              timestamp: new Date().toISOString()
            }
          });

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
        
        const table = issue.type === 'content_page' ? 'content_pages' : 'news_articles';
        const { data: currentData } = await supabase
          .from(table)
          .select('*')
          .eq('id', issue.id)
          .single();

        if (!currentData) continue;

        const updates: any = {};

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

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from(table)
            .update(updates)
            .eq('id', issue.id);

          if (!updateError) {
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
      total_scanned: (contentPages?.length || 0) + (newsArticles?.length || 0),
      priority_country: priorityCountrySlug,
      target_audience: targetAudience,
      issues_found: issues.length,
      updates_made: logs.filter(l => l.status === 'success').length,
      errors: logs.filter(l => l.status === 'error').length,
      logs
    };

    console.log('Content Agent: Scan complete', summary);

    // Broadcast agent completion
    await supabase
      .from('activity_log')
      .insert({
        action: 'content_agent_status',
        entity_type: 'system',
        metadata: {
          status: 'completed',
          updates_made: logs.filter(l => l.status === 'success').length,
          priority_country: priorityCountrySlug,
          timestamp: new Date().toISOString()
        }
      });

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
