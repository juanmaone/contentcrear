// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

interface StyleOption {
  id: string
  name: string
  description: string
  camera_movement: string
  music_tempo_bpm: number
  duration_seconds: number
  mood: string
  best_for: string
}

interface GenerateStylesRequest {
  mainProduct: string
  category: string
  ideaTitle: string
  model?: string
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
    console.log("[generate-styles] Auth Token:", authToken)
    console.log("[generate-styles] API Key Header:", apiKeyHeader)

    let body
    try {
      body = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: corsHeaders }
      )
    }
    const { mainProduct, category, ideaTitle, model } = body as GenerateStylesRequest

    if (!mainProduct || !category) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      )
    }

    const openrouterApiKey =
      Deno.env.get("OPENROUTER_API_KEY") ?? Deno.env.get("OPENAI_API_KEY")

    if (!openrouterApiKey) {
      return new Response(
        JSON.stringify({ error: "API configuration error" }),
        { status: 500, headers: corsHeaders }
      )
    }

    const defaultTextModel =
      Deno.env.get("OPENROUTER_TEXT_MODEL") ?? "openai/gpt-4o-mini"
    const openrouterSiteUrl =
      Deno.env.get("OPENROUTER_SITE_URL") ?? "http://localhost:5173"
    const openrouterAppName =
      Deno.env.get("OPENROUTER_APP_NAME") ?? "ContentCreator"

    const stylesResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openrouterApiKey}`,
        "HTTP-Referer": openrouterSiteUrl,
        "X-Title": openrouterAppName,
      },
      body: JSON.stringify({
        model: model || defaultTextModel,
        messages: [
          {
            role: "user",
            content: `Generate 4 different video style options for a short-form video in a ${category} business context.

Idea concept: "${ideaTitle}"
Product focus: "${mainProduct}"

Generate 4 DIFFERENT style options as JSON (ONLY JSON, no extra text):
[
  {
    "id": "style_1",
    "name": "Style Name",
    "description": "How the video looks visually",
    "camera_movement": "static/zoom/pan/dynamic",
    "music_tempo_bpm": 120,
    "duration_seconds": 15,
    "mood": "energetic/elegant/playful/professional",
    "best_for": "what type of viewer"
  },
  ...
]

Requirements:
- Vary camera movements and visual treatments
- BPM should match mood: energetic (140+), professional (100-120), playful (110-130), elegant (80-100)
- Duration: mix of 15s, 20s, 25s, 30s options
- Styles should be production-ready descriptions
- Consider ${category} audience preferences
- Include both fast-paced and smooth visual options
- must be in SPANISH for Latin American audience`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    })

    if (!stylesResponse.ok) {
      const error = await stylesResponse.text()
      console.error("OpenRouter API error:", error)
      return new Response(
        JSON.stringify({ error: "Styles generation failed" }),
        { status: 500, headers: corsHeaders }
      )
    }

    const stylesData = await stylesResponse.json()
    const stylesText = stylesData.choices[0]?.message?.content || ""

    // Parse JSON from response
    let styleOptions: StyleOption[] = []
    
    const jsonMatch = stylesText.match(/\[[\s\S]*\]/g)
    if (jsonMatch) {
      try {
        styleOptions = JSON.parse(jsonMatch[0])
        styleOptions = styleOptions.slice(0, 4) // Ensure max 4
      } catch (e) {
        console.error("Failed to parse styles JSON:", e)
      }
    }

    // Fallback style options
    if (styleOptions.length === 0) {
      styleOptions = [
        {
          id: "style_1",
          name: "Fast & Energetic",
          description: "Quick cuts with dynamic transitions, fast camera zooms, high-energy visual effects",
          camera_movement: "dynamic",
          music_tempo_bpm: 140,
          duration_seconds: 15,
          mood: "energetic",
          best_for: "Trend followers, young audience, fitness & fashion",
        },
        {
          id: "style_2",
          name: "Smooth & Professional",
          description: "Elegant slow pans, cinematic color grading, professional lighting, smooth transitions",
          camera_movement: "pan",
          music_tempo_bpm: 100,
          duration_seconds: 25,
          mood: "professional",
          best_for: "Premium brands, real estate, beauty & wellness",
        },
        {
          id: "style_3",
          name: "Playful & Fun",
          description: "Bright colors, fun jump cuts, stickers and emojis, upbeat visual effects",
          camera_movement: "zoom",
          music_tempo_bpm: 120,
          duration_seconds: 20,
          mood: "playful",
          best_for: "Restaurants, cafes, casual brands, younger demographic",
        },
        {
          id: "style_4",
          name: "Cinematic & Aspirational",
          description: "Deep focus cinematography, dramatic lighting, color-graded, inspiring composition",
          camera_movement: "static",
          music_tempo_bpm: 85,
          duration_seconds: 30,
          mood: "elegant",
          best_for: "Luxury goods, high-end services, real estate, fashion",
        },
      ]
    }

    return new Response(JSON.stringify(styleOptions), {
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
