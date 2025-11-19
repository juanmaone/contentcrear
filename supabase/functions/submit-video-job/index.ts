import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')

if (!REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN environment variable not set')
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { videoModel, prompt, duration, aspectRatio, metadata } = await req.json()

    // Validate input
    if (!videoModel || !prompt || !duration) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Map model names to Replicate model identifiers
    const modelMap: Record<string, string> = {
      'luma-ray-2': 'luma-ai/luma-ray:7a5d5d0c7311ce92274f1c0a47e50d25b0c24ccc5ab668c4dc4a37137d891576',
      'kling-1.6': 'kling-ai/kling-video:5f17ad896a8f6e6aa107e2c0c47d01e5e8e9d0d9c1d3d0c5f8c9a8f7e6d5c4b',
      'runway-gen-3': 'runwayml/gen-3:5b5e8f8f4f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f',
      'pika-2.1': 'pika-labs/pika:5b5e8f8f4f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f',
    }

    const modelId = modelMap[videoModel as string] || modelMap['luma-ray-2']

    // Submit to Replicate
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelId,
        input: {
          prompt,
          duration: Math.min(Math.max(duration, 8), 60),
          aspect_ratio: aspectRatio || '16:9',
        },
      }),
    })

    if (!replicateResponse.ok) {
      const error = await replicateResponse.json()
      console.error('Replicate API error:', error)
      return new Response(JSON.stringify({ error: 'Failed to submit video job' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const prediction = await replicateResponse.json()

    // Return job ID (prediction ID)
    return new Response(JSON.stringify({ jobId: prediction.id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Submit video job error:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
