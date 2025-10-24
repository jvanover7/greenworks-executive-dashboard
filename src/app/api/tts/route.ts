import { NextRequest } from 'next/server'
import * as elevenlabs from '@/lib/connectors/elevenlabs'

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json()

    if (!text) {
      return new Response('Invalid request: text required', { status: 400 })
    }

    const stream = await elevenlabs.ttsStream(text, voiceId)

    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('TTS API error:', error)
    return new Response(JSON.stringify({ error: 'TTS service error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
