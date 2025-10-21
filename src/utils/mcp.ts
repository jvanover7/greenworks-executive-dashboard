import { DataSource } from '../types'

/**
 * MCP (Model Context Protocol) Integration Utility
 *
 * This utility provides integration with MCP servers for data fetching.
 * Integrated services:
 * - Supabase (via rube.app MCP)
 * - Vercel deployments and analytics
 * - Custom data sources
 */

interface McpServerConfig {
  serverUrl: string
  authToken?: string
  tools: string[]
}

class McpClient {
  private config: McpServerConfig

  constructor(config: McpServerConfig) {
    this.config = config
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool<T>(toolName: string, params: Record<string, unknown> = {}): Promise<T> {
    try {
      const response = await fetch(`${this.config.serverUrl}/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.authToken && { Authorization: `Bearer ${this.config.authToken}` }),
        },
        body: JSON.stringify({ params }),
      })

      if (!response.ok) {
        throw new Error(`MCP tool call failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      console.error(`MCP tool call failed for ${toolName}:`, error)
      throw error
    }
  }

  /**
   * List available tools on the MCP server
   */
  async listTools(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.serverUrl}/tools`, {
        headers: {
          ...(this.config.authToken && { Authorization: `Bearer ${this.config.authToken}` }),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to list MCP tools: ${response.statusText}`)
      }

      const data = await response.json()
      return data.tools || []
    } catch (error) {
      console.error('Failed to list MCP tools:', error)
      return []
    }
  }

  // ========== Supabase MCP Tools ==========

  /**
   * Run a Supabase query via MCP
   */
  async runSupabaseQuery<T>(query: string, params?: any[]): Promise<T> {
    return this.callTool<T>('supabase_query', { query, params })
  }

  /**
   * Get data from a Supabase table
   */
  async getSupabaseTable<T>(tableName: string, filters?: Record<string, any>): Promise<T[]> {
    const response = await this.callTool<any>('supabase_get_table', {
      table: tableName,
      filters,
    })
    return response.data || []
  }

  /**
   * Insert data into Supabase table
   */
  async insertSupabaseData<T>(tableName: string, data: any): Promise<T> {
    const response = await this.callTool<any>('supabase_insert', {
      table: tableName,
      data,
    })
    return response.data
  }

  /**
   * Update data in Supabase table
   */
  async updateSupabaseData<T>(tableName: string, id: string, data: any): Promise<T> {
    const response = await this.callTool<any>('supabase_update', {
      table: tableName,
      id,
      data,
    })
    return response.data
  }

  /**
   * Delete data from Supabase table
   */
  async deleteSupabaseData(tableName: string, id: string): Promise<boolean> {
    const response = await this.callTool<any>('supabase_delete', {
      table: tableName,
      id,
    })
    return response.success || false
  }

  /**
   * Get aggregated metrics from Supabase
   */
  async getSupabaseMetrics(metricType: string, dateRange?: { start: string; end: string }) {
    return this.callTool('supabase_get_metrics', {
      metric_type: metricType,
      date_range: dateRange,
    })
  }

  // ========== Vercel MCP Tools ==========

  /**
   * Get Vercel deployment info
   */
  async getVercelDeployment(deploymentId?: string) {
    return this.callTool('vercel_get_deployment', { deployment_id: deploymentId })
  }

  /**
   * Get Vercel project analytics
   */
  async getVercelAnalytics(projectId: string, dateRange?: { start: string; end: string }) {
    return this.callTool('vercel_get_analytics', {
      project_id: projectId,
      date_range: dateRange,
    })
  }

  /**
   * Get Vercel environment variables
   */
  async getVercelEnvVars(projectId: string) {
    return this.callTool('vercel_get_env_vars', { project_id: projectId })
  }

  /**
   * Trigger Vercel deployment
   */
  async triggerVercelDeployment(projectId: string, branch = 'main') {
    return this.callTool('vercel_trigger_deployment', {
      project_id: projectId,
      branch,
    })
  }
}

/**
 * Initialize MCP client from environment configuration
 */
export function createMcpClient(): McpClient | null {
  const serverUrl = import.meta.env.VITE_MCP_SERVER_URL

  if (!serverUrl) {
    console.warn('MCP server URL not configured')
    return null
  }

  return new McpClient({
    serverUrl,
    authToken: import.meta.env.VITE_MCP_AUTH_TOKEN,
    tools: [],
  })
}

/**
 * Fetch data from configured data sources (API or MCP)
 */
export async function fetchFromDataSource<T>(source: DataSource): Promise<T | null> {
  try {
    if (source.type === 'api' && source.endpoint) {
      const response = await fetch(source.endpoint)
      if (!response.ok) throw new Error(`API fetch failed: ${response.statusText}`)
      return await response.json()
    } else if (source.type === 'mcp' && source.mcpServer) {
      const mcpClient = createMcpClient()
      if (!mcpClient) throw new Error('MCP client not available')
      return await mcpClient.callTool<T>(source.mcpServer)
    }

    throw new Error('Invalid data source configuration')
  } catch (error) {
    console.error(`Failed to fetch from data source ${source.name}:`, error)
    return null
  }
}

// ========== Helper Functions ==========

/**
 * Store metrics in Supabase via MCP
 */
export async function storeMetricsInSupabase(metrics: any) {
  const client = createMcpClient()
  if (!client) return false

  try {
    await client.insertSupabaseData('metrics', {
      ...metrics,
      timestamp: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error('Failed to store metrics in Supabase:', error)
    return false
  }
}

/**
 * Get historical metrics from Supabase
 */
export async function getHistoricalMetrics(days = 7) {
  const client = createMcpClient()
  if (!client) return []

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return await client.getSupabaseMetrics('all', {
      start: startDate.toISOString(),
      end: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to get historical metrics:', error)
    return []
  }
}

/**
 * Sync data to Supabase
 */
export async function syncDataToSupabase(dataType: string, data: any[]) {
  const client = createMcpClient()
  if (!client) return false

  try {
    for (const item of data) {
      await client.insertSupabaseData(dataType, item)
    }
    return true
  } catch (error) {
    console.error(`Failed to sync ${dataType} to Supabase:`, error)
    return false
  }
}

// Export singleton instance
export const mcpClient = createMcpClient()
