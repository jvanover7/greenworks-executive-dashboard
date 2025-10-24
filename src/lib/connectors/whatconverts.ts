interface WhatConvertsConfig {
  baseUrl: string
  apiKey: string
  webhookToken: string
}

interface WhatConvertsLead {
  lead_id: string
  profile_id: string
  profile_name: string
  lead_type: string
  lead_status: string
  lead_source: string
  lead_medium: string
  lead_campaign?: string
  lead_keyword?: string
  caller_number?: string
  contact_email?: string
  lead_value?: number
  date_created: string
  [key: string]: any
}

function getConfig(): WhatConvertsConfig {
  const baseUrl = process.env.WHATCONVERTS_BASE_URL || 'https://app.whatconverts.com/api/v1'
  const apiKey = process.env.WHATCONVERTS_API_KEY
  const webhookToken = process.env.WHATCONVERTS_WEBHOOK_TOKEN || ''

  if (!apiKey) {
    throw new Error('Missing WhatConverts credentials: WHATCONVERTS_API_KEY required')
  }

  return { baseUrl, apiKey, webhookToken }
}

export async function listLeads(updatedSince?: Date): Promise<WhatConvertsLead[]> {
  const config = getConfig()
  const params = new URLSearchParams()

  if (updatedSince) {
    params.set('date_start', updatedSince.toISOString().split('T')[0])
  }
  params.set('per_page', '100')

  const response = await fetch(`${config.baseUrl}/leads?${params}`, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`WhatConverts API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.leads || []
}

export async function getLead(leadId: string): Promise<WhatConvertsLead | null> {
  const config = getConfig()

  const response = await fetch(`${config.baseUrl}/leads/${leadId}`, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`WhatConverts API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

export function verifyWebhook(token: string): boolean {
  const config = getConfig()
  if (!config.webhookToken) return true // Skip verification if not configured
  return token === config.webhookToken
}
