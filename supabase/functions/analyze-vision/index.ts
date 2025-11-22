// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

interface AnalysisRequest {
  imageUrls: string[]
  category: string
  businessName: string
  model?: string
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

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    )
  }

  try {
    const authToken = req.headers.get("authorization")
    const apiKeyHeader = req.headers.get("apikey")
    console.log("[analyze-vision] Auth Token:", authToken)
    console.log("[analyze-vision] API Key Header:", apiKeyHeader)

    let body
    try {
      body = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: corsHeaders }
      )
    }
    const { imageUrls, category, businessName, model } = body as AnalysisRequest

    const defaultVisionModel =
      Deno.env.get("OPENROUTER_VISION_MODEL") ?? "openai/gpt-4o-mini"
    const openrouterSiteUrl =
      Deno.env.get("OPENROUTER_SITE_URL") ?? "http://localhost:5173"
    const openrouterAppName =
      Deno.env.get("OPENROUTER_APP_NAME") ?? "ContentCreator"

    if (!imageUrls || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: "No images provided" }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Get OpenRouter API key from environment
    const openrouterApiKey =
      Deno.env.get("OPENROUTER_API_KEY") ?? Deno.env.get("OPENAI_API_KEY")

    if (!openrouterApiKey) {
      console.error("Missing OPENROUTER_API_KEY environment variable")
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

    const visionResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openrouterApiKey}`,
        "HTTP-Referer": openrouterSiteUrl,
        "X-Title": openrouterAppName,
      },
      body: JSON.stringify({
        model: model || defaultVisionModel,
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
      const errorText = await visionResponse.text()
      console.error("OpenRouter API error status:", visionResponse.status)
      console.error("OpenRouter API error:", errorText)
      
      try {
        const errorJson = JSON.parse(errorText)
        console.error("OpenRouter error details:", errorJson)
      } catch (e) {
        // Not JSON, just log as text
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Vision analysis failed",
          details: errorText 
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    let visionData
    try {
      visionData = await visionResponse.json()
    } catch (e) {
      console.error("Failed to parse vision response:", e)
      return new Response(
        JSON.stringify({ error: "Failed to parse vision response" }),
        { status: 500, headers: corsHeaders }
      )
    }
    
    const analysisText = visionData.choices[0]?.message?.content || ""
    console.log("Vision API response received, content length:", analysisText.length)

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
