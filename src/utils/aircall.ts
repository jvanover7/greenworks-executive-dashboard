import { CallMetrics, CallTrend } from '../types'

/**
 * Aircall API Integration
 *
 * Aircall provides call center analytics and phone system data.
 * Docs: https://developer.aircall.io/api-references/
 */

const AIRCALL_API_BASE = 'https://api.aircall.io/v1'

interface AircallConfig {
  apiId: string
  apiToken: string
}

class AircallClient {
  private config: AircallConfig

  constructor(config: AircallConfig) {
    this.config = config
  }

  private getAuthHeader(): string {
    const credentials = btoa(`${this.config.apiId}:${this.config.apiToken}`)
    return `Basic ${credentials}`
  }

  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${AIRCALL_API_BASE}${endpoint}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Aircall API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Aircall API request failed:', error)
      throw error
    }
  }

  /**
   * Get call metrics for a date range
   */
  async getCallMetrics(startDate?: string, endDate?: string): Promise<CallMetrics> {
    try {
      // Fetch calls from Aircall
      const calls = await this.request<any>('/calls')

      // Process calls data
      const totalCalls = calls.calls?.length || 0
      const missedCalls = calls.calls?.filter((c: any) => c.missed === true).length || 0
      const answeredCalls = totalCalls - missedCalls

      // Calculate average duration
      const avgDuration = calls.calls?.reduce((sum: number, c: any) =>
        sum + (c.duration || 0), 0) / totalCalls || 0

      // Get call trends (last 7 days)
      const trends = await this.getCallTrends()

      return {
        totalCalls,
        missedCalls,
        answeredCalls,
        averageDuration: Math.round(avgDuration / 60), // Convert to minutes
        salesOpportunities: 0, // Will be calculated from tags or custom fields
        conversionRate: 0,
        trends,
      }
    } catch (error) {
      console.error('Failed to fetch Aircall metrics:', error)
      throw error
    }
  }

  /**
   * Get call trends for the last 7 days
   */
  async getCallTrends(): Promise<CallTrend[]> {
    try {
      const calls = await this.request<any>('/calls')
      const trends: CallTrend[] = []

      // Group calls by date
      const callsByDate = new Map<string, any[]>()
      calls.calls?.forEach((call: any) => {
        const date = new Date(call.started_at * 1000).toISOString().split('T')[0]
        if (!callsByDate.has(date)) {
          callsByDate.set(date, [])
        }
        callsByDate.get(date)?.push(call)
      })

      // Create trend data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const dayCalls = callsByDate.get(dateStr) || []

        trends.push({
          date: dateStr,
          calls: dayCalls.length,
          duration: dayCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / 60,
          opportunities: dayCalls.filter((c: any) =>
            c.tags?.some((t: any) => t.name.toLowerCase().includes('opportunity'))
          ).length,
        })
      }

      return trends
    } catch (error) {
      console.error('Failed to fetch Aircall trends:', error)
      return []
    }
  }

  /**
   * Get missed calls details
   */
  async getMissedCalls() {
    try {
      const calls = await this.request<any>('/calls?missed=true')
      return calls.calls || []
    } catch (error) {
      console.error('Failed to fetch missed calls:', error)
      return []
    }
  }

  /**
   * Get calls by user/agent
   */
  async getCallsByUser(userId: string) {
    try {
      const calls = await this.request<any>(`/calls?user_id=${userId}`)
      return calls.calls || []
    } catch (error) {
      console.error('Failed to fetch calls by user:', error)
      return []
    }
  }

  /**
   * Get call recording URL
   */
  async getCallRecording(callId: string) {
    try {
      const call = await this.request<any>(`/calls/${callId}`)
      return call.call?.recording || null
    } catch (error) {
      console.error('Failed to fetch call recording:', error)
      return null
    }
  }
}

// Create and export Aircall client
export const createAircallClient = (): AircallClient | null => {
  const apiId = import.meta.env.VITE_AIRCALL_API_ID
  const apiToken = import.meta.env.VITE_AIRCALL_API_TOKEN

  if (!apiId || !apiToken) {
    console.warn('Aircall credentials not configured')
    return null
  }

  return new AircallClient({ apiId, apiToken })
}

export const aircallClient = createAircallClient()
