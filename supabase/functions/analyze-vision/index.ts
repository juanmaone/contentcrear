import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

interface AnalysisRequest {
  imageUrls: string[]
  category: string
  businessName: string
}

interface AnalysisResult {
  main_product: string
  detected_objects: string[]
  colors: string[]
  emotion_style: string
  viral_potential_score: number
  suggested_trends: string[]
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { imageUrls, category, businessName } = (await req.json()) as AnalysisRequest

    if (!imageUrls || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: "No images provided" }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiApiKey) {
      console.error("Missing OPENAI_API_KEY environment variable")
      return new Response(
        JSON.stringify({ error: "API configuration error" }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Build Vision API request with all images
    const content = [
      {
        type: "text",
        text: `You are an expert AI that analyzes product images for Latin American small businesses to help them create viral content.

Analyze the provided image(s) for a ${category} business called "${businessName}". 

For each main product visible, provide a JSON response with this exact structure:
{
  "main_product": "name of the main product/service visible",
  "detected_objects": ["list of 3-5 key objects/elements in the image"],
  "colors": ["list of 2-3 dominant colors that are visually appealing"],
  "emotion_style": "one word describing the mood (e.g., luxurious, playful, elegant, energetic)",
  "viral_potential_score": number between 0-10,
  "suggested_trends": ["2-3 trending content formats that would work well with this product"]
}

Respond ONLY with valid JSON, no additional text.`,
      },
      ...imageUrls.map((url) => ({
        type: "image_url",
        image_url: { url },
      })),
    ]

    // Call OpenAI Vision API
    const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!visionResponse.ok) {
      const error = await visionResponse.text()
      console.error("OpenAI API error:", error)
      return new Response(
        JSON.stringify({ error: "Vision analysis failed" }),
        { status: 500, headers: corsHeaders }
      )
    }

    const visionData = await visionResponse.json()
    const analysisText = visionData.choices[0]?.message?.content || ""

    // Parse the JSON response from Vision API
    let analysisResults: AnalysisResult[] = []
    
    // Try to extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/g)
    if (jsonMatch) {
      for (const json of jsonMatch) {
        try {
          const parsed = JSON.parse(json)
          analysisResults.push(parsed)
        } catch (e) {
          console.error("Failed to parse JSON:", json)
        }
      }
    }

    // If no results were parsed, create a fallback
    if (analysisResults.length === 0) {
      analysisResults = [
        {
          main_product: `${businessName}'s main offering`,
          detected_objects: ["product", "presentation", "quality"],
          colors: ["professional", "modern"],
          emotion_style: "professional",
          viral_potential_score: 7,
          suggested_trends: ["product showcase", "before-after", "testimonial"],
        },
      ]
    }

    return new Response(JSON.stringify(analysisResults), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Edge function error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    )
  }
})
