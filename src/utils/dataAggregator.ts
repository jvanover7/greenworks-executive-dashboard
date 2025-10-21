/**
 * Data Aggregation Service
 *
 * This service aggregates data from all sources:
 * - Aircall (call data)
 * - ElevenLabs (bot call data)
 * - ISN (inspection data)
 * - Supabase via MCP (stored metrics)
 */

import { aircallClient } from './aircall'
import { elevenLabsClient } from './elevenlabs'
import { isnClient } from './isn'
import { mcpClient, storeMetricsInSupabase } from './mcp'

interface AggregatedMetrics {
  calls: any
  botCalls: any
  inspections: any
  timestamp: string
  sources: {
    aircall: boolean
    elevenlabs: boolean
    isn: boolean
    mcp: boolean
  }
}

class DataAggregator {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheDuration = 30000 // 30 seconds

  /**
   * Get cached data if available and not expired
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.cacheDuration) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  /**
   * Set cached data
   */
  private setCachedData(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Fetch all metrics from all sources
   */
  async fetchAllMetrics(): Promise<AggregatedMetrics> {
    // Check cache first
    const cached = this.getCachedData<AggregatedMetrics>('all_metrics')
    if (cached) {
      console.log('Using cached metrics')
      return cached
    }

    console.log('Fetching fresh metrics from all sources...')

    const [calls, botCalls, inspections] = await Promise.allSettled([
      this.fetchCallMetrics(),
      this.fetchBotCallMetrics(),
      this.fetchInspectionMetrics(),
    ])

    const metrics: AggregatedMetrics = {
      calls: calls.status === 'fulfilled' ? calls.value : null,
      botCalls: botCalls.status === 'fulfilled' ? botCalls.value : null,
      inspections: inspections.status === 'fulfilled' ? inspections.value : null,
      timestamp: new Date().toISOString(),
      sources: {
        aircall: calls.status === 'fulfilled',
        elevenlabs: botCalls.status === 'fulfilled',
        isn: inspections.status === 'fulfilled',
        mcp: !!mcpClient,
      },
    }

    // Cache the metrics
    this.setCachedData('all_metrics', metrics)

    // Store in Supabase via MCP (async, don't wait)
    if (mcpClient) {
      storeMetricsInSupabase(metrics).catch(err =>
        console.error('Failed to store metrics:', err)
      )
    }

    return metrics
  }

  /**
   * Fetch call metrics from Aircall
   */
  async fetchCallMetrics() {
    if (!aircallClient) {
      console.warn('Aircall client not available, using mock data')
      return this.getMockCallMetrics()
    }

    try {
      const metrics = await aircallClient.getCallMetrics()
      return metrics
    } catch (error) {
      console.error('Failed to fetch Aircall metrics:', error)
      return this.getMockCallMetrics()
    }
  }

  /**
   * Fetch bot call metrics from ElevenLabs
   */
  async fetchBotCallMetrics() {
    if (!elevenLabsClient) {
      console.warn('ElevenLabs client not available, using mock data')
      return this.getMockBotCallMetrics()
    }

    try {
      const metrics = await elevenLabsClient.getBotCallMetrics()
      return metrics
    } catch (error) {
      console.error('Failed to fetch ElevenLabs metrics:', error)
      return this.getMockBotCallMetrics()
    }
  }

  /**
   * Fetch inspection metrics from ISN
   */
  async fetchInspectionMetrics() {
    if (!isnClient) {
      console.warn('ISN client not available, using mock data')
      return this.getMockInspectionMetrics()
    }

    try {
      const metrics = await isnClient.getInspectionMetrics()
      return metrics
    } catch (error) {
      console.error('Failed to fetch ISN metrics:', error)
      return this.getMockInspectionMetrics()
    }
  }

  /**
   * Fetch specific metric type
   */
  async fetchMetric(type: 'calls' | 'botCalls' | 'inspections') {
    const cached = this.getCachedData(type)
    if (cached) return cached

    let data
    switch (type) {
      case 'calls':
        data = await this.fetchCallMetrics()
        break
      case 'botCalls':
        data = await this.fetchBotCallMetrics()
        break
      case 'inspections':
        data = await this.fetchInspectionMetrics()
        break
    }

    this.setCachedData(type, data)
    return data
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Get data source status
   */
  getDataSourceStatus() {
    return {
      aircall: {
        available: !!aircallClient,
        configured: !!(import.meta.env.VITE_AIRCALL_API_ID && import.meta.env.VITE_AIRCALL_API_TOKEN),
      },
      elevenlabs: {
        available: !!elevenLabsClient,
        configured: !!import.meta.env.VITE_ELEVENLABS_API_KEY,
      },
      isn: {
        available: !!isnClient,
        configured: !!(import.meta.env.VITE_ISN_API_KEY && import.meta.env.VITE_ISN_COMPANY_ID),
      },
      mcp: {
        available: !!mcpClient,
        configured: !!import.meta.env.VITE_MCP_SERVER_URL,
      },
    }
  }

  // ========== Mock Data (fallback when APIs not configured) ==========

  private getMockCallMetrics() {
    return {
      totalCalls: 1247,
      missedCalls: 43,
      answeredCalls: 1204,
      averageDuration: 8,
      salesOpportunities: 89,
      conversionRate: 34.2,
      trends: this.generateMockTrends(),
    }
  }

  private getMockBotCallMetrics() {
    return {
      totalBotCalls: 963,
      successfulCalls: 898,
      failedCalls: 65,
      averageHandleTime: 3.2,
      customerSatisfaction: 4.7,
      intents: [
        { intent: 'Schedule Service', count: 324, successRate: 94 },
        { intent: 'Get Quote', count: 278, successRate: 89 },
        { intent: 'Check Status', count: 156, successRate: 97 },
        { intent: 'Billing Inquiry', count: 112, successRate: 86 },
        { intent: 'Cancel Service', count: 45, successRate: 92 },
      ],
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        calls: Math.floor(Math.random() * 100),
      })),
    }
  }

  private getMockInspectionMetrics() {
    return {
      totalInspections: 342,
      completedInspections: 278,
      pendingInspections: 42,
      averageScore: 89.5,
      failureRate: 6.4,
      trends: this.generateMockInspectionTrends(),
      byCategory: [
        { category: 'Lawn Care', count: 142, passRate: 94 },
        { category: 'Irrigation', count: 87, passRate: 88 },
        { category: 'Landscaping', count: 65, passRate: 91 },
        { category: 'Tree Service', count: 48, passRate: 86 },
      ],
    }
  }

  private generateMockTrends() {
    const trends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      trends.push({
        date: date.toISOString().split('T')[0],
        calls: Math.floor(Math.random() * 200) + 150,
        duration: Math.floor(Math.random() * 10) + 5,
        opportunities: Math.floor(Math.random() * 20) + 10,
      })
    }
    return trends
  }

  private generateMockInspectionTrends() {
    const trends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      trends.push({
        date: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 50) + 30,
        pending: Math.floor(Math.random() * 15) + 5,
        score: Math.floor(Math.random() * 15) + 85,
      })
    }
    return trends
  }
}

// Export singleton instance
export const dataAggregator = new DataAggregator()

// Export convenience functions
export const fetchAllMetrics = () => dataAggregator.fetchAllMetrics()
export const fetchCallMetrics = () => dataAggregator.fetchMetric('calls')
export const fetchBotCallMetrics = () => dataAggregator.fetchMetric('botCalls')
export const fetchInspectionMetrics = () => dataAggregator.fetchMetric('inspections')
export const getDataSourceStatus = () => dataAggregator.getDataSourceStatus()
export const clearMetricsCache = () => dataAggregator.clearCache()
