// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS Pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    const API_KEY = Deno.env.get('GEMINI_API_KEY')

    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in your .env file");
    }

    console.log("Generating Imagen 4 Fast image for:", prompt);

    // IMAGEN 4 FAST PREDICT ENDPOINT
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [
            { 
              prompt: `A high-end, appetizing food photograph of ${prompt}. Professional studio lighting, macro lens, 8k resolution, blurred restaurant background.` 
            }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            outputMimeType: "image/png"
          }
        }),
      }
    )

    const data = await response.json()

    // Handle Google errors (like billing not enabled or quota)
    if (data.error) {
      console.error("GOOGLE API ERROR:", JSON.stringify(data));
      throw new Error(data.error.message || "Google API error occurred.");
    }

    // Imagen returns data in predictions[0].bytesBase64Encoded
    const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded;

    if (imageBase64) {
      console.log("Success! Image generated.");
      return new Response(
        JSON.stringify({ image: `data:image/png;base64,${imageBase64}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    } else {
      console.error("Unexpected structure:", JSON.stringify(data));
      throw new Error("Model succeeded but returned no image data.");
    }

  } catch (error) {
    console.error("FUNCTION ERROR:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})