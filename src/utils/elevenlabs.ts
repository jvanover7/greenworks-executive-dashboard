import { BotCallMetrics, IntentMetrics, HourlyMetrics } from '../types'

/**
 * ElevenLabs API Integration
 *
 * ElevenLabs provides AI voice agents and conversational AI.
 * This integration fetches bot call analytics and performance metrics.
 * Docs: https://elevenlabs.io/docs/api-reference/
 */

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1'

interface ElevenLabsConfig {
  apiKey: string
}

interface ConversationAnalytics {
  conversation_id: string
  agent_id: string
  started_at: string
  ended_at: string
  duration_seconds: number
  status: 'completed' | 'failed' | 'in_progress'
  transcript: Array<{
    role: 'agent' | 'user'
    message: string
    timestamp: string
  }>
  detected_intent?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  success: boolean
}

class ElevenLabsClient {
  private config: ElevenLabsConfig

  constructor(config: ElevenLabsConfig) {
    this.config = config
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${ELEVENLABS_API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'xi-api-key': this.config.apiKey,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('ElevenLabs API request failed:', error)
      throw error
    }
  }

  /**
   * Get conversational AI analytics
   */
  async getConversationAnalytics(agentId?: string): Promise<ConversationAnalytics[]> {
    try {
      // Note: Adjust endpoint based on actual ElevenLabs API structure
      const endpoint = agentId
        ? `/convai/conversations?agent_id=${agentId}`
        : '/convai/conversations'

      const response = await this.request<any>(endpoint)
      return response.conversations || []
    } catch (error) {
      console.error('Failed to fetch conversation analytics:', error)
      return []
    }
  }

  /**
   * Get bot call metrics
   */
  async getBotCallMetrics(): Promise<BotCallMetrics> {
    try {
      const conversations = await this.getConversationAnalytics()

      const totalBotCalls = conversations.length
      const successfulCalls = conversations.filter(c => c.success && c.status === 'completed').length
      const failedCalls = conversations.filter(c => !c.success || c.status === 'failed').length

      // Calculate average handle time
      const avgHandleTime = conversations.reduce((sum, c) =>
        sum + c.duration_seconds, 0) / totalBotCalls / 60 || 0

      // Calculate customer satisfaction based on sentiment
      const positiveCalls = conversations.filter(c => c.sentiment === 'positive').length
      const customerSatisfaction = (positiveCalls / totalBotCalls) * 5 || 0

      // Get intent metrics
      const intents = this.extractIntentMetrics(conversations)

      // Get hourly distribution
      const hourlyDistribution = this.getHourlyDistribution(conversations)

      return {
        totalBotCalls,
        successfulCalls,
        failedCalls,
        averageHandleTime: parseFloat(avgHandleTime.toFixed(1)),
        customerSatisfaction: parseFloat(customerSatisfaction.toFixed(1)),
        intents,
        hourlyDistribution,
      }
    } catch (error) {
      console.error('Failed to fetch bot call metrics:', error)
      throw error
    }
  }

  /**
   * Extract intent metrics from conversations
   */
  private extractIntentMetrics(conversations: ConversationAnalytics[]): IntentMetrics[] {
    const intentMap = new Map<string, { count: number; successful: number }>()

    conversations.forEach(conv => {
      const intent = conv.detected_intent || 'Unknown'

      if (!intentMap.has(intent)) {
        intentMap.set(intent, { count: 0, successful: 0 })
      }

      const metrics = intentMap.get(intent)!
      metrics.count++
      if (conv.success) {
        metrics.successful++
      }
    })

    return Array.from(intentMap.entries()).map(([intent, metrics]) => ({
      intent,
      count: metrics.count,
      successRate: parseFloat(((metrics.successful / metrics.count) * 100).toFixed(1)),
    }))
  }

  /**
   * Get hourly distribution of calls
   */
  private getHourlyDistribution(conversations: ConversationAnalytics[]): HourlyMetrics[] {
    const hourlyMap = new Map<number, number>()

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, 0)
    }

    conversations.forEach(conv => {
      const hour = new Date(conv.started_at).getHours()
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
    })

    return Array.from(hourlyMap.entries()).map(([hour, calls]) => ({
      hour,
      calls,
    }))
  }

  /**
   * Get conversation transcript
   */
  async getConversationTranscript(conversationId: string) {
    try {
      const response = await this.request<any>(`/convai/conversations/${conversationId}`)
      return response.conversation?.transcript || []
    } catch (error) {
      console.error('Failed to fetch conversation transcript:', error)
      return []
    }
  }

  /**
   * Get agent analytics
   */
  async getAgentAnalytics(agentId: string) {
    try {
      const response = await this.request<any>(`/convai/agents/${agentId}/analytics`)
      return response.analytics || null
    } catch (error) {
      console.error('Failed to fetch agent analytics:', error)
      return null
    }
  }

  /**
   * Get available agents
   */
  async getAgents() {
    try {
      const response = await this.request<any>('/convai/agents')
      return response.agents || []
    } catch (error) {
      console.error('Failed to fetch agents:', error)
      return []
    }
  }

  /**
   * Get conversation by date range
   */
  async getConversationsByDateRange(startDate: string, endDate: string) {
    try {
      const conversations = await this.getConversationAnalytics()

      return conversations.filter(conv => {
        const convDate = new Date(conv.started_at)
        return convDate >= new Date(startDate) && convDate <= new Date(endDate)
      })
    } catch (error) {
      console.error('Failed to fetch conversations by date range:', error)
      return []
    }
  }
}

// Create and export ElevenLabs client
export const createElevenLabsClient = (): ElevenLabsClient | null => {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY

  if (!apiKey) {
    console.warn('ElevenLabs API key not configured')
    return null
  }

  return new ElevenLabsClient({ apiKey })
}

export const elevenLabsClient = createElevenLabsClient()
