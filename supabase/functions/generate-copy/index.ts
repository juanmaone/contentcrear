// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

interface CopyOption {
  id: string
  text: string
  emoji_count: number
  viral_score: number
  style: string
  audience_target: string
}

interface GenerateCopyRequest {
  mainProduct: string
  businessName: string
  category: string
  whatsappOrPhone: string
  businessConfig: any
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
    console.log("[generate-copy] Auth Token:", authToken)
    console.log("[generate-copy] API Key Header:", apiKeyHeader)

    let body
    try {
      body = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: corsHeaders }
      )
    }
    const {
      mainProduct,
      businessName,
      category,
      whatsappOrPhone,
      businessConfig,
      model,
    } = body as GenerateCopyRequest

    if (!mainProduct || !businessName) {
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

    const address = businessConfig?.address || "our location"
    const contactText = whatsappOrPhone ? `Contact: ${whatsappOrPhone}` : "Contact us today"

    const copyResponse = await fetch(OPENROUTER_API_URL, {
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
            content: `Create 5 viral short-form video copy variations for a ${category} business.

Business: "${businessName}"
Product: "${mainProduct}"
Contact: "${contactText}"
Address: "${address}"

Generate 5 DIFFERENT copy options in JSON format (ONLY JSON, no extra text):
[
  {
    "id": "copy_1",
    "text": "Complete 1-2 sentence copy with emojis integrated naturally, CTA included",
    "emoji_count": 2,
    "viral_score": 8,
    "style": "urgent",
    "audience_target": "impulse buyers"
  },
  ...
]

Requirements:
- Each copy 1-2 sentences max (short for TikTok/Reels)
- Include 1-3 relevant emojis naturally integrated
- Include CTA (call to action) with contact info
- Target different audiences: impulse buyers, quality seekers, price hunters, trend followers, loyalty seekers
- Vary the emotional angle: urgency, exclusivity, curiosity, aspiration, social proof
- Viral scores 6-9 based on engagement potential
- Copy must be in SPANISH for Latin American audience
- Keep tone ${category === 'restaurante' ? 'appetizing and friendly' : category === 'peluquería' ? 'aspirational and chic' : category === 'gimnasio' ? 'energetic and motivational' : category === 'inmobiliaria' ? 'professional and elegant' : 'compelling and relevant'}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.85,
      }),
    })

    if (!copyResponse.ok) {
      const error = await copyResponse.text()
      console.error("OpenRouter API error:", error)
      return new Response(
        JSON.stringify({ error: "Copy generation failed" }),
        { status: 500, headers: corsHeaders }
      )
    }

    const copyData = await copyResponse.json()
    const copyText = copyData.choices[0]?.message?.content || ""

    // Parse JSON from response
    let copyOptions: CopyOption[] = []
    
    const jsonMatch = copyText.match(/\[[\s\S]*\]/g)
    if (jsonMatch) {
      try {
        copyOptions = JSON.parse(jsonMatch[0])
        copyOptions = copyOptions.slice(0, 5) // Ensure max 5
      } catch (e) {
        console.error("Failed to parse copy JSON:", e)
      }
    }

    // Fallback copy options
    if (copyOptions.length === 0) {
      copyOptions = [
        {
          id: "copy_1",
          text: `🔥 ${mainProduct} quality you deserve! Limited offers available now. ${whatsappOrPhone}`,
          emoji_count: 1,
          viral_score: 7,
          style: "urgency",
          audience_target: "impulse buyers",
        },
        {
          id: "copy_2",
          text: `✨ Discover why everyone in ${address} chooses ${businessName}. Experience the difference! Link in bio 👆`,
          emoji_count: 2,
          viral_score: 8,
          style: "aspiration",
          audience_target: "quality seekers",
        },
        {
          id: "copy_3",
          text: `💯 ${mainProduct} at prices you won't believe. Don't miss out! WhatsApp: ${whatsappOrPhone}`,
          emoji_count: 1,
          viral_score: 6,
          style: "value",
          audience_target: "price hunters",
        },
        {
          id: "copy_4",
          text: `🌟 Trending now! ${businessName}'s ${mainProduct} is taking ${category} by storm. Be part of the hype! 🚀`,
          emoji_count: 2,
          viral_score: 9,
          style: "trend",
          audience_target: "trend followers",
        },
        {
          id: "copy_5",
          text: `👑 Join ${businessName}'s family of happy customers. Your ${mainProduct} journey starts here. ${whatsappOrPhone} 💬`,
          emoji_count: 2,
          viral_score: 8,
          style: "community",
          audience_target: "loyalty seekers",
        },
      ]
    }

    return new Response(JSON.stringify(copyOptions), {
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
