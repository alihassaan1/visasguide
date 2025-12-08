import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageRequest {
  title: string;
  contentType: string;
  baseImageUrl?: string;
  generateWithAI?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ImageRequest = await req.json();
    const { title, contentType, baseImageUrl, generateWithAI = false } = body;

    console.log(`Generating social image for: ${title}`);

    // If AI generation is requested
    if (generateWithAI) {
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      
      if (lovableApiKey) {
        try {
          const prompt = `Create a professional social media image (1080x1080 square) for a visa/travel article titled "${title}". 
Include:
- Clean, modern design
- Travel/passport themed visuals
- Professional color scheme (blues, whites)
- Subtle "visas.guide" branding in corner
- High quality, Instagram-ready aesthetic
Ultra high resolution.`;

          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image-preview',
              messages: [{ role: 'user', content: prompt }],
              modalities: ['image', 'text'],
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            
            if (imageUrl) {
              // In production, you'd upload this to Supabase Storage
              // For now, return the base64 data URL
              console.log('AI image generated successfully');
              
              return new Response(
                JSON.stringify({
                  success: true,
                  imageUrl,
                  method: 'ai_generated',
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        } catch (aiError) {
          console.error('AI image generation failed:', aiError);
          // Fall through to use base image
        }
      }
    }

    // If base image provided, return it (with future branding overlay option)
    if (baseImageUrl) {
      // In production, you could add branding overlay using canvas
      // For now, just return the original image
      return new Response(
        JSON.stringify({
          success: true,
          imageUrl: baseImageUrl,
          method: 'featured_image',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return a placeholder branded image based on content type
    const placeholderImages: Record<string, string> = {
      blog: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1080&h=1080&fit=crop',
      country_guide: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&h=1080&fit=crop',
      visa_requirements: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1080&h=1080&fit=crop',
      news: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&h=1080&fit=crop',
      infographic: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&h=1080&fit=crop',
    };

    const imageUrl = placeholderImages[contentType] || placeholderImages.blog;

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        method: 'placeholder',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Image generator error:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});