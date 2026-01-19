// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS Pre-flight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dishName } = await req.json();
    
    if (!dishName || typeof dishName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid dishName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PASSTHROUGH LOGIC:
    // Since the image generator needs a prompt, we just pass the dishName 
    // straight through. This bypasses the 401 Lovable API error.
    console.log('Bypassing translation for:', dishName);

    const translatedDish = dishName;
    
    console.log('Passthrough result:', translatedDish);

    return new Response(
      JSON.stringify({ translatedDish }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in translate-dish function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Translation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});