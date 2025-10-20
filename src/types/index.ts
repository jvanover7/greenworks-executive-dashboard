// Dashboard Metrics Types
export interface CallMetrics {
  totalCalls: number
  missedCalls: number
  answeredCalls: number
  averageDuration: number
  salesOpportunities: number
  conversionRate: number
  trends: CallTrend[]
}

export interface CallTrend {
  date: string
  calls: number
  duration: number
  opportunities: number
}

export interface InspectionMetrics {
  totalInspections: number
  completedInspections: number
  pendingInspections: number
  averageScore: number
  failureRate: number
  trends: InspectionTrend[]
  byCategory: CategoryMetrics[]
}

export interface InspectionTrend {
  date: string
  completed: number
  pending: number
  score: number
}

export interface CategoryMetrics {
  category: string
  count: number
  passRate: number
}

export interface BotCallMetrics {
  totalBotCalls: number
  successfulCalls: number
  failedCalls: number
  averageHandleTime: number
  customerSatisfaction: number
  intents: IntentMetrics[]
  hourlyDistribution: HourlyMetrics[]
}

export interface IntentMetrics {
  intent: string
  count: number
  successRate: number
}

export interface HourlyMetrics {
  hour: number
  calls: number
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  error?: string
  timestamp: string
}

// Data Source Configuration
export interface DataSource {
  id: string
  name: string
  type: 'api' | 'mcp'
  endpoint?: string
  mcpServer?: string
  enabled: boolean
  lastSync?: string
}

// User Types
export interface User {
  id: string
  email: string
  role: string
  permissions: string[]
}
