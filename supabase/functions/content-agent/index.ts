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

// Priority countries for visa requirement content generation
const PRIORITY_ORIGINS = ['united-states', 'united-kingdom', 'india', 'germany', 'united-arab-emirates', 'canada', 'australia', 'china', 'pakistan', 'philippines', 'nigeria', 'brazil', 'mexico', 'france', 'italy'];
const PRIORITY_DESTINATIONS = ['united-states', 'united-kingdom', 'united-arab-emirates', 'thailand', 'singapore', 'japan', 'australia', 'germany', 'france', 'italy', 'canada', 'spain', 'turkey', 'indonesia', 'malaysia'];

// Get CTR-optimized country display name
function getCTROptimizedName(slug: string, name: string): string {
  const abbrevs = COUNTRY_ABBREVIATIONS[slug];
  if (abbrevs && abbrevs.length > 0) {
    return abbrevs[0];
  }
  return name;
}

// Generate CTR-optimized prompt for a country (REDUCED to 800 words)
function generateCTRPrompt(country: { name: string; slug: string }, ctrName: string): string {
  return `Write a comprehensive, CTR-optimized visa guide for ${country.name}. 

CRITICAL: This content must rank for these exact search queries:
- "${ctrName} visa requirements"
- "${ctrName.toLowerCase()} visa requirements 2025"
- "do i need a visa for ${ctrName.toLowerCase()}"

TARGET AUDIENCE: Global travelers with emphasis on US/American travelers.

Start with: "Do you need a visa for ${ctrName}?" and answer immediately.

Structure (keep it concise, 800 words max):

1. **Opening Hook** - Answer the main question immediately
2. **Visa-Free Entry Details** - List major countries that can enter visa-free
3. **Entry Requirements** - Passport, documents, tickets
4. **Visa Application Process** - For those who need a visa
5. **For US Citizens** - Specific requirements
6. **FAQs** (3-4 questions)
7. **Quick Travel Tips**

Format in clean HTML with h2, h3, p, ul, li tags. Use Tailwind CSS classes for spacing (mb-4, mt-6).
IMPORTANT: Do NOT use border classes. Keep styling minimal and clean.
Be concise but comprehensive. SEO-optimized with natural keyword placement.`;
}

