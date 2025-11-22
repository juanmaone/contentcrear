/**
 * AI calls (via OpenRouter) are handled by Supabase Edge Functions
 * This keeps API keys secure and prevents client-side exposure
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Analyze images with GPT-4o Vision via Supabase Edge Function
 * Keeps API keys secure on the server
 */
export const analyzeImagesWithVision = async (
  imageUrls,
  category = 'restaurant',
  businessName = 'Business',
  options = {}
) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-vision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        imageUrls,
        category,
        businessName,
        ...(options.model ? { model: options.model } : {}),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Vision analysis failed')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Vision analysis error:', error)
    throw error
  }
}

/**
 * Generate viral idea cards dynamically via Edge Function
 */
export const generateViralIdeas = async (
  businessCategory,
  analysisData,
  businessName,
  options = {}
) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        category: businessCategory,
        analysisData,
        businessName,
        ...(options.model ? { model: options.model } : {}),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Idea generation failed')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Idea generation error:', error)
    throw error
  }
}

/**
 * Generate copy options via Edge Function
 */
export const generateCopyOptions = async (
  mainProduct,
  businessName,
  businessCategory,
  whatsapp,
  businessConfig,
  options = {}
) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        mainProduct,
        businessName,
        category: businessCategory,
        whatsappOrPhone: whatsapp,
        businessConfig,
        ...(options.model ? { model: options.model } : {}),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Copy generation failed')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Copy generation error:', error)
    throw error
  }
}

/**
 * Generate video style suggestions via Edge Function
 */
export const generateVideoStyles = async (
  mainProduct,
  businessCategory,
  ideaTitle,
  options = {}
) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-styles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        mainProduct,
        category: businessCategory,
        ideaTitle,
        ...(options.model ? { model: options.model } : {}),
      }),
    })

    if (!response.ok) {
      return getDefaultVideoStyles()
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Style generation error:', error)
    return getDefaultVideoStyles()
  }
}

const getDefaultVideoStyles = () => [
  {
    id: 'style_1',
    name: 'ASMR Close-up',
    description: 'Sonido crujiente + primer plano del producto',
    duration_seconds: 12,
    camera_movement: 'zoom lento',
    music_tempo_bpm: 100,
    music_mood: 'relajante',
  },
  {
    id: 'style_2',
    name: 'Cinematic Zoom',
    description: 'Zoom dramático con transiciones suaves',
    duration_seconds: 15,
    camera_movement: 'zoom rápido',
    music_tempo_bpm: 128,
    music_mood: 'épico',
  },
  {
    id: 'style_3',
    name: 'Split Screen',
    description: 'Antes/después o comparación lado a lado',
    duration_seconds: 10,
    camera_movement: 'estático',
    music_tempo_bpm: 120,
    music_mood: 'moderno',
  },
  {
    id: 'style_4',
    name: 'Montage Rápido',
    description: 'Secuencias rápidas con transiciones dinámicas',
    duration_seconds: 12,
    camera_movement: 'cortes rápidos',
    music_tempo_bpm: 140,
    music_mood: 'energético',
  },
]
