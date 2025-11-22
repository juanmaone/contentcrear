// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

interface ViralIdea {
  id: string
  title: string
  description: string
  why_viral: string
  cta_template: string
  estimated_duration_seconds: number
  recommended_model: string
}

interface GenerateIdeasRequest {
  category: string
  analysisData: any[]
  businessName: string
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
    console.log("[generate-ideas] Auth Token:", authToken)
    console.log("[generate-ideas] API Key Header:", apiKeyHeader)

    let body
    try {
      body = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: corsHeaders }
      )
    }
    const { category, analysisData, businessName, model } = body as GenerateIdeasRequest

    if (!analysisData || analysisData.length === 0) {
      return new Response(
        JSON.stringify({ error: "No analysis data provided" }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Get OpenRouter API key
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

    const mainProduct = analysisData[0]?.main_product || "our product"
    const emotion = analysisData[0]?.emotion_style || "modern"

    const ideasResponse = await fetch(OPENROUTER_API_URL, {
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
            content: `Generate 6 viral content ideas for a ${category} business called "${businessName}" featuring "${mainProduct}" with ${emotion} vibe.

Each idea should be a complete JSON object in this format (respond ONLY with JSON array, no extra text):
[
  {
    "id": "idea_1",
    "title": "Short catchy title",
    "description": "2-3 sentence description of the video concept",
    "why_viral": "Why this idea would get engagement (use psychology/trend)",
    "cta_template": "Call-to-action text with {{contact}} placeholder",
    "estimated_duration_seconds": 15,
    "recommended_model": "Kling 1.6"
  },
  ...
]

Categories of ideas to explore: trending sounds, before-after transformations, testimonials, behind-the-scenes, quick tips, comparison videos.
Models available: Luma Ray 2, Kling 1.6, Runway Gen-3, Pika 2.1.
Keep ideas specific to ${category} industry best practices.
must be in SPANISH for Latin American audience`,
          },
        ],
        max_tokens: 3000,
        temperature: 0.8,
      }),
    })

    if (!ideasResponse.ok) {
      const error = await ideasResponse.text()
      console.error("OpenRouter API error:", error)
      return new Response(
        JSON.stringify({ error: "Ideas generation failed" }),
        { status: 500, headers: corsHeaders }
      )
    }

    const ideasData = await ideasResponse.json()
    const ideasText = ideasData.choices[0]?.message?.content || ""

    // Parse JSON from response
    let viralIdeas: ViralIdea[] = []
    
    const jsonMatch = ideasText.match(/\[[\s\S]*\]/g)
    if (jsonMatch) {
      try {
        viralIdeas = JSON.parse(jsonMatch[0])
        // Ensure we have exactly 6 ideas
        viralIdeas = viralIdeas.slice(0, 6)
      } catch (e) {
        console.error("Failed to parse ideas JSON:", e)
      }
    }

    // Fallback ideas if parsing failed
    if (viralIdeas.length === 0) {
      viralIdeas = [
        {
          id: "idea_1",
          title: "Product Showcase Reel",
          description: "Quick 15-second video showcasing your best product feature in action with trending audio",
          why_viral: "Direct product focus with high watch-through rate",
          cta_template: "Shop now at {{website}} or WhatsApp {{whatsapp}}",
          estimated_duration_seconds: 15,
          recommended_model: "Kling 1.6",
        },
        {
          id: "idea_2",
          title: "Before & After Transformation",
          description: "Show dramatic transformation with product - popular for beauty, fitness, and services",
          why_viral: "Transformation videos get 3x more engagement on Instagram",
          cta_template: "Get your transformation! Click link in bio or call {{phone}}",
          estimated_duration_seconds: 30,
          recommended_model: "Luma Ray 2",
        },
        {
          id: "idea_3",
          title: "Quick Tips & Hacks",
          description: "3-4 pro tips delivered rapidly with jump cuts - perfect for establishing expertise",
          why_viral: "Educational content with high shareability",
          cta_template: "Learn more in our stories or visit {{website}}",
          estimated_duration_seconds: 20,
          recommended_model: "Runway Gen-3",
        },
        {
          id: "idea_4",
          title: "Customer Testimonial",
          description: "Real or animated testimonial showing customer satisfaction and results",
          why_viral: "Social proof is the #1 conversion driver on social media",
          cta_template: "Join {{business_name}} satisfied customers - {{whatsapp}}",
          estimated_duration_seconds: 25,
          recommended_model: "Pika 2.1",
        },
        {
          id: "idea_5",
          title: "Behind the Scenes",
          description: "Show your process, team, or production - builds community connection",
          why_viral: "Authenticity resonates with modern audiences",
          cta_template: "See more behind-the-scenes in our stories {{instagram}}",
          estimated_duration_seconds: 30,
          recommended_model: "Luma Ray 2",
        },
        {
          id: "idea_6",
          title: "Trending Sound Trend",
          description: "Adapt current trending audio to your product in unique way",
          why_viral: "Trending sounds guarantee algorithm boost on Instagram & TikTok",
          cta_template: "Available now! Link in bio {{website}}",
          estimated_duration_seconds: 15,
          recommended_model: "Kling 1.6",
        },
      ]
    }

    return new Response(JSON.stringify(viralIdeas), {
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
