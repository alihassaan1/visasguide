import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { authorId, authorName, authorRole } = await req.json();

    if (!authorId || !authorName) {
      throw new Error("authorId and authorName are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create a prompt for generating a professional headshot
    const prompt = `Professional headshot photo of a ${authorRole || "travel journalist"} named ${authorName}. 
The person should look friendly, approachable, and professional. 
High quality portrait photo with good lighting, neutral background, looking at camera with a warm smile.
Photorealistic, professional LinkedIn-style profile picture.
Ultra high resolution.`;

    console.log(`Generating avatar for author: ${authorName} (${authorId})`);

    // Generate image using Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", errorText);
      throw new Error(`Failed to generate image: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error("No image data in response:", JSON.stringify(data));
      throw new Error("No image generated");
    }

    console.log(`Image generated successfully for ${authorName}`);

    // Update author with the generated avatar URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from("authors")
      .update({ avatar_url: imageData })
      .eq("id", authorId);

    if (updateError) {
      console.error("Error updating author:", updateError);
      throw updateError;
    }

    console.log(`Avatar saved for author: ${authorName}`);

    return new Response(
      JSON.stringify({ success: true, avatarUrl: imageData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-author-avatar:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
