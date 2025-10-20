import { useEffect, useState } from 'react'
import { Phone, PhoneIncoming, PhoneMissed, TrendingUp, Users, Target, Clock } from 'lucide-react'
import { MetricCard } from './ui/MetricCard'
import { DrillDownPanel, DrillDownSection, DrillDownItem } from './ui/DrillDownPanel'
import InspectionsView from './InspectionsView'
import BotCallsView from './BotCallsView'
import ClaudeChat from './ClaudeChat'
import { metricsApi } from '../utils/api'

export default function Dashboard({ user }: any) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inspections' | 'bot-calls' | 'chat'>('dashboard')
  const [loading, setLoading] = useState<boolean>(true)
  const [drillDownType, setDrillDownType] = useState<string | null>(null)

  // Mock data - will be replaced with real API calls
  const [metrics, setMetrics] = useState({
    totalCalls: 1247,
    missedCalls: 43,
    salesOpportunities: 89,
    conversionRate: 34.2,
    totalInspections: 342,
    avgResponseTime: 4.3,
    customerSatisfaction: 4.7,
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // This will use the API client to fetch real data
        const response = await metricsApi.getAll()
        if (response.data) {
          // Update metrics with real data when available
          console.log('Fetched metrics:', response.data)
        }
      } catch (err) {
        console.error('Failed to fetch metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading dashboard metrics...</div>
      </div>
    )
  }

  // Render different views based on active tab
  if (activeTab === 'inspections') {
    return <InspectionsView />
  }

  if (activeTab === 'bot-calls') {
    return <BotCallsView />
  }

  if (activeTab === 'chat') {
    return <ClaudeChat user={user} />
  }

  return (
    <div className="w-full p-8 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Executive Dashboard</h1>
        <p className="text-gray-400">Real-time insights from all your data sources</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-gray-700 pb-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={activeTab === 'dashboard' ? 'bg-blue-600 py-2 px-6 rounded-lg font-medium' : 'py-2 px-6 hover:bg-gray-800 rounded-lg font-medium text-gray-400 hover:text-white transition-colors'}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('inspections')}
          className={activeTab === 'inspections' ? 'bg-blue-600 py-2 px-6 rounded-lg font-medium' : 'py-2 px-6 hover:bg-gray-800 rounded-lg font-medium text-gray-400 hover:text-white transition-colors'}
        >
          Inspections
        </button>
        <button
          onClick={() => setActiveTab('bot-calls')}
          className={activeTab === 'bot-calls' ? 'bg-blue-600 py-2 px-6 rounded-lg font-medium' : 'py-2 px-6 hover:bg-gray-800 rounded-lg font-medium text-gray-400 hover:text-white transition-colors'}
        >
          Bot Calls
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={activeTab === 'chat' ? 'bg-blue-600 py-2 px-6 rounded-lg font-medium' : 'py-2 px-6 hover:bg-gray-800 rounded-lg font-medium text-gray-400 hover:text-white transition-colors'}
        >
          AI Assistant
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Calls"
          value={metrics.totalCalls.toLocaleString()}
          change={12.5}
          icon={Phone}
          iconColor="text-blue-500"
          onClick={() => setDrillDownType('calls')}
        />

        <MetricCard
          title="Missed Calls"
          value={metrics.missedCalls}
          change={-8.3}
          icon={PhoneMissed}
          iconColor="text-red-500"
          onClick={() => setDrillDownType('missed')}
        />

        <MetricCard
          title="Sales Opportunities"
          value={metrics.salesOpportunities}
          change={23.1}
          icon={Target}
          iconColor="text-green-500"
          onClick={() => setDrillDownType('opportunities')}
        />

        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          change={5.7}
          icon={TrendingUp}
          iconColor="text-purple-500"
          onClick={() => setDrillDownType('conversion')}
        />

        <MetricCard
          title="Total Inspections"
          value={metrics.totalInspections}
          change={15.2}
          icon={Users}
          iconColor="text-cyan-500"
          onClick={() => setActiveTab('inspections')}
        />

        <MetricCard
          title="Avg Response Time"
          value={`${metrics.avgResponseTime}m`}
          change={-12.3}
          icon={Clock}
          iconColor="text-yellow-500"
          subtitle="Average time to answer"
        />

        <MetricCard
          title="Customer Satisfaction"
          value={metrics.customerSatisfaction}
          change={3.2}
          icon={TrendingUp}
          iconColor="text-pink-500"
          subtitle="Out of 5.0"
        />

        <MetricCard
          title="Answered Calls"
          value={metrics.totalCalls - metrics.missedCalls}
          change={14.1}
          icon={PhoneIncoming}
          iconColor="text-emerald-500"
          onClick={() => setDrillDownType('answered')}
        />
      </div>

      {/* Drill-down Panels */}
      <DrillDownPanel
        isOpen={drillDownType === 'calls'}
        onClose={() => setDrillDownType(null)}
        title="Total Calls Details"
      >
        <DrillDownSection title="Call Breakdown">
          <DrillDownItem label="Answered Calls" value={metrics.totalCalls - metrics.missedCalls} />
          <DrillDownItem label="Missed Calls" value={metrics.missedCalls} />
          <DrillDownItem label="Average Duration" value="8m 34s" />
          <DrillDownItem label="Peak Hours" value="2pm - 4pm" />
        </DrillDownSection>

        <DrillDownSection title="Call Sources">
          <DrillDownItem label="Direct Calls" value="842" />
          <DrillDownItem label="Website" value="235" />
          <DrillDownItem label="Referrals" value="170" />
        </DrillDownSection>

        <DrillDownSection title="Trends">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Last 7 days trend</p>
            <div className="flex items-end gap-2 h-32">
              {[65, 72, 68, 85, 78, 92, 88].map((height, i) => (
                <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </DrillDownSection>
      </DrillDownPanel>

      <DrillDownPanel
        isOpen={drillDownType === 'missed'}
        onClose={() => setDrillDownType(null)}
        title="Missed Calls Analysis"
      >
        <DrillDownSection title="Missed Call Details">
          <DrillDownItem label="Total Missed" value={metrics.missedCalls} />
          <DrillDownItem label="During Business Hours" value="27" />
          <DrillDownItem label="After Hours" value="16" />
          <DrillDownItem label="Callback Completed" value="31" />
        </DrillDownSection>

        <DrillDownSection title="Top Reasons">
          <DrillDownItem label="All Lines Busy" value="18" />
          <DrillDownItem label="No Answer" value="15" />
          <DrillDownItem label="Call Abandoned" value="10" />
        </DrillDownSection>
      </DrillDownPanel>

      <DrillDownPanel
        isOpen={drillDownType === 'opportunities'}
        onClose={() => setDrillDownType(null)}
        title="Sales Opportunities"
      >
        <DrillDownSection title="Opportunity Status">
          <DrillDownItem label="New Opportunities" value="34" />
          <DrillDownItem label="In Progress" value="32" />
          <DrillDownItem label="Closed Won" value="15" />
          <DrillDownItem label="Closed Lost" value="8" />
        </DrillDownSection>

        <DrillDownSection title="By Service Type">
          <DrillDownItem label="Lawn Maintenance" value="42" />
          <DrillDownItem label="Landscaping" value="28" />
          <DrillDownItem label="Tree Service" value="19" />
        </DrillDownSection>

        <DrillDownSection title="Revenue Potential">
          <DrillDownItem label="Total Pipeline Value" value="$127,500" />
          <DrillDownItem label="Average Deal Size" value="$1,433" />
          <DrillDownItem label="Expected Close Rate" value="34.2%" />
        </DrillDownSection>
      </DrillDownPanel>

      <DrillDownPanel
        isOpen={drillDownType === 'conversion'}
        onClose={() => setDrillDownType(null)}
        title="Conversion Rate Analysis"
      >
        <DrillDownSection title="Conversion Funnel">
          <DrillDownItem label="Total Calls" value="1,247" />
          <DrillDownItem label="Qualified Leads" value="523" />
          <DrillDownItem label="Quotes Sent" value="312" />
          <DrillDownItem label="Closed Sales" value="107" />
        </DrillDownSection>

        <DrillDownSection title="Performance Metrics">
          <DrillDownItem label="Lead Qualification Rate" value="41.9%" />
          <DrillDownItem label="Quote Conversion Rate" value="34.3%" />
          <DrillDownItem label="Overall Conversion" value="8.6%" />
        </DrillDownSection>
      </DrillDownPanel>
    </div>
  )
}
