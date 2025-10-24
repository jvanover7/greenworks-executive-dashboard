interface ISNConfig {
  baseUrl: string
  apiKey: string
  domain?: string
  companyKey?: string
}

interface ISNInspection {
  id: string
  customer_name: string
  address: string
  city?: string
  state?: string
  zip?: string
  status: string
  scheduled_date?: string
  completed_date?: string
  inspector_name?: string
  [key: string]: any
}

function getConfig(): ISNConfig {
  const baseUrl = process.env.ISN_BASE_URL || 'https://api.inspectionsupport.net'
  const apiKey = process.env.ISN_API_KEY
  const domain = process.env.ISN_DOMAIN
  const companyKey = process.env.ISN_COMPANY_KEY

  if (!apiKey) {
    throw new Error('Missing ISN credentials: ISN_API_KEY required')
  }

  return { baseUrl, apiKey, domain, companyKey }
}

export async function listInspections(updatedSince?: Date): Promise<ISNInspection[]> {
  const config = getConfig()
  const params = new URLSearchParams()

  if (updatedSince) {
    params.set('updated_since', updatedSince.toISOString())
  }
  params.set('limit', '100')

  const response = await fetch(`${config.baseUrl}/inspections?${params}`, {
    headers: {
      'X-ISN-API-Key': config.apiKey,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`ISN API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.inspections || data.data || []
}

export async function getInspection(inspectionId: string): Promise<ISNInspection | null> {
  const config = getConfig()

  const response = await fetch(`${config.baseUrl}/inspections/${inspectionId}`, {
    headers: {
      'X-ISN-API-Key': config.apiKey,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`ISN API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

export function verifyWebhook(token: string): boolean {
  // ISN webhook verification - implement based on your webhook setup
  const expectedToken = process.env.ISN_WEBHOOK_TOKEN
  if (!expectedToken) return true // Skip verification if not configured
  return token === expectedToken
}
