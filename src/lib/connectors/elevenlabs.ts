interface ElevenLabsConfig {
  baseUrl: string
  apiKey: string
  voiceId: string
}

function getConfig(): ElevenLabsConfig {
  const baseUrl = 'https://api.elevenlabs.io'
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM' // Default: Rachel

  if (!apiKey) {
    throw new Error('Missing ElevenLabs credentials: ELEVENLABS_API_KEY required')
  }

  return { baseUrl, apiKey, voiceId }
}

export async function ttsStream(text: string, voiceId?: string): Promise<ReadableStream> {
  const config = getConfig()
  const targetVoiceId = voiceId || config.voiceId

  const response = await fetch(`${config.baseUrl}/v1/text-to-speech/${targetVoiceId}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': config.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('ElevenLabs API returned no body')
  }

  return response.body
}

export async function listVoices(): Promise<any[]> {
  const config = getConfig()

  const response = await fetch(`${config.baseUrl}/v1/voices`, {
    headers: {
      'xi-api-key': config.apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.voices || []
}
