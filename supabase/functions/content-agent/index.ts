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
  'trinidad-and-tobago': ['Trinidad', 'Trinidad and Tobago'],
  'antigua-and-barbuda': ['Antigua', 'Antigua and Barbuda'],
  'saint-vincent-and-the-grenadines': ['St Vincent', 'Saint Vincent'],
  'saint-lucia': ['St Lucia', 'Saint Lucia'],
  'bosnia-and-herzegovina': ['Bosnia', 'Bosnia and Herzegovina'],
  'north-macedonia': ['Macedonia', 'North Macedonia'],
  'papua-new-guinea': ['Papua New Guinea', 'PNG'],
  'democratic-republic-of-the-congo': ['DR Congo', 'DRC', 'Congo'],
  'central-african-republic': ['Central African Republic', 'CAR'],
  'equatorial-guinea': ['Equatorial Guinea', 'EG'],
  'sao-tome-and-principe': ['Sao Tome', 'São Tomé'],
};

// Get CTR-optimized country display name
function getCTROptimizedName(slug: string, name: string): string {
  const abbrevs = COUNTRY_ABBREVIATIONS[slug];
  if (abbrevs && abbrevs.length > 0) {
    return abbrevs[0];
  }
  return name;
}

// Generate CTR-optimized prompt for a country
function generateCTRPrompt(country: { name: string; slug: string }, ctrName: string): string {
  return `Write a comprehensive, CTR-optimized visa guide for ${country.name}. 

CRITICAL: This content must rank for these exact search queries:
- "${ctrName} visa requirements"
- "${ctrName.toLowerCase()} visa requirements 2025"
- "do i need a visa for ${ctrName.toLowerCase()}"
- "do Americans need a visa for ${ctrName.toLowerCase()}"
- "do US citizens need a visa for ${ctrName.toLowerCase()}"

TARGET AUDIENCE: Global travelers with emphasis on US/American travelers as primary audience.

Start with: "Do you need a visa for ${ctrName}?" and answer the question immediately.

Structure the content with these sections:

1. **Opening Hook** (Answer the main question immediately - do visitors need a visa?)
   - State visa-free entry policy upfront if applicable
   - Mention allowed stay duration
   - Highlight key nationalities that can enter visa-free

2. **Visa-Free Entry Details** for ${country.name}
   - List major countries that can enter visa-free (US, UK, EU, Canada, Australia, etc.)
   - Duration of visa-free stay
   - Passport validity requirements (typically 6 months)

3. **Entry Requirements** (What You Need to Enter ${ctrName})
   - Valid passport requirements
   - Proof of accommodation
   - Return/onward ticket
   - Sufficient funds
   - Health insurance requirements
   - COVID-19 requirements (if any still apply)

4. **Step-by-Step Visa Application Process** (for those who need a visa)
   - Document checklist
   - Application steps
   - Where to apply (embassy, online, on arrival)
   - Processing times
   - Fees in USD

5. **For US Citizens & Americans**
   - Specific requirements for American travelers
   - Direct flights from US cities (if applicable)
   - Embassy/consulate information in the US

6. **Frequently Asked Questions** (Target "People Also Ask" on Google)
   - "Can I extend my stay in ${ctrName}?"
   - "What documents do I need to visit ${ctrName}?"
   - "Is ${ctrName} visa-free for Americans?"
   - "How long can I stay in ${ctrName} without a visa?"
   - "Is ${ctrName} safe for tourists?"

7. **Travel Tips for ${country.name}**
   - Best time to visit
   - Currency and payment methods
   - Safety tips
   - Local customs and etiquette
   - Must-see attractions

Format in clean HTML with h2, h3, p, ul, li tags. Use Tailwind CSS classes for spacing (mb-4, mt-6, etc.).
IMPORTANT: Do NOT use border classes. Keep styling minimal and clean.
Make it comprehensive (1500+ words) and SEO-optimized with natural keyword placement.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Content Agent: Starting scan...');
    
    // Parse request body for options
    let priorityCountrySlug: string | null = null;
    let bulkCTRMode = false;
    let batchSize = 3; // Process 3 countries per run to avoid timeouts
    
    try {
      const body = await req.json();
      priorityCountrySlug = body?.priorityCountry || null;
      bulkCTRMode = body?.bulkCTR === true;
      batchSize = body?.batchSize || 3;
      console.log(`Priority country: ${priorityCountrySlug}, Bulk CTR mode: ${bulkCTRMode}, Batch size: ${batchSize}`);
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
          bulkCTRMode,
          batchSize,
          timestamp: new Date().toISOString()
        }
      });

    // Function to process a single country with CTR optimization
    async function processCountryWithCTR(country: { id: string; name: string; slug: string; code: string }) {
      const ctrName = getCTROptimizedName(country.slug, country.name);
      const ctrPrompt = generateCTRPrompt(country, ctrName);

      // Broadcast processing status
      await supabase.from('activity_log').insert({
        action: 'content_agent_status',
        entity_type: 'country_ctr',
        metadata: {
          status: 'processing',
          country_name: country.name,
          country_slug: country.slug,
          ctr_name: ctrName,
          timestamp: new Date().toISOString()
        }
      });

      console.log(`🔄 Processing CTR optimization for ${country.name} (${ctrName})...`);

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
5. Provides comprehensive, accurate visa information
6. Targets US/American travelers as the primary audience`
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      // CTR-optimized meta title and description
      const metaTitle = `${ctrName} Visa Requirements 2025 | Do You Need a Visa for ${ctrName}?`;
      const metaDescription = `Do you need a visa for ${ctrName}? ✓ Complete ${country.name} visa guide ✓ Entry requirements ✓ Visa-free countries ✓ Step-by-step application. Updated 2025.`;
      
      // Keywords optimized for search queries
      const keywords = [
        `${ctrName.toLowerCase()} visa requirements`,
        `${ctrName.toLowerCase()} visa`,
        `do i need a visa for ${ctrName.toLowerCase()}`,
        `${country.name.toLowerCase()} visa requirements`,
        `${ctrName.toLowerCase()} entry requirements`,
        `visit ${ctrName.toLowerCase()}`,
        `${ctrName.toLowerCase()} travel guide 2025`,
        `us citizens ${ctrName.toLowerCase()}`,
        `americans ${ctrName.toLowerCase()} visa`
      ];

      // Check if content page exists
      const { data: existingPage } = await supabase
        .from('content_pages')
        .select('id, updated_at')
        .eq('slug', `countries/${country.slug}`)
        .maybeSingle();

      const pageData = {
        title: `${ctrName} Visa Requirements 2025 | ${country.name} Entry Guide`,
        content: generatedContent,
        excerpt: `Complete guide to ${ctrName} visa requirements for 2025. Essential info for US citizens, Americans, and travelers worldwide visiting ${country.name}.`,
        meta_title: metaTitle,
        meta_description: metaDescription,
        keywords: keywords,
        updated_at: new Date().toISOString()
      };

      let pageId: string;

      if (existingPage) {
        // Update existing page with CTR-optimized content
        const { error: updateError } = await supabase
          .from('content_pages')
          .update(pageData)
          .eq('id', existingPage.id);

        if (updateError) throw updateError;
        pageId = existingPage.id;
        console.log(`✅ Updated CTR-optimized content for ${country.name}`);
      } else {
        // Create new CTR-optimized page
        const { data: insertedPage, error: insertError } = await supabase
          .from('content_pages')
          .insert({
            slug: `countries/${country.slug}`,
            ...pageData,
            is_published: true,
            status: 'published',
            ai_generated: true
          })
          .select()
          .single();

        if (insertError) throw insertError;
        pageId = insertedPage.id;
        console.log(`✅ Created CTR-optimized content for ${country.name}`);
      }

      // Log the CTR optimization
      await supabase.from('activity_log').insert({
        action: 'content_agent_ctr_optimization',
        entity_type: 'country_guide',
        entity_id: pageId,
        metadata: {
          country_name: country.name,
          country_slug: country.slug,
          ctr_name: ctrName,
          meta_title: metaTitle,
          meta_description: metaDescription.substring(0, 100) + '...',
          keywords: keywords.slice(0, 5),
          content_length: generatedContent.length,
          ai_generated: true,
          timestamp: new Date().toISOString()
        }
      });

      // Submit to IndexNow for faster re-indexing
      try {
        await fetch(`${supabaseUrl}/functions/v1/indexnow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            urls: [`/countries/${country.slug}`]
          })
        });
        console.log(`📡 Submitted ${country.slug} to IndexNow`);
      } catch (indexError) {
        console.error('IndexNow submission error:', indexError);
      }

      return {
        entity: `${country.name} (${ctrName})`,
        type: 'country_ctr',
        status: 'success',
        message: existingPage ? 'CTR content updated' : 'CTR content created',
        page_id: pageId
      };
    }

    // PRIORITY COUNTRY MODE: Process a single specific country
    if (priorityCountrySlug) {
      console.log(`Processing priority country: ${priorityCountrySlug}`);
      
      const { data: priorityCountry } = await supabase
        .from('countries')
        .select('id, name, slug, code')
        .eq('slug', priorityCountrySlug)
        .single();

      if (priorityCountry) {
        try {
          const result = await processCountryWithCTR(priorityCountry);
          logs.push(result);
        } catch (error) {
          console.error(`Error processing ${priorityCountry.name}:`, error);
          logs.push({
            entity: priorityCountry.name,
            type: 'country_ctr',
            status: 'error',
            error: error.message
          });
        }
      }
    }
    // BULK CTR MODE: Process all countries that haven't been CTR-optimized recently
    else if (bulkCTRMode) {
      console.log(`Bulk CTR mode: Processing ${batchSize} countries...`);

      // Get countries that haven't been CTR-optimized in the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Get all country slugs that have been recently optimized
      const { data: recentlyOptimized } = await supabase
        .from('activity_log')
        .select('metadata')
        .eq('action', 'content_agent_ctr_optimization')
        .gte('created_at', sevenDaysAgo);

      const recentSlugs = new Set(
        recentlyOptimized?.map(log => (log.metadata as any)?.country_slug).filter(Boolean) || []
      );

      // Get countries to process (excluding recently optimized)
      const { data: allCountries } = await supabase
        .from('countries')
        .select('id, name, slug, code')
        .order('name');

      const countriesToProcess = allCountries?.filter(c => !recentSlugs.has(c.slug)) || [];
      const batch = countriesToProcess.slice(0, batchSize);

      console.log(`Found ${countriesToProcess.length} countries needing CTR optimization, processing ${batch.length}...`);

      for (const country of batch) {
        try {
          const result = await processCountryWithCTR(country);
          logs.push(result);
          
          // Add a small delay between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Error processing ${country.name}:`, error);
          logs.push({
            entity: country.name,
            type: 'country_ctr',
            status: 'error',
            error: error.message
          });
        }
      }

      // Log remaining countries count
      const remaining = countriesToProcess.length - batch.length;
      if (remaining > 0) {
        console.log(`📊 ${remaining} countries remaining for CTR optimization`);
      }
    }
    // DEFAULT MODE: Process countries without any content page
    else {
      const { data: countries } = await supabase
        .from('countries')
        .select('id, name, slug, code')
        .limit(batchSize);

      if (countries) {
        for (const country of countries) {
          const { data: existingGuide } = await supabase
            .from('content_pages')
            .select('id')
            .eq('slug', `countries/${country.slug}`)
            .maybeSingle();

          if (!existingGuide) {
            try {
              const result = await processCountryWithCTR(country);
              logs.push(result);
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
              console.error(`Error processing ${country.name}:`, error);
              logs.push({
                entity: country.name,
                type: 'country_ctr',
                status: 'error',
                error: error.message
              });
            }
          }
        }
      }
    }

    // Process content pages and news articles for missing fields (non-CTR updates)
    if (!priorityCountrySlug && !bulkCTRMode) {
      const issues: ContentIssue[] = [];

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

          if (recentUpdate) continue;

          const missingFields: string[] = [];
          if (!page.excerpt || page.excerpt.trim().length < 50) missingFields.push('excerpt');
          if (!page.meta_description || page.meta_description.trim().length < 50) missingFields.push('meta_description');
          if (!page.meta_title || page.meta_title.trim().length < 10) missingFields.push('meta_title');
          if (!page.content || page.content.trim().length < 100) missingFields.push('content');

          if (missingFields.length > 0) {
            issues.push({ id: page.id, type: 'content_page', title: page.title, missingFields });
          }
        }
      }

      // Process issues
      for (const issue of issues) {
        try {
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
                prompt = `Write a compelling 2-3 sentence excerpt for an article titled "${currentData.title}". ${currentData.content ? `Based on this content: ${currentData.content.substring(0, 500)}` : 'Make it engaging about visa requirements.'}`;
                break;
              case 'meta_description':
                prompt = `Write an SEO meta description (150-160 chars) for "${currentData.title}". Include power words and a call to action.`;
                break;
              case 'meta_title':
                prompt = `Write an SEO title (50-60 chars) for "${currentData.title}". Make it compelling with keywords.`;
                break;
              case 'content':
                prompt = `Write a 500-word article about "${currentData.title}" covering visa requirements and travel tips.`;
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
                  { role: 'system', content: 'You are an expert SEO content writer for visa and travel information.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1000,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              updates[field] = data.choices[0].message.content;
            }
          }

          if (Object.keys(updates).length > 0) {
            await supabase.from(table).update(updates).eq('id', issue.id);
            logs.push({ entity: issue.title, type: issue.type, fields: Object.keys(updates), status: 'success' });
          }
        } catch (error) {
          logs.push({ entity: issue.title, type: issue.type, status: 'error', error: error.message });
        }
      }
    }

    const summary = {
      mode: priorityCountrySlug ? 'priority' : bulkCTRMode ? 'bulk_ctr' : 'default',
      priority_country: priorityCountrySlug,
      updates_made: logs.filter(l => l.status === 'success').length,
      errors: logs.filter(l => l.status === 'error').length,
      logs
    };

    console.log('Content Agent: Complete', summary);

    // Broadcast completion
    await supabase.from('activity_log').insert({
      action: 'content_agent_status',
      entity_type: 'system',
      metadata: {
        status: 'completed',
        ...summary,
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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
