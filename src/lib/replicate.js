/**
 * replicate.js
 * Supabase Edge Function wrapper for Replicate video generation
 * Handles job submission, polling, and status tracking
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Video models available on Replicate
 */
export const VIDEO_MODELS = {
  LUMA_RAY_2: 'luma-ray-2',
  KLING_1_6: 'kling-1.6',
  RUNWAY_GEN_3: 'runway-gen-3',
  PIKA_2_1: 'pika-2.1',
}

/**
 * Get human-readable model name
 */
export function getModelName(modelId) {
  const names = {
    'luma-ray-2': 'Luma Ray 2',
    'kling-1.6': 'Kling 1.6',
    'runway-gen-3': 'Runway Gen-3',
    'pika-2.1': 'Pika 2.1',
  }
  return names[modelId] || 'Unknown Model'
}

/**
 * Submit a video generation job to Replicate via Edge Function
 * Returns job_id for polling
 *
 * @param {Object} config - Generation configuration
 * @param {string} config.videoModel - Model ID (see VIDEO_MODELS)
 * @param {string} config.prompt - Detailed prompt for video generation
 * @param {number} config.duration - Video duration in seconds (8-60)
 * @param {string} config.aspectRatio - Aspect ratio: "16:9" or "9:16"
 * @param {Object} config.metadata - Additional metadata for tracking
 * @returns {Promise<string>} Job ID for polling
 */
export async function submitVideoJob(config) {
  if (!config.videoModel || !config.prompt) {
    throw new Error('Missing required parameters: videoModel, prompt')
  }

  if (config.duration < 8 || config.duration > 60) {
    throw new Error('Duration must be between 8 and 60 seconds')
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-video-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        videoModel: config.videoModel,
        prompt: config.prompt,
        duration: config.duration,
        aspectRatio: config.aspectRatio || '16:9',
        metadata: config.metadata || {},
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit video job')
    }

    const data = await response.json()
    return data.jobId
  } catch (error) {
    console.error('Video job submission error:', error)
    throw error
  }
}

/**
 * Poll for video generation status
 * Returns status and URL when complete
 *
 * @param {string} jobId - Job ID returned from submitVideoJob
 * @param {number} maxAttempts - Maximum polling attempts (default: 60 = 5 minutes at 5s intervals)
 * @returns {Promise<Object>} Status object with status and videoUrl
 */
export async function pollVideoStatus(jobId, maxAttempts = 60) {
  if (!jobId) {
    throw new Error('Job ID required')
  }

  let attempts = 0

  return new Promise((resolve, reject) => {
    const pollInterval = setInterval(async () => {
      attempts++

      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/check-video-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ jobId }),
        })

        if (!response.ok) {
          throw new Error('Failed to check status')
        }

        const data = await response.json()

        // Check if complete
        if (data.status === 'succeeded') {
          clearInterval(pollInterval)
          resolve({
            status: 'succeeded',
            videoUrl: data.videoUrl,
            jobId,
          })
        } else if (data.status === 'failed') {
          clearInterval(pollInterval)
          reject(new Error(data.error || 'Video generation failed'))
        }

        // Max attempts reached
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          reject(new Error('Video generation timeout'))
        }
      } catch (error) {
        clearInterval(pollInterval)
        reject(error)
      }
    }, 5000) // Poll every 5 seconds
  })
}

/**
 * Build a detailed prompt for Replicate from generation data
 * Combines idea, copy, style, and product info
 */
export function buildVideoPrompt(generation) {
  const {
    selectedIdea,
    selectedCopy,
    selectedStyle,
    analysisResults,
    selectedVoice,
    businessConfig,
  } = generation

  if (!selectedIdea || !selectedCopy || !selectedStyle) {
    throw new Error('Missing required generation data')
  }

  const mainProduct = analysisResults?.[0]?.main_product || 'producto'
  const emotion = analysisResults?.[0]?.emotion_style || 'profesional'

  let prompt = `
Create a professional short-form video (15-30 seconds) for a ${businessConfig?.category || 'business'} business.

## Product/Service
- Main product: ${mainProduct}
- Business: ${businessConfig?.business_name || 'Business'}

## Video Concept
- Idea: ${selectedIdea.title}
- Description: ${selectedIdea.description}
- Why viral: ${selectedIdea.why_viral}

## Content
- Message: "${selectedCopy.text}"
- Tone: ${selectedCopy.style || 'professional'}
- Target audience: ${selectedCopy.audience_target || 'general'}

## Visual Style
- Style name: ${selectedStyle.name}
- Description: ${selectedStyle.description}
- Camera movement: ${selectedStyle.camera_movement || 'smooth'}
- Mood: ${selectedStyle.mood || emotion}
- Music tempo: ${selectedStyle.music_tempo_bpm || 120} BPM

## Production Notes
- Duration: ${selectedStyle.duration_seconds || 15} seconds
- Aspect ratio: 16:9 (mobile-optimized)
- Include product shots, lifestyle imagery, and clear call-to-action
- Professional lighting and color grading
- Smooth transitions between scenes
- Suggested music style: ${['energetic', 'upbeat', 'calm', 'ambient'].includes(selectedStyle.mood?.toLowerCase()) ? selectedStyle.mood : 'modern upbeat'}

${selectedVoice && selectedVoice.id !== 'none' ? `- Voice-over: ${selectedVoice.name} (${selectedVoice.accent} accent)` : '- No voice-over, music-driven'}

Generate a compelling, professional video that drives engagement and conversions.
  `

  return prompt.trim()
}

/**
 * Create a video generation request to save in database
 * Used before submitting to Replicate
 */
export function createGenerationRequest(generation) {
  return {
    title: `${generation.selectedIdea.title} - ${generation.businessConfig.business_name}`,
    description: generation.selectedCopy.text,
    category: generation.businessConfig.category,
    videoModel: generation.selectedIdea.recommended_model || VIDEO_MODELS.LUMA_RAY_2,
    prompt: buildVideoPrompt(generation),
    metadata: {
      ideaId: generation.selectedIdea.id,
      copyId: generation.selectedCopy.id,
      styleId: generation.selectedStyle.id,
      voiceId: generation.selectedVoice?.id || 'none',
      analysisScore: generation.analysisResults?.[0]?.viral_potential_score || 0,
    },
  }
}

/**
 * Helper to format time remaining
 */
export function formatTimeRemaining(seconds) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes}m`
}

/**
 * Get estimated duration based on model
 */
export function getEstimatedDuration(modelId) {
  const estimates = {
    'luma-ray-2': 120, // 2 minutes
    'kling-1.6': 90, // 1.5 minutes
    'runway-gen-3': 60, // 1 minute
    'pika-2.1': 45, // 45 seconds
  }
  return estimates[modelId] || 120
}
