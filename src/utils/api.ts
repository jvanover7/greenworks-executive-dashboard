import { ApiResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        data,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Specific API endpoints
export const metricsApi = {
  getCalls: () => apiClient.get('/metrics/calls'),
  getInspections: () => apiClient.get('/metrics/inspections'),
  getBotCalls: () => apiClient.get('/metrics/bot-calls'),
  getAll: () => apiClient.get('/metrics'),
}
