'use client'

import { Phone, TrendingUp, ClipboardList } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ActivityFeedProps {
  calls: any[]
  leads: any[]
  inspections: any[]
}

export function ActivityFeed({ calls, leads, inspections }: ActivityFeedProps) {
  // Combine and sort activities
  const activities = [
    ...calls.map((call) => ({
      type: 'call' as const,
      title: `Call ${call.direction}`,
      description: `${call.from_number} → ${call.to_number}`,
      timestamp: call.started_at,
      icon: Phone,
    })),
    ...leads.map((lead) => ({
      type: 'lead' as const,
      title: 'New Lead',
      description: `${lead.conversion_type} from ${lead.source || 'Unknown'}`,
      timestamp: lead.created_at,
      icon: TrendingUp,
    })),
    ...inspections.map((inspection) => ({
      type: 'inspection' as const,
      title: 'Inspection Updated',
      description: `Status: ${inspection.status}`,
      timestamp: inspection.created_at,
      icon: ClipboardList,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  if (activities.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No recent activity</div>
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <div className="mt-1">
            <activity.icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
