import { InspectionMetrics, InspectionTrend, CategoryMetrics } from '../types'

/**
 * ISN (Inspection Support Network) API Integration
 *
 * ISN provides inspection scheduling, management, and reporting.
 * This integration fetches inspection data and analytics.
 * Docs: https://www.isn.com/resources/isn-api-documentation
 */

const ISN_API_BASE = 'https://api.inspectionsupport.net'

interface ISNConfig {
  apiKey: string
  companyId: string
}

interface ISNInspection {
  id: string
  order_number: string
  property_address: string
  inspection_date: string
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  inspector_name: string
  inspection_type: string
  score?: number
  defects_found?: number
  categories: Array<{
    name: string
    score: number
    passed: boolean
  }>
  created_at: string
  completed_at?: string
}

class ISNClient {
  private config: ISNConfig

  constructor(config: ISNConfig) {
    this.config = config
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${ISN_API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Company-ID': this.config.companyId,
          ...options?.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`ISN API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('ISN API request failed:', error)
      throw error
    }
  }

  /**
   * Get inspection metrics
   */
  async getInspectionMetrics(): Promise<InspectionMetrics> {
    try {
      const inspections = await this.getInspections()

      const totalInspections = inspections.length
      const completedInspections = inspections.filter(i => i.status === 'completed').length
      const pendingInspections = inspections.filter(i => i.status === 'pending').length

      // Calculate average score from completed inspections
      const completedWithScores = inspections.filter(i =>
        i.status === 'completed' && i.score !== undefined
      )
      const averageScore = completedWithScores.length > 0
        ? completedWithScores.reduce((sum, i) => sum + (i.score || 0), 0) / completedWithScores.length
        : 0

      // Calculate failure rate
      const failedInspections = inspections.filter(i => i.status === 'failed').length
      const failureRate = totalInspections > 0
        ? (failedInspections / totalInspections) * 100
        : 0

      // Get trends
      const trends = this.getInspectionTrends(inspections)

      // Get category metrics
      const byCategory = this.getCategoryMetrics(inspections)

      return {
        totalInspections,
        completedInspections,
        pendingInspections,
        averageScore: parseFloat(averageScore.toFixed(1)),
        failureRate: parseFloat(failureRate.toFixed(1)),
        trends,
        byCategory,
      }
    } catch (error) {
      console.error('Failed to fetch inspection metrics:', error)
      throw error
    }
  }

  /**
   * Get all inspections
   */
  async getInspections(status?: string, limit = 100): Promise<ISNInspection[]> {
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      params.append('limit', limit.toString())

      const response = await this.request<any>(`/v1/inspections?${params}`)
      return response.inspections || []
    } catch (error) {
      console.error('Failed to fetch inspections:', error)
      return []
    }
  }

  /**
   * Get inspection trends for last 7 days
   */
  private getInspectionTrends(inspections: ISNInspection[]): InspectionTrend[] {
    const trends: InspectionTrend[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayInspections = inspections.filter(insp => {
        const inspDate = new Date(insp.inspection_date).toISOString().split('T')[0]
        return inspDate === dateStr
      })

      const completed = dayInspections.filter(i => i.status === 'completed').length
      const pending = dayInspections.filter(i => i.status === 'pending').length

      const scoresForDay = dayInspections
        .filter(i => i.status === 'completed' && i.score !== undefined)
        .map(i => i.score || 0)

      const avgScore = scoresForDay.length > 0
        ? scoresForDay.reduce((sum, s) => sum + s, 0) / scoresForDay.length
        : 0

      trends.push({
        date: dateStr,
        completed,
        pending,
        score: parseFloat(avgScore.toFixed(1)),
      })
    }

    return trends
  }

  /**
   * Get category metrics
   */
  private getCategoryMetrics(inspections: ISNInspection[]): CategoryMetrics[] {
    const categoryMap = new Map<string, { total: number; passed: number }>()

    inspections.forEach(insp => {
      if (insp.status === 'completed' && insp.categories) {
        insp.categories.forEach(cat => {
          if (!categoryMap.has(cat.name)) {
            categoryMap.set(cat.name, { total: 0, passed: 0 })
          }

          const metrics = categoryMap.get(cat.name)!
          metrics.total++
          if (cat.passed) {
            metrics.passed++
          }
        })
      }
    })

    return Array.from(categoryMap.entries()).map(([category, metrics]) => ({
      category,
      count: metrics.total,
      passRate: parseFloat(((metrics.passed / metrics.total) * 100).toFixed(1)),
    }))
  }

  /**
   * Get inspection by ID
   */
  async getInspectionById(inspectionId: string): Promise<ISNInspection | null> {
    try {
      const response = await this.request<any>(`/v1/inspections/${inspectionId}`)
      return response.inspection || null
    } catch (error) {
      console.error('Failed to fetch inspection:', error)
      return null
    }
  }

  /**
   * Get inspections by date range
   */
  async getInspectionsByDateRange(startDate: string, endDate: string): Promise<ISNInspection[]> {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      })

      const response = await this.request<any>(`/v1/inspections?${params}`)
      return response.inspections || []
    } catch (error) {
      console.error('Failed to fetch inspections by date range:', error)
      return []
    }
  }

  /**
   * Get inspections by type
   */
  async getInspectionsByType(inspectionType: string): Promise<ISNInspection[]> {
    try {
      const params = new URLSearchParams({ type: inspectionType })
      const response = await this.request<any>(`/v1/inspections?${params}`)
      return response.inspections || []
    } catch (error) {
      console.error('Failed to fetch inspections by type:', error)
      return []
    }
  }

  /**
   * Get inspector performance
   */
  async getInspectorPerformance(inspectorId: string) {
    try {
      const response = await this.request<any>(`/v1/inspectors/${inspectorId}/performance`)
      return response.performance || null
    } catch (error) {
      console.error('Failed to fetch inspector performance:', error)
      return null
    }
  }

  /**
   * Get inspection report
   */
  async getInspectionReport(inspectionId: string) {
    try {
      const response = await this.request<any>(`/v1/inspections/${inspectionId}/report`)
      return response.report || null
    } catch (error) {
      console.error('Failed to fetch inspection report:', error)
      return null
    }
  }

  /**
   * Get defects for an inspection
   */
  async getInspectionDefects(inspectionId: string) {
    try {
      const response = await this.request<any>(`/v1/inspections/${inspectionId}/defects`)
      return response.defects || []
    } catch (error) {
      console.error('Failed to fetch inspection defects:', error)
      return []
    }
  }
}

// Create and export ISN client
export const createISNClient = (): ISNClient | null => {
  const apiKey = import.meta.env.VITE_ISN_API_KEY
  const companyId = import.meta.env.VITE_ISN_COMPANY_ID

  if (!apiKey || !companyId) {
    console.warn('ISN credentials not configured')
    return null
  }

  return new ISNClient({ apiKey, companyId })
}

export const isnClient = createISNClient()
