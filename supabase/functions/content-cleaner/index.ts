import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Clean HTML wrapper from content - extract just the article body
function cleanHTMLWrapper(content: string): { cleaned: string; wasFixed: boolean } {
  if (!content) return { cleaned: '', wasFixed: false };
  
  let cleaned = content;
  let wasFixed = false;
  
  // Remove markdown code block markers
  if (cleaned.includes('```html') || cleaned.includes('```')) {
    cleaned = cleaned.replace(/```html\n?/gi, '').replace(/```\n?/gi, '');
    wasFixed = true;
  }
  
  // Check if it's a full HTML document
  const isFullDoc = cleaned.includes('<!DOCTYPE') || 
                    cleaned.includes('<html') || 
                    cleaned.includes('<head>') ||
                    cleaned.includes('<body');
  
  if (isFullDoc) {
    wasFixed = true;
    
    // Try to extract body content
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      cleaned = bodyMatch[1].trim();
    }
    
    // Remove any remaining document structure tags
    cleaned = cleaned
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<\/?html[^>]*>/gi, '')
      .replace(/<head>[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?head[^>]*>/gi, '')
      .replace(/<\/?body[^>]*>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .replace(/<title>[\s\S]*?<\/title>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<style>[\s\S]*?<\/style>/gi, '')
      .replace(/<script>[\s\S]*?<\/script>/gi, '');
  }
  
  // Remove base64 images (they bloat content significantly)
  const base64Pattern = /src="data:image\/[^"]+"/gi;
  if (base64Pattern.test(cleaned)) {
    cleaned = cleaned.replace(base64Pattern, 'src="/placeholder.svg"');
    wasFixed = true;
  }
  
  // Clean up excessive whitespace
  cleaned = cleaned
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
  
  return { cleaned, wasFixed };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Content Cleaner: Starting...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse options
    let batchSize = 50;
    let dryRun = false;
    let assignAuthors = false;
    
    try {
      const body = await req.json();
      batchSize = body?.batchSize || 50;
      dryRun = body?.dryRun === true;
      assignAuthors = body?.assignAuthors === true;
    } catch {
      // No body
    }
    
    const results = {
      scanned: 0,
      cleaned: 0,
      authorsAssigned: 0,
      errors: [] as string[],
      samples: [] as { slug: string; before: string; after: string }[],
    };
    
    // ============================================
    // PHASE 1: Clean HTML wrappers from content
    // ============================================
    
    console.log(`Scanning for content with HTML wrappers (batch: ${batchSize})...`);
    
    // Find pages with HTML document wrappers
    const { data: dirtyPages, error: fetchError } = await supabase
      .from('content_pages')
      .select('id, slug, content')
      .or('content.ilike.%<!DOCTYPE%,content.ilike.%<html%,content.ilike.%```html%')
      .limit(batchSize);
    
    if (fetchError) {
      console.error('Error fetching pages:', fetchError);
      throw fetchError;
    }
    
    results.scanned = dirtyPages?.length || 0;
    console.log(`Found ${results.scanned} pages with HTML wrappers`);
    
    // Process each dirty page
    for (const page of (dirtyPages || [])) {
      try {
        const { cleaned, wasFixed } = cleanHTMLWrapper(page.content);
        
        if (wasFixed && cleaned.length > 100) {
          // Store sample for verification (first 3 only)
          if (results.samples.length < 3) {
            results.samples.push({
              slug: page.slug,
              before: page.content.substring(0, 200) + '...',
              after: cleaned.substring(0, 200) + '...',
            });
          }
          
          if (!dryRun) {
            const { error: updateError } = await supabase
              .from('content_pages')
              .update({ 
                content: cleaned,
                updated_at: new Date().toISOString()
              })
              .eq('id', page.id);
            
            if (updateError) {
              results.errors.push(`Failed to update ${page.slug}: ${updateError.message}`);
            } else {
              results.cleaned++;
            }
          } else {
            results.cleaned++;
          }
        }
      } catch (err) {
        results.errors.push(`Error processing ${page.slug}: ${err}`);
      }
    }
    
    // ============================================
    // PHASE 2: Assign authors to orphan pages
    // ============================================
    
    if (assignAuthors) {
      console.log('Assigning authors to pages without authors...');
      
      // Get all active authors
      const { data: authors } = await supabase
        .from('authors')
        .select('id')
        .eq('is_active', true);
      
      if (authors && authors.length > 0) {
        // Get pages without authors
        const { data: orphanPages } = await supabase
          .from('content_pages')
          .select('id')
          .is('author_id', null)
          .limit(batchSize);
        
        for (const page of (orphanPages || [])) {
          // Random author assignment
          const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
          
          if (!dryRun) {
            const { error: updateError } = await supabase
              .from('content_pages')
              .update({ author_id: randomAuthor.id })
              .eq('id', page.id);
            
            if (!updateError) {
              results.authorsAssigned++;
            }
          } else {
            results.authorsAssigned++;
          }
        }
      }
    }
    
    // ============================================
    // Get overall content health stats
    // ============================================
    
    const [
      { count: totalPages },
      { count: pagesWithWrapper },
      { count: pagesWithoutImages },
      { count: pagesWithoutAuthors },
    ] = await Promise.all([
      supabase.from('content_pages').select('id', { count: 'exact', head: true }),
      supabase.from('content_pages').select('id', { count: 'exact', head: true })
        .or('content.ilike.%<!DOCTYPE%,content.ilike.%<html%,content.ilike.%```html%'),
      supabase.from('content_pages').select('id', { count: 'exact', head: true })
        .is('featured_image_url', null),
      supabase.from('content_pages').select('id', { count: 'exact', head: true })
        .is('author_id', null),
    ]);
    
    const healthStats = {
      totalPages: totalPages || 0,
      pagesWithWrapper: pagesWithWrapper || 0,
      pagesWithoutImages: pagesWithoutImages || 0,
      pagesWithoutAuthors: pagesWithoutAuthors || 0,
      cleanPages: (totalPages || 0) - (pagesWithWrapper || 0),
      healthScore: totalPages ? Math.round(((totalPages - (pagesWithWrapper || 0)) / totalPages) * 100) : 0,
    };
    
    // Log activity
    await supabase.from('activity_log').insert({
      action: 'content_cleaner_run',
      entity_type: 'content_pages',
      metadata: {
        scanned: results.scanned,
        cleaned: results.cleaned,
        authorsAssigned: results.authorsAssigned,
        dryRun,
        healthStats,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`Content Cleaner complete: ${results.cleaned} pages cleaned, ${results.authorsAssigned} authors assigned`);
    
    return new Response(JSON.stringify({
      success: true,
      dryRun,
      results,
      healthStats,
      message: dryRun 
        ? `Dry run: Would clean ${results.cleaned} pages` 
        : `Cleaned ${results.cleaned} pages, assigned ${results.authorsAssigned} authors`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Content Cleaner error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
