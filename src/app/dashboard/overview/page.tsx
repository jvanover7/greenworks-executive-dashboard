import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { Phone, TrendingUp, Calendar } from 'lucide-react'
import { KPIChart } from '@/components/dashboard/kpi-chart'
import { ActivityFeed } from '@/components/dashboard/activity-feed'

export const dynamic = 'force-dynamic'

export default async function OverviewPage() {
  const supabase = await createClient()

  // Fetch today's KPIs
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { count: todayCalls },
    { count: newLeads },
    { count: upcomingInspections },
    { data: recentCalls },
    { data: recentLeads },
    { data: recentInspections },
  ] = await Promise.all([
    supabase
      .from('aircall_calls')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', today.toISOString()),
    supabase
      .from('whatconverts_leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    supabase
      .from('inspections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .gte('date', new Date().toISOString()),
    supabase
      .from('aircall_calls')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(7),
    supabase
      .from('whatconverts_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(7),
    supabase
      .from('inspections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(7),
  ])

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    return date
  }).reverse()

  const callsTrend = last7Days.map((date) => ({
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: recentCalls?.filter((call) => {
      const callDate = new Date(call.started_at)
      callDate.setHours(0, 0, 0, 0)
      return callDate.getTime() === date.getTime()
    }).length || 0,
  }))

  const leadsTrend = last7Days.map((date) => ({
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: recentLeads?.filter((lead) => {
      const leadDate = new Date(lead.created_at)
      leadDate.setHours(0, 0, 0, 0)
      return leadDate.getTime() === date.getTime()
    }).length || 0,
  }))

  const inspectionsTrend = last7Days.map((date) => ({
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: recentInspections?.filter((inspection) => {
      const inspDate = new Date(inspection.created_at)
      inspDate.setHours(0, 0, 0, 0)
      return inspDate.getTime() === date.getTime()
    }).length || 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Real-time insights into your operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(todayCalls || 0)}</div>
            <p className="text-xs text-muted-foreground">From Aircall</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(newLeads || 0)}</div>
            <p className="text-xs text-muted-foreground">From WhatConverts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Inspections</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(upcomingInspections || 0)}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calls Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <KPIChart data={callsTrend} dataKey="count" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <KPIChart data={leadsTrend} dataKey="count" />
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across all systems</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            calls={recentCalls || []}
            leads={recentLeads || []}
            inspections={recentInspections || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
