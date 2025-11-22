import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY

let elevenLabsClient = null

if (ELEVENLABS_API_KEY) {
  elevenLabsClient = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY })
} else {
  console.warn('VITE_ELEVENLABS_API_KEY is not defined. Voice synthesis is disabled.')
}

/**
 * Generate speech audio from text using ElevenLabs
 * @param {Object} params
 * @param {string} params.text - Text to convert
 * @param {string} params.voiceId - ElevenLabs voice ID (required)
 * @param {string} [params.modelId='eleven_turbo_v2'] - Model identifier
 * @param {Object} [params.voiceSettings] - Optional voice settings override
 * @returns {Promise<{ blob: Blob, arrayBuffer: ArrayBuffer, objectUrl: string | null }>} audio artifacts
 */
export const synthesizeVoiceFromText = async ({
  text,
  voiceId,
  modelId = 'eleven_turbo_v2',
  voiceSettings,
}) => {
  if (!elevenLabsClient) {
    throw new Error('ElevenLabs client not initialized. Check VITE_ELEVENLABS_API_KEY.')
  }

  if (!text || !text.trim()) {
    throw new Error('Text is required to synthesize audio')
  }

  if (!voiceId) {
    throw new Error('voiceId is required to synthesize audio')
  }

  const response = await elevenLabsClient.textToSpeech.convert(voiceId, {
    model_id: modelId,
    text,
    voice_settings:
      voiceSettings ?? {
        stability: 0.4,
        similarity_boost: 0.85,
        style: 0.35,
        use_speaker_boost: true,
      },
    output_format: 'mp3_44100_128',
  })

  const arrayBuffer = await response.arrayBuffer()
  const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
  const objectUrl =
    typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
      ? URL.createObjectURL(blob)
      : null

  return {
    blob,
    arrayBuffer,
    objectUrl,
  }
}

/**
 * Convenience helper to trigger a preview audio URL directly
 */
export const getSpeechPreviewUrl = async (options) => {
  const { objectUrl } = await synthesizeVoiceFromText(options)
  return objectUrl
}
