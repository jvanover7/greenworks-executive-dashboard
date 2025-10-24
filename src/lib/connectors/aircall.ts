interface AircallConfig {
  baseUrl: string
  apiId: string
  apiToken: string
}

interface AircallCall {
  id: string
  direction: 'inbound' | 'outbound'
  from: string
  to: string
  user?: { id: string }
  started_at: number
  ended_at?: number
  duration?: number
  status: string
  recording?: string
  [key: string]: any
}

interface AircallMessage {
  id: string
  direction: 'inbound' | 'outbound'
  from: string
  to: string
  content: string
  status: string
  sent_at: number
  [key: string]: any
}

function getConfig(): AircallConfig {
  const baseUrl = process.env.AIRCALL_BASE_URL || 'https://api.aircall.io'
  const apiId = process.env.AIRCALL_API_ID
  const apiToken = process.env.AIRCALL_API_TOKEN

  if (!apiId || !apiToken) {
    throw new Error('Missing Aircall credentials: AIRCALL_API_ID and AIRCALL_API_TOKEN required')
  }

  return { baseUrl, apiId, apiToken }
}

function getAuthHeader(config: AircallConfig): string {
  const credentials = Buffer.from(`${config.apiId}:${config.apiToken}`).toString('base64')
  return `Basic ${credentials}`
}

export async function listCalls(updatedSince?: Date): Promise<AircallCall[]> {
  const config = getConfig()
  const params = new URLSearchParams()

  if (updatedSince) {
    params.set('updated_since', updatedSince.toISOString())
  }
  params.set('per_page', '100')

  const response = await fetch(`${config.baseUrl}/v1/calls?${params}`, {
    headers: {
      Authorization: getAuthHeader(config),
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Aircall API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.calls || []
}

export async function listMessages(updatedSince?: Date): Promise<AircallMessage[]> {
  const config = getConfig()
  const params = new URLSearchParams()

  if (updatedSince) {
    params.set('updated_since', updatedSince.toISOString())
  }
  params.set('per_page', '100')

  const response = await fetch(`${config.baseUrl}/v1/messages?${params}`, {
    headers: {
      Authorization: getAuthHeader(config),
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Aircall API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.messages || []
}

export async function getRecording(callId: string): Promise<string | null> {
  const config = getConfig()

  const response = await fetch(`${config.baseUrl}/v1/calls/${callId}/recording`, {
    headers: {
      Authorization: getAuthHeader(config),
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Aircall API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.recording?.url || null
}

export function verifyWebhook(token: string): boolean {
  // Aircall webhook verification - implement based on your webhook setup
  const expectedToken = process.env.AIRCALL_WEBHOOK_TOKEN
  if (!expectedToken) return true // Skip verification if not configured
  return token === expectedToken
}
