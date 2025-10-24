export type UserRole = 'admin' | 'engineer' | 'viewer'

export interface User {
  id: string
  email: string
  role: UserRole
  full_name?: string
}

export interface Inspection {
  id: string
  site_id: string
  engineer_id: string
  date: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  score?: number
  notes?: string
  created_at: string
}

export interface Site {
  id: string
  name: string
  location: string
  customer: string
  created_at: string
}

export interface Engineer {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

export interface WorkOrder {
  id: string
  site_id: string
  opened_at: string
  closed_at?: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  cost?: number
  created_at: string
}

export interface Document {
  id: string
  source: string
  title: string
  url?: string
  uploaded_at: string
  metadata?: Record<string, any>
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface AircallCall {
  id: string
  direction: 'inbound' | 'outbound'
  from_number: string
  to_number: string
  agent_id?: string
  started_at: string
  ended_at?: string
  duration?: number
  status: string
  recording_url?: string
  raw?: Record<string, any>
}

export interface WhatConvertsLead {
  id: string
  source?: string
  medium?: string
  campaign?: string
  keyword?: string
  caller_number?: string
  email?: string
  conversion_type: string
  revenue?: number
  created_at: string
  raw?: Record<string, any>
}

export interface ISNInspection {
  id: string
  site_id?: string
  customer: string
  address: string
  status: string
  scheduled_at?: string
  completed_at?: string
  assigned_engineer?: string
  raw?: Record<string, any>
}

export interface KPIData {
  todayCalls: number
  newLeads: number
  upcomingInspections: number
  callsTrend: Array<{ date: string; count: number }>
  leadsTrend: Array<{ date: string; count: number }>
  inspectionsTrend: Array<{ date: string; count: number }>
}

export interface ActivityItem {
  id: string
  type: 'call' | 'lead' | 'inspection' | 'work_order'
  title: string
  description: string
  timestamp: string
}
