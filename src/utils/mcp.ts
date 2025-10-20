import { DataSource } from '../types'

/**
 * MCP (Model Context Protocol) Integration Utility
 *
 * This utility provides integration with MCP servers for data fetching.
 * MCP servers can provide real-time data from various sources including:
 * - CRM systems
 * - Phone systems
 * - Analytics platforms
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

// Export singleton instance
export const mcpClient = createMcpClient()
