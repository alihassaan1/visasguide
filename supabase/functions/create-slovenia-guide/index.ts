import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sloveniaContent = `<div class="space-y-8">
    <section>
      <h2 class="text-3xl font-bold mb-4">About Slovenia</h2>
      <p class="text-lg leading-relaxed">Slovenia is a Schengen member known for its mountains, lakes, and medieval towns. Tourists come for Lake Bled, the Julian Alps, and Ljubljana's old town. It's one of the safest and cleanest countries in Europe, making it a popular summer and winter destination.</p>
    </section>

    <section>
      <h2 class="text-3xl font-bold mb-6">Available Visa Types for Slovenia</h2>
      
      <div class="space-y-6">
        <div class="pl-6">
          <h3 class="text-2xl font-bold mb-3">Tourist Visa (Schengen Short Stay – Type C)</h3>
          <p class="mb-4">Allows stays up to 90 days within 180 days. Typical uses: tourism, family visits, short business trips.</p>
          
          <h4 class="text-xl font-semibold mb-3">Requirements:</h4>
          <ul class="list-disc pl-6 space-y-2 mb-4">
            <li>Valid passport (issued in last 10 years)</li>
            <li>Travel insurance with €30,000 minimum coverage</li>
            <li>Round-trip ticket</li>
            <li>Hotel booking</li>
            <li>Bank statements (last 3–6 months)</li>
            <li>Invitation letter (optional)</li>
          </ul>
          
          <div class="bg-muted p-4 rounded-lg">
            <p><strong>Processing time:</strong> 10–15 working days</p>
            <p><strong>Fee:</strong> €80 for adults</p>
          </div>
        </div>

        <div class="pl-6">
          <h3 class="text-2xl font-bold mb-3">Business Visa</h3>
          <p class="mb-4">For meetings, conferences, trade events. Requirements are similar to tourist visa, with company invitation letter.</p>
        </div>

        <div class="pl-6">
          <h3 class="text-2xl font-bold mb-3">Student Visa</h3>
          <p class="mb-4">Required for study periods under 90 days (short-term). Longer programs require a national D visa + residence permit.</p>
        </div>

        <div class="pl-6">
          <h3 class="text-2xl font-bold mb-3">Work Visa</h3>
          <p class="mb-4">You need:</p>
          <ul class="list-disc pl-6 space-y-2 mb-4">
            <li>A confirmed job contract</li>
            <li>Employer sponsorship</li>
            <li>Health insurance</li>
            <li>Background documents</li>
          </ul>
          <p class="text-sm text-muted-foreground">This is usually part of a single permit (residence + work authorization).</p>
        </div>

        <div class="pl-6">
          <h3 class="text-2xl font-bold mb-3">Transit Visa</h3>
          <p>Required for some nationalities when connecting flights in the Schengen area.</p>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-3xl font-bold mb-6">Entry Requirements for All Visitors</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li>Passport valid for at least 3 months beyond departure</li>
        <li>Minimum funds: approx. €70 per day</li>
        <li>Proof of accommodation for the whole stay</li>
        <li>Return/onward ticket</li>
        <li>Travel insurance accepted in Schengen area</li>
      </ul>
    </section>

    <section>
      <h2 class="text-3xl font-bold mb-6">Who Doesn't Need a Visa for Slovenia?</h2>
      <div class="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
        <h3 class="text-xl font-semibold mb-4">Nationals of:</h3>
        <ul class="list-disc pl-6 space-y-2 mb-4">
          <li>EU/EEA countries</li>
          <li>Visa-exempt Schengen list (US, UAE, Malaysia, etc.)</li>
        </ul>
        
        <h3 class="text-xl font-semibold mb-4">Travelers with:</h3>
        <ul class="list-disc pl-6 space-y-2">
          <li>Valid multiple-entry Schengen visa</li>
          <li>Schengen residence permit</li>
        </ul>
      </div>
    </section>

    <section>
      <h2 class="text-3xl font-bold mb-6">How to Apply for a Slovenia Visa (Step-by-Step)</h2>
      <ol class="list-decimal pl-6 space-y-3">
        <li class="text-lg">Complete the Schengen visa form online</li>
        <li class="text-lg">Collect documents</li>
        <li class="text-lg">Book an appointment at VFS/Embassy</li>
        <li class="text-lg">Submit biometrics</li>
        <li class="text-lg">Pay the fee</li>
        <li class="text-lg">Wait for processing</li>
        <li class="text-lg">Collect your passport or receive decision by courier</li>
      </ol>
    </section>

    <section>
      <h2 class="text-3xl font-bold mb-4">Visa Processing Time</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-muted p-4 rounded-lg">
          <p class="font-semibold">Standard:</p>
          <p class="text-2xl font-bold text-primary">10–15 days</p>
        </div>
        <div class="bg-muted p-4 rounded-lg">
          <p class="font-semibold">Peak season:</p>
          <p class="text-2xl font-bold text-orange-600">30–45 days</p>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
      <div class="space-y-6">
        <div class="border-b pb-4">
          <h3 class="text-xl font-semibold mb-2">How long can I stay in Slovenia with a Schengen visa?</h3>
          <p class="text-muted-foreground">Up to 90 days within a 180-day period.</p>
        </div>
        <div class="border-b pb-4">
          <h3 class="text-xl font-semibold mb-2">Can I extend my visa?</h3>
          <p class="text-muted-foreground">Only in exceptional cases, such as emergencies.</p>
        </div>
        <div class="border-b pb-4">
          <h3 class="text-xl font-semibold mb-2">Is travel insurance mandatory?</h3>
          <p class="text-muted-foreground">Yes. Minimum €30,000 coverage.</p>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-3xl font-bold mb-6">Travel Tips for Slovenia</h2>
      <ul class="grid md:grid-cols-2 gap-4">
        <li class="flex items-start gap-3">
          <span class="text-primary text-xl">•</span>
          <span><strong>Best time to visit:</strong> May–September</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-primary text-xl">•</span>
          <span><strong>Currency:</strong> EUR - ATMs widely available</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-primary text-xl">•</span>
          <span><strong>Transport:</strong> Public transport is reliable</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-primary text-xl">•</span>
          <span><strong>SIM cards:</strong> Available at Telecom Slovenia, A1, Telemach</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-primary text-xl">•</span>
          <span><strong>Water:</strong> Tap water is safe to drink everywhere</span>
        </li>
      </ul>
    </section>
  </div>`;

    // Check if guide already exists
    const { data: existing } = await supabase
      .from('content_pages')
      .select('id')
      .eq('slug', 'countries/slovenia')
      .maybeSingle();

    if (existing) {
      // Update existing guide
      const { error: updateError } = await supabase
        .from('content_pages')
        .update({
          content: sloveniaContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ message: 'Slovenia guide updated successfully', id: existing.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new guide
    const { data: newGuide, error: insertError } = await supabase
      .from('content_pages')
      .insert({
        slug: 'countries/slovenia',
        title: 'Slovenia Travel & Visa Guide 2025',
        content: sloveniaContent,
        excerpt: 'Complete guide to Slovenia visa requirements, types, and application process. Learn about tourist, business, student, and work visas for Slovenia, including processing times and entry requirements.',
        meta_title: 'Slovenia Visa Guide 2025 – Requirements & Application | Visas.Guide',
        meta_description: 'Complete Slovenia visa requirements guide for 2025. Tourist, business, student, and work visa information, processing times, fees, and step-by-step application process for Slovenia Schengen visas.',
        keywords: ['slovenia visa', 'slovenia visa requirements', 'schengen visa slovenia', 'slovenia tourist visa', 'slovenia business visa', 'slovenia student visa', 'slovenia work visa', 'slovenia visa application', 'slovenia visa processing time', 'slovenia travel guide'],
        is_published: true,
        status: 'published',
        ai_generated: false
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ message: 'Slovenia guide created successfully', id: newGuide.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
