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
    const { jobId } = await req.json()

    // Validate input
    if (!jobId) {
      return new Response(JSON.stringify({ error: 'Job ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check status on Replicate
    const replicateResponse = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!replicateResponse.ok) {
      console.error('Replicate API error:', replicateResponse.statusText)
      return new Response(JSON.stringify({ error: 'Failed to check status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const prediction = await replicateResponse.json()

    // Parse status and extract video URL if available
    let status = 'processing'
    let videoUrl = null
    let error = null

    if (prediction.status === 'succeeded' && prediction.output) {
      status = 'succeeded'
      // Output can be a string URL or array of URLs
      videoUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
    } else if (prediction.status === 'failed') {
      status = 'failed'
      error = prediction.error || 'Video generation failed'
    } else if (prediction.status === 'processing' || prediction.status === 'starting') {
      status = 'processing'
    }

    // Return status
    return new Response(
      JSON.stringify({
        status,
        videoUrl,
        error,
        jobId,
        estimatedTimeRemaining: prediction.metrics?.predict_time || 120,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Check video status error:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