// Human-style prompt for visa requirements content (country-to-country)
function generateVisaRequirementsPrompt(
  fromCountry: { name: string; slug: string },
  toCountry: { name: string; slug: string },
  visaData: { requirement_type: string; fee_usd?: number; processing_time_days?: number; max_stay_days?: number; notes?: string } | null
): string {
  const fromCTR = getCTROptimizedName(fromCountry.slug, fromCountry.name);
  const toCTR = getCTROptimizedName(toCountry.slug, toCountry.name);
  
  const visaType = visaData?.requirement_type?.replace(/_/g, ' ') || 'visa required';
  const fee = visaData?.fee_usd ? `$${visaData.fee_usd}` : 'varies';
  const processing = visaData?.processing_time_days ? `${visaData.processing_time_days} days` : 'varies';
  const maxStay = visaData?.max_stay_days ? `${visaData.max_stay_days} days` : 'varies';

  return `You're a friendly travel advisor helping a friend plan their trip. Write about ${toCTR} visa requirements for ${fromCTR} citizens.

WRITING STYLE - CRITICAL (must feel human, NOT AI):
- Write like you're chatting with a friend planning their trip
- Use contractions naturally: "you'll need", "don't worry", "it's pretty straightforward"
- NEVER use these AI phrases: "It is important to note", "In conclusion", "Furthermore", "Additionally", "It should be noted"
- Start with a direct answer - "Good news!" or "Here's the deal" or "Short answer:"
- Include practical, experience-based tips like a friend would share
- Vary sentence length - mix short punchy sentences with longer explanations
- Use "you" and "your" constantly - speak directly to the reader
- Add personality: "Pro tip:", "Here's what most people don't know:", "Trust me on this one:"
- Be conversational but accurate

KNOWN VISA INFO:
- Visa Type: ${visaType}
- Fee: ${fee}
- Processing: ${processing}
- Max Stay: ${maxStay}
${visaData?.notes ? `- Notes: ${visaData.notes}` : ''}

STRUCTURE (800-1000 words total):

1. **Quick Answer** (2-3 sentences) - Do ${fromCTR} citizens need a visa for ${toCTR}? Answer IMMEDIATELY in your opening line.

2. **The Basics** - What type of visa/entry is available, how long can you stay

3. **What You'll Actually Need** - Documents in practical terms, not bureaucratic language

4. **How to Get It** - Step-by-step process, written conversationally

5. **Money Talk** - Costs, payment methods, any hidden fees to watch for

6. **Timeline** - How long it takes, when to apply

7. **Pro Tips** - 3-4 practical tips from "experience"

8. **Common Questions** - 3 FAQs people actually ask

KEYWORDS TO WEAVE IN NATURALLY:
- "${toCTR} visa for ${fromCTR} citizens"
- "${fromCTR} citizens ${toCTR} visa requirements"
- "do ${fromCTR} citizens need visa for ${toCTR}"
- "${fromCTR} to ${toCTR} visa 2025"

OUTPUT: Clean HTML with h2, h3, p, ul tags. Use Tailwind classes for spacing (mb-4, mt-6). NO border classes.`;
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
    let visaEnrichmentMode = false;
    let blogGenerationMode = false;
    let faqGenerationMode = false;
    let visaRequirementsContentMode = false;
    let batchSize = 3;
    
    try {
      const body = await req.json();
      priorityCountrySlug = body?.priorityCountry || null;
      bulkCTRMode = body?.bulkCTR === true;
      visaEnrichmentMode = body?.visaEnrichment === true;
      blogGenerationMode = body?.blogGeneration === true;
      faqGenerationMode = body?.faqGeneration === true;
      visaRequirementsContentMode = body?.visaRequirementsContent === true;
      batchSize = body?.batchSize || 3;
      console.log(`Modes - Priority: ${priorityCountrySlug}, BulkCTR: ${bulkCTRMode}, VisaEnrich: ${visaEnrichmentMode}, Blog: ${blogGenerationMode}, FAQ: ${faqGenerationMode}, VisaReqContent: ${visaRequirementsContentMode}, Batch: ${batchSize}`);
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

    // Get agent task settings from site_settings
    const { data: agentSettings } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'agent_task_settings')
      .maybeSingle();

    const taskConfig = agentSettings?.setting_value as any || {
      ctr: { enabled: true, batchSize: 8 },
      create: { enabled: true, batchSize: 5 },
      visaEnrichment: { enabled: true, batchSize: 10 },
      blogGeneration: { enabled: true, batchSize: 3 },
      faqGeneration: { enabled: true, batchSize: 5 },
      visaRequirementsContent: { enabled: true, batchSize: 25 },
    };

    // Override batch size from settings if not provided in request
    if (!batchSize || batchSize === 3) {
      if (bulkCTRMode && taskConfig.ctr) batchSize = taskConfig.ctr.batchSize;
      else if (visaEnrichmentMode && taskConfig.visaEnrichment) batchSize = taskConfig.visaEnrichment.batchSize;
      else if (blogGenerationMode && taskConfig.blogGeneration) batchSize = taskConfig.blogGeneration.batchSize;
      else if (faqGenerationMode && taskConfig.faqGeneration) batchSize = taskConfig.faqGeneration.batchSize;
      else if (visaRequirementsContentMode && taskConfig.visaRequirementsContent) batchSize = taskConfig.visaRequirementsContent.batchSize;
      else if (taskConfig.create) batchSize = taskConfig.create.batchSize;
    }

    // Check if task is enabled
    const isTaskEnabled = (mode: string): boolean => {
      if (mode === 'bulkCTR') return taskConfig.ctr?.enabled !== false;
      if (mode === 'visaEnrichment') return taskConfig.visaEnrichment?.enabled !== false;
      if (mode === 'blogGeneration') return taskConfig.blogGeneration?.enabled !== false;
      if (mode === 'faqGeneration') return taskConfig.faqGeneration?.enabled !== false;
      if (mode === 'visaRequirementsContent') return taskConfig.visaRequirementsContent?.enabled !== false;
      return taskConfig.create?.enabled !== false;
    };

    // Determine which mode is being run and check if enabled
    let currentMode = 'default';
    if (bulkCTRMode) currentMode = 'bulkCTR';
    else if (visaEnrichmentMode) currentMode = 'visaEnrichment';
    else if (blogGenerationMode) currentMode = 'blogGeneration';
    else if (faqGenerationMode) currentMode = 'faqGeneration';
    else if (visaRequirementsContentMode) currentMode = 'visaRequirementsContent';

    if (!isTaskEnabled(currentMode) && !priorityCountrySlug) {
      console.log(`Task ${currentMode} is disabled in settings. Skipping.`);
      return new Response(JSON.stringify({ 
        mode: currentMode,
        status: 'skipped',
        reason: 'Task is disabled in agent settings',
        updates_made: 0,
        errors: 0,
        logs: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Task ${currentMode} is enabled. Batch size: ${batchSize}`);

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
          visaEnrichmentMode,
          blogGenerationMode,
          faqGenerationMode,
          visaRequirementsContentMode,
          batchSize,
          timestamp: new Date().toISOString()
        }
      });

    // Helper function to log API calls with token breakdown
    async function logApiCall(
      taskType: string,
      entityName: string,
      status: 'success' | 'error' | 'timeout',
      startTime: number,
      tokensUsed?: number,
      errorMessage?: string,
      retryCount?: number,
      inputTokens?: number,
      outputTokens?: number
    ) {
      const responseTime = Date.now() - startTime;
      await supabase.from('api_logs').insert({
        api_provider: 'deepseek',
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        task_type: taskType,
        entity_name: entityName,
        status,
        response_time_ms: responseTime,
        tokens_used: tokensUsed,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        error_message: errorMessage,
        retry_count: retryCount || 0,
        response_summary: { mode: currentMode }
      });
    }

    // Helper function to call DeepSeek API with retry logic
    async function callDeepSeek(systemPrompt: string, userPrompt: string, maxTokens = 2000, entityName = 'unknown'): Promise<string> {
      const maxRetries = 3;
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const startTime = Date.now();
        
        try {
          // Add timeout using AbortController
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
          
          const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.8, // Slightly higher for more natural writing
              max_tokens: maxTokens,
            }),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          const content = data.choices[0].message.content;
          const tokensUsed = data.usage?.total_tokens;
          const inputTokens = data.usage?.prompt_tokens;
          const outputTokens = data.usage?.completion_tokens;
          
          // Log successful API call with token breakdown
          await logApiCall(currentMode, entityName, 'success', startTime, tokensUsed, undefined, attempt, inputTokens, outputTokens);
          
          return content;
        } catch (error) {
          lastError = error as Error;
          const isTimeout = error.name === 'AbortError' || error.message?.includes('reading a body');
          const status = isTimeout ? 'timeout' : 'error';
          
          console.error(`DeepSeek API attempt ${attempt + 1}/${maxRetries} failed:`, error.message);
          
          // Log failed API call
          await logApiCall(currentMode, entityName, status, startTime, undefined, error.message, attempt);
          
          // Wait before retry with exponential backoff
          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
            console.log(`Retrying in ${delay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      throw lastError || new Error('DeepSeek API failed after retries');
    }

    // Helper function to submit URLs to IndexNow
    async function submitToIndexNow(urls: string[]) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/indexnow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ urls })
        });
        console.log(`📡 Submitted ${urls.length} URLs to IndexNow`);
      } catch (indexError) {
        console.error('IndexNow submission error:', indexError);
      }
    }

    // ============================================
    // MODE: VISA REQUIREMENTS CONTENT GENERATION (NEW)
    // ============================================
    if (visaRequirementsContentMode) {
      console.log(`🌍 Visa Requirements Content Mode: Processing ${batchSize} country combinations...`);

      // Get all countries
      const { data: allCountries } = await supabase
        .from('countries')
        .select('id, name, slug, code')
        .order('name');

      if (!allCountries || allCountries.length === 0) {
        throw new Error('No countries found in database');
      }

      // Get existing content pages for visa requirements
      const { data: existingPages } = await supabase
        .from('content_pages')
        .select('slug')
        .like('slug', '%-to-%-visa-requirements');

      const existingSlugs = new Set(existingPages?.map(p => p.slug) || []);

      // Get all visa requirements data for lookup
      const { data: visaRequirements } = await supabase
        .from('visa_requirements')
        .select(`
          id, requirement_type, fee_usd, processing_time_days, max_stay_days, notes,
          from_country_id, to_country_id
        `);

      // Create a map for quick lookup
      const visaDataMap = new Map<string, any>();
      for (const vr of visaRequirements || []) {
        const key = `${vr.from_country_id}-${vr.to_country_id}`;
        visaDataMap.set(key, vr);
      }

      // Create country ID to country map
      const countryById = new Map(allCountries.map(c => [c.id, c]));

      // Generate combinations with priority ordering
      const combinations: { from: typeof allCountries[0]; to: typeof allCountries[0]; priority: number }[] = [];
      
      for (const fromCountry of allCountries) {
        for (const toCountry of allCountries) {
          if (fromCountry.id === toCountry.id) continue;
          
          const slug = `${fromCountry.slug}-to-${toCountry.slug}-visa-requirements`;
          if (existingSlugs.has(slug)) continue;

          // Calculate priority score
          let priority = 0;
          if (PRIORITY_ORIGINS.includes(fromCountry.slug)) priority += 10;
          if (PRIORITY_DESTINATIONS.includes(toCountry.slug)) priority += 10;
          
          combinations.push({ from: fromCountry, to: toCountry, priority });
        }
      }

      // Sort by priority (highest first) and take batch
      combinations.sort((a, b) => b.priority - a.priority);
      const batch = combinations.slice(0, batchSize);

      console.log(`Found ${combinations.length} combinations needing content, processing ${batch.length} (priority sorted)...`);

      // Broadcast status
      await supabase.from('activity_log').insert({
        action: 'content_agent_status',
        entity_type: 'visa_requirements_content',
        metadata: {
          status: 'started',
          total_remaining: combinations.length,
          batch_size: batch.length,
          timestamp: new Date().toISOString()
        }
      });

      const generatedUrls: string[] = [];

      for (const combo of batch) {
        try {
          const fromCTR = getCTROptimizedName(combo.from.slug, combo.from.name);
          const toCTR = getCTROptimizedName(combo.to.slug, combo.to.name);
          const entityName = `${fromCTR} → ${toCTR}`;
          
          console.log(`📝 Generating visa content: ${entityName}`);

          // Broadcast processing status
          await supabase.from('activity_log').insert({
            action: 'content_agent_status',
            entity_type: 'visa_requirements_content',
            metadata: {
              status: 'processing',
              from_country: combo.from.name,
              to_country: combo.to.name,
              timestamp: new Date().toISOString()
            }
          });

          // Get visa data if available
          const visaDataKey = `${combo.from.id}-${combo.to.id}`;
          const visaData = visaDataMap.get(visaDataKey);

          // Generate human-style content
          const prompt = generateVisaRequirementsPrompt(combo.from, combo.to, visaData);
          const content = await callDeepSeek(
            `You're a friendly, experienced travel advisor who's helped thousands of travelers. Write naturally, like you're giving advice to a good friend. Be helpful, practical, and conversational.`,
            prompt,
            2500,
            entityName
          );

          // Create SEO-optimized metadata
          const slug = `${combo.from.slug}-to-${combo.to.slug}-visa-requirements`;
          const title = `${toCTR} Visa Requirements for ${fromCTR} Citizens 2025`;
          const metaTitle = `${toCTR} Visa for ${fromCTR} Citizens | Requirements & How to Apply`;
          const metaDescription = `Do ${fromCTR} citizens need a visa for ${toCTR}? ✓ Complete guide to ${combo.to.name} visa requirements ✓ Application process ✓ Fees & processing times. Updated 2025.`;
          
          const keywords = [
            `${toCTR.toLowerCase()} visa for ${fromCTR.toLowerCase()} citizens`,
            `${combo.from.name.toLowerCase()} to ${combo.to.name.toLowerCase()} visa`,
            `do ${fromCTR.toLowerCase()} citizens need visa for ${toCTR.toLowerCase()}`,
            `${combo.to.name.toLowerCase()} visa requirements`,
            `${fromCTR.toLowerCase()} passport ${toCTR.toLowerCase()}`,
            `${combo.from.slug} ${combo.to.slug} visa 2025`
          ];

          // Create JSON-LD structured data
          const jsonLdScript = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${title}",
  "description": "${metaDescription}",
  "datePublished": "${new Date().toISOString()}",
  "dateModified": "${new Date().toISOString()}",
  "author": {
    "@type": "Organization",
    "name": "visas.guide"
  },
  "publisher": {
    "@type": "Organization",
    "name": "visas.guide",
    "url": "https://visas.guide"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://visas.guide/visa-requirements/${slug}"
  }
}
</script>`;

          const fullContent = content + jsonLdScript;

          // Insert content page
          const { data: newPage, error: insertError } = await supabase
            .from('content_pages')
            .insert({
              slug: slug,
              title: title,
              content: fullContent,
              excerpt: metaDescription,
              meta_title: metaTitle,
              meta_description: metaDescription,
              keywords: keywords,
              is_published: true,
              status: 'published',
              ai_generated: true
            })
            .select()
            .single();

          if (insertError) throw insertError;

          generatedUrls.push(`/visa-requirements/${slug}`);

          logs.push({
            entity: entityName,
            type: 'visa_requirements_content',
            status: 'success',
            slug: slug,
            page_id: newPage.id
          });

          console.log(`✅ Created: ${entityName}`);

          // Reduced delay for aggressive batching (1.5s instead of 3s)
          await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error) {
          console.error(`Error generating visa content:`, error);
          logs.push({
            entity: `${combo.from.name} → ${combo.to.name}`,
            type: 'visa_requirements_content',
            status: 'error',
            error: error.message
          });
        }
      }

      // Batch submit all generated URLs to IndexNow
      if (generatedUrls.length > 0) {
        await submitToIndexNow(generatedUrls);
      }

      // Log remaining count
      const remainingCount = combinations.length - batch.length;
      console.log(`📊 ${remainingCount} country combinations still need content`);

      // Broadcast completion with stats
      await supabase.from('activity_log').insert({
        action: 'content_agent_status',
        entity_type: 'visa_requirements_content',
        metadata: {
          status: 'batch_complete',
          generated: generatedUrls.length,
          remaining: remainingCount,
          timestamp: new Date().toISOString()
        }
      });
    }

    // ============================================
    // MODE: VISA DATA ENRICHMENT (Uses DeepSeek, NOT RapidAPI)
    // ============================================
    if (visaEnrichmentMode) {
      console.log(`🔍 Visa Enrichment Mode: Processing ${batchSize} records...`);

      // Get visa requirements with missing data
      const { data: incompleteVisas } = await supabase
        .from('visa_requirements')
        .select(`
          id, requirement_type, fee_usd, processing_time_days, max_stay_days, notes,
          from_country:countries!visa_requirements_from_country_id_fkey(name, code),
          to_country:countries!visa_requirements_to_country_id_fkey(name, code)
        `)
        .or('fee_usd.is.null,processing_time_days.is.null,max_stay_days.is.null')
        .limit(batchSize);

      for (const visa of incompleteVisas || []) {
        try {
          const fromCountry = (visa.from_country as any)?.name || 'Unknown';
          const toCountry = (visa.to_country as any)?.name || 'Unknown';
          const entityName = `${fromCountry} → ${toCountry}`;
          
          console.log(`📝 Enriching visa data: ${entityName}`);

          // Broadcast processing status
          await supabase.from('activity_log').insert({
            action: 'content_agent_status',
            entity_type: 'visa_enrichment',
            metadata: {
              status: 'processing',
              from_country: fromCountry,
              to_country: toCountry,
              timestamp: new Date().toISOString()
            }
          });

          const prompt = `Research and provide visa information for travelers from ${fromCountry} visiting ${toCountry}.

Current known info:
- Visa type: ${visa.requirement_type}
- Fee: ${visa.fee_usd ? `$${visa.fee_usd}` : 'Unknown'}
- Processing time: ${visa.processing_time_days ? `${visa.processing_time_days} days` : 'Unknown'}
- Max stay: ${visa.max_stay_days ? `${visa.max_stay_days} days` : 'Unknown'}

Provide the following in JSON format ONLY (no markdown, no explanation):
{
  "fee_usd": <number or null if truly unknown>,
  "processing_time_days": <number or null>,
  "max_stay_days": <number or null>,
  "notes": "<brief notes about visa requirements, max 200 chars>"
}

Use typical values based on the visa type:
- visa_free: fee=0, processing=0, max_stay typically 30-90 days
- visa_on_arrival: fee typically $20-100, processing=0, max_stay 30-90 days
- e_visa/evisa_required: fee $20-150, processing 3-7 days, max_stay 30-90 days
- visa_required: fee $50-200, processing 5-15 days, max_stay 30-90 days

Return ONLY valid JSON.`;

          const result = await callDeepSeek(
            'You are a visa information expert. Return ONLY valid JSON with no markdown formatting.',
            prompt,
            500,
            entityName
          );

          // Parse JSON response
          let enrichedData;
          try {
            const cleanResult = result.replace(/```json\n?|\n?```/g, '').trim();
            enrichedData = JSON.parse(cleanResult);
            console.log(`📋 DeepSeek response for ${entityName}:`, JSON.stringify(enrichedData));
          } catch (parseError) {
            console.error('JSON parse error:', parseError, 'Raw:', result);
            continue;
          }

          // Update visa requirement with enriched data (use != null to catch undefined too)
          const updates: any = {};
          if (enrichedData.fee_usd != null && visa.fee_usd === null) {
            updates.fee_usd = Number(enrichedData.fee_usd);
          }
          if (enrichedData.processing_time_days != null && visa.processing_time_days === null) {
            updates.processing_time_days = Number(enrichedData.processing_time_days);
          }
          if (enrichedData.max_stay_days != null && visa.max_stay_days === null) {
            updates.max_stay_days = Number(enrichedData.max_stay_days);
          }
          if (enrichedData.notes && !visa.notes) {
            updates.notes = String(enrichedData.notes).substring(0, 200);
          }

          // Also update last_updated timestamp
          if (Object.keys(updates).length > 0) {
            updates.last_updated = new Date().toISOString();
            
            const { error: updateError } = await supabase
              .from('visa_requirements')
              .update(updates)
              .eq('id', visa.id);

            if (updateError) {
              console.error(`❌ Update failed for ${entityName}:`, updateError);
              logs.push({ entity: entityName, type: 'visa_enrichment', status: 'error', error: updateError.message });
            } else {
              logs.push({
                entity: entityName,
                type: 'visa_enrichment',
                status: 'success',
                fields_updated: Object.keys(updates)
              });
              console.log(`✅ Enriched: ${entityName}`, updates);
            }
          } else {
            console.log(`⚠️ No updates for ${entityName} - DeepSeek returned: fee=${enrichedData.fee_usd}, proc=${enrichedData.processing_time_days}, stay=${enrichedData.max_stay_days}`);
          }

          // Rate limit delay
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`Error enriching visa:`, error);
          logs.push({
            entity: `${(visa.from_country as any)?.name} → ${(visa.to_country as any)?.name}`,
            type: 'visa_enrichment',
            status: 'error',
            error: error.message
          });
        }
      }

      // Log remaining count
      const { count: remaining } = await supabase
        .from('visa_requirements')
        .select('id', { count: 'exact', head: true })
        .or('fee_usd.is.null,processing_time_days.is.null,max_stay_days.is.null');
      
      console.log(`📊 ${remaining} visa records still need enrichment`);
    }

    // ============================================
    // MODE: BLOG POST GENERATION (REDUCED to 800 words)
    // ============================================
    if (blogGenerationMode) {
      console.log(`📝 Blog Generation Mode: Creating ${batchSize} articles...`);

      // Topics for auto-generation
      const blogTopics = [
        { title: "Schengen Visa Guide 2025: Complete Application Process", slug: "schengen-visa-guide-2025", keywords: ["schengen visa", "europe visa", "schengen application"] },
        { title: "US Tourist Visa (B1/B2): Step-by-Step Guide", slug: "us-tourist-visa-b1-b2-guide", keywords: ["us visa", "b1 b2 visa", "america tourist visa"] },
        { title: "Dubai Visa Guide: Requirements for All Nationalities", slug: "dubai-visa-guide-requirements", keywords: ["dubai visa", "uae visa", "dubai tourist visa"] },
        { title: "Canada Visitor Visa 2025: Complete Guide", slug: "canada-visitor-visa-guide-2025", keywords: ["canada visa", "canadian visitor visa", "canada tourism"] },
        { title: "UK Standard Visitor Visa: Application Process", slug: "uk-visitor-visa-application-guide", keywords: ["uk visa", "british visa", "uk tourist visa"] },
        { title: "Australia Tourist Visa (Subclass 600): How to Apply", slug: "australia-tourist-visa-subclass-600", keywords: ["australia visa", "subclass 600", "australian tourist visa"] },
        { title: "Japan Tourist Visa Requirements 2025", slug: "japan-tourist-visa-requirements-2025", keywords: ["japan visa", "japanese visa", "visit japan"] },
        { title: "Thailand Visa Guide: Visa-Free Entry & Extensions", slug: "thailand-visa-guide-visa-free", keywords: ["thailand visa", "thai visa", "visit thailand"] },
        { title: "Singapore Visa Requirements for All Countries", slug: "singapore-visa-requirements-guide", keywords: ["singapore visa", "singapore entry", "visit singapore"] },
        { title: "New Zealand Visitor Visa: Complete Guide", slug: "new-zealand-visitor-visa-guide", keywords: ["new zealand visa", "nz visa", "visit new zealand"] },
        { title: "South Korea Visa Guide: K-ETA and Tourist Visa", slug: "south-korea-visa-k-eta-guide", keywords: ["korea visa", "k-eta", "south korea tourist visa"] },
        { title: "Turkey e-Visa: Online Application Guide", slug: "turkey-evisa-application-guide", keywords: ["turkey visa", "turkey e-visa", "turkish visa online"] },
        { title: "India e-Visa Guide: Tourist, Business & Medical", slug: "india-evisa-guide-tourist-business", keywords: ["india visa", "india e-visa", "indian tourist visa"] },
        { title: "Egypt Visa on Arrival: Complete Guide", slug: "egypt-visa-on-arrival-guide", keywords: ["egypt visa", "egypt visa on arrival", "visit egypt"] },
        { title: "Brazil Visa Requirements 2025", slug: "brazil-visa-requirements-2025", keywords: ["brazil visa", "brazilian visa", "visit brazil"] },
      ];

      // Check which topics don't exist yet
      const { data: existingPosts } = await supabase
        .from('content_pages')
        .select('slug')
        .like('slug', 'blog/%');

      const existingSlugs = new Set(existingPosts?.map(p => p.slug.replace('blog/', '')) || []);
      const newTopics = blogTopics.filter(t => !existingSlugs.has(t.slug)).slice(0, batchSize);

      for (const topic of newTopics) {
        try {
          console.log(`📝 Generating blog post: ${topic.title}`);

          await supabase.from('activity_log').insert({
            action: 'content_agent_status',
            entity_type: 'blog_generation',
            metadata: {
              status: 'processing',
              title: topic.title,
              timestamp: new Date().toISOString()
            }
          });

          // REDUCED prompt - 800 words max
          const content = await callDeepSeek(
            `You are an expert travel and visa content writer. Write SEO-optimized articles.`,
            `Write a concise 800-word article titled "${topic.title}".

Target keywords: ${topic.keywords.join(', ')}

Structure:
1. Introduction (answer the main query immediately)
2. Key Requirements Overview
3. Step-by-Step Application Process
4. Required Documents
5. Processing Time and Fees
6. FAQs (3-4 questions)
7. Quick Tips

Format in clean HTML with h2, h3, p, ul, li tags. Use Tailwind CSS classes for spacing.
Keep it concise, accurate, and helpful.`,
            2500,
            topic.title
          );

          const metaDescription = `Complete guide to ${topic.title.toLowerCase()}. Step-by-step application process, required documents, fees, and expert tips. Updated 2025.`;

          // Insert new blog post
          const { data: newPost, error } = await supabase
            .from('content_pages')
            .insert({
              title: topic.title,
              slug: `blog/${topic.slug}`,
              content: content,
              excerpt: metaDescription,
              meta_title: `${topic.title} | visas.guide`,
              meta_description: metaDescription,
              keywords: topic.keywords,
              is_published: true,
              status: 'published',
              ai_generated: true
            })
            .select()
            .single();

          if (error) throw error;

          logs.push({
            entity: topic.title,
            type: 'blog_generation',
            status: 'success',
            slug: `blog/${topic.slug}`
          });

          console.log(`✅ Created blog post: ${topic.title}`);

          // Submit to IndexNow
          await submitToIndexNow([`/blog/${topic.slug}`]);

          await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay
        } catch (error) {
          console.error(`Error generating blog:`, error);
          logs.push({
            entity: topic.title,
            type: 'blog_generation',
            status: 'error',
            error: error.message
          });
        }
      }
    }

    // ============================================
    // MODE: FAQ SCHEMA GENERATION
    // ============================================
    if (faqGenerationMode) {
      console.log(`❓ FAQ Generation Mode: Processing ${batchSize} pages...`);

      // Get country pages that need FAQ enhancement
      const { data: pagesNeedingFAQ } = await supabase
        .from('content_pages')
        .select('id, title, slug, content')
        .like('slug', 'countries/%')
        .eq('is_published', true)
        .limit(batchSize * 2);

      // Filter pages that don't already have FAQ section
      const pagesToProcess = (pagesNeedingFAQ || [])
        .filter(p => !p.content?.includes('faqSchema') && !p.content?.includes('"@type":"FAQPage"'))
        .slice(0, batchSize);

      for (const page of pagesToProcess) {
        try {
          const countryName = page.title.split(' Visa')[0] || page.title;
          console.log(`❓ Generating FAQ for: ${countryName}`);

          await supabase.from('activity_log').insert({
            action: 'content_agent_status',
            entity_type: 'faq_generation',
            metadata: {
              status: 'processing',
              page_title: page.title,
              timestamp: new Date().toISOString()
            }
          });

          const faqContent = await callDeepSeek(
            'You are a visa information expert. Generate FAQs that match Google "People Also Ask" queries.',
            `Generate 5 frequently asked questions about ${countryName} visa requirements.

For each FAQ, provide:
1. A question that matches how people search
2. A concise answer (2-3 sentences)

Return in this exact JSON format:
{
  "faqs": [
    {"question": "...", "answer": "..."}
  ]
}

Return ONLY valid JSON.`,
            1000,
            countryName
          );

          // Parse FAQ JSON
          let faqData;
          try {
            const cleanResult = faqContent.replace(/```json\n?|\n?```/g, '').trim();
            faqData = JSON.parse(cleanResult);
          } catch (parseError) {
            console.error('FAQ JSON parse error:', parseError);
            continue;
          }

          // Create FAQ schema HTML to append
          const faqSchemaScript = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    ${faqData.faqs.map((faq: any) => `{
      "@type": "Question",
      "name": "${faq.question.replace(/"/g, '\\"')}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${faq.answer.replace(/"/g, '\\"')}"
      }
    }`).join(',\n    ')}
  ]
}
</script>`;

          // Create visible FAQ section
          const faqHtml = `
<h2 class="text-2xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>
<div class="space-y-4">
${faqData.faqs.map((faq: any) => `
  <div class="border-b border-border pb-4">
    <h3 class="font-semibold text-lg mb-2">${faq.question}</h3>
    <p class="text-muted-foreground">${faq.answer}</p>
  </div>
`).join('')}
</div>
${faqSchemaScript}`;

          // Append FAQ to existing content
          const updatedContent = page.content + faqHtml;

          await supabase
            .from('content_pages')
            .update({ content: updatedContent })
            .eq('id', page.id);

          logs.push({
            entity: page.title,
            type: 'faq_generation',
            status: 'success',
            faqs_added: faqData.faqs.length
          });

          console.log(`✅ Added FAQ schema to: ${countryName}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Error generating FAQ:`, error);
          logs.push({
            entity: page.title,
            type: 'faq_generation',
            status: 'error',
            error: error.message
          });
        }
      }
    }

    // Function to process a single country with CTR optimization (REDUCED)
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

      const generatedContent = await callDeepSeek(
        `You are an expert travel and visa content writer specializing in SEO-optimized, high-CTR content.`,
        ctrPrompt,
        2500, // Reduced from 4000
        country.name
      );

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
      await submitToIndexNow([`/countries/${country.slug}`]);

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
          await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay
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
    else if (!visaEnrichmentMode && !blogGenerationMode && !faqGenerationMode && !visaRequirementsContentMode) {
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
              await new Promise(resolve => setTimeout(resolve, 3000));
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

    const summary = {
      mode: priorityCountrySlug ? 'priority' : bulkCTRMode ? 'bulk_ctr' : visaEnrichmentMode ? 'visa_enrichment' : blogGenerationMode ? 'blog_generation' : faqGenerationMode ? 'faq_generation' : visaRequirementsContentMode ? 'visa_requirements_content' : 'default',
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
