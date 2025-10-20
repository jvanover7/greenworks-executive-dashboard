import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Phone, CheckCircle, XCircle, Clock, Smile, MessageSquare, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { MetricCard } from './ui/MetricCard'
import { DrillDownPanel, DrillDownSection, DrillDownItem } from './ui/DrillDownPanel'

export default function BotCallsView() {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)

  // Mock data
  const hourlyDistribution = [
    { hour: '12am', calls: 5 },
    { hour: '3am', calls: 2 },
    { hour: '6am', calls: 8 },
    { hour: '9am', calls: 45 },
    { hour: '12pm', calls: 78 },
    { hour: '3pm', calls: 92 },
    { hour: '6pm', calls: 52 },
    { hour: '9pm', calls: 18 },
  ]

  const intentData = [
    { intent: 'Schedule Service', count: 324, successRate: 94 },
    { intent: 'Get Quote', count: 278, successRate: 89 },
    { intent: 'Check Status', count: 156, successRate: 97 },
    { intent: 'Billing Inquiry', count: 112, successRate: 86 },
    { intent: 'Cancel Service', count: 45, successRate: 92 },
  ]

  const weeklyTrend = [
    { day: 'Mon', successful: 145, failed: 12, satisfaction: 4.5 },
    { day: 'Tue', successful: 162, failed: 8, satisfaction: 4.7 },
    { day: 'Wed', successful: 158, failed: 15, satisfaction: 4.4 },
    { day: 'Thu', successful: 171, failed: 9, satisfaction: 4.8 },
    { day: 'Fri', successful: 165, failed: 11, satisfaction: 4.6 },
    { day: 'Sat', successful: 98, failed: 6, satisfaction: 4.7 },
    { day: 'Sun', successful: 64, failed: 4, satisfaction: 4.9 },
  ]

  const sentimentData = [
    { name: 'Positive', value: 742, color: '#10b981' },
    { name: 'Neutral', value: 183, color: '#f59e0b' },
    { name: 'Negative', value: 38, color: '#ef4444' },
  ]

  const metrics = {
    totalCalls: 963,
    successfulCalls: 898,
    failedCalls: 65,
    avgHandleTime: 3.2,
    satisfaction: 4.7,
  }

  return (
    <div className="w-full p-8 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Bot Call Analytics</h1>
        <p className="text-gray-400">AI-powered call handling performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Total Bot Calls"
          value={metrics.totalCalls}
          change={18.3}
          icon={Phone}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Successful"
          value={metrics.successfulCalls}
          change={15.7}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Failed"
          value={metrics.failedCalls}
          change={-12.4}
          icon={XCircle}
          iconColor="text-red-500"
        />
        <MetricCard
          title="Avg Handle Time"
          value={`${metrics.avgHandleTime}m`}
          change={-8.2}
          icon={Clock}
          iconColor="text-yellow-500"
          subtitle="Average call duration"
        />
        <MetricCard
          title="Satisfaction"
          value={metrics.satisfaction}
          change={6.1}
          icon={Smile}
          iconColor="text-purple-500"
          subtitle="Out of 5.0"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hourly Call Distribution */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Call Volume by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyDistribution}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorCalls)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Intent Distribution */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Top Call Intents</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={intentData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="intent" type="category" stroke="#9ca3af" width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  onClick={(data) => setSelectedIntent(data.intent)}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Success Trend */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Weekly Call Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="successful" stackId="a" fill="#10b981" name="Successful" />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Customer Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfaction Trend */}
        <Card className="p-6 lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Satisfaction Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="satisfaction"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Satisfaction Score"
                  dot={{ fill: '#8b5cf6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls Table */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Recent Bot Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Call ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Intent</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Duration</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Sentiment</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'CALL-8472', intent: 'Schedule Service', duration: '3:24', status: 'Completed', sentiment: 'Positive' },
                  { id: 'CALL-8471', intent: 'Get Quote', duration: '2:15', status: 'Completed', sentiment: 'Positive' },
                  { id: 'CALL-8470', intent: 'Check Status', duration: '1:42', status: 'Completed', sentiment: 'Neutral' },
                  { id: 'CALL-8469', intent: 'Billing Inquiry', duration: '4:56', status: 'Completed', sentiment: 'Neutral' },
                  { id: 'CALL-8468', intent: 'Schedule Service', duration: '0:34', status: 'Failed', sentiment: 'Negative' },
                ].map((call) => (
                  <tr key={call.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-white font-mono text-sm">{call.id}</td>
                    <td className="py-3 px-4 text-gray-300">{call.intent}</td>
                    <td className="py-3 px-4 text-gray-300">{call.duration}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          call.status === 'Completed'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {call.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          call.sentiment === 'Positive'
                            ? 'bg-green-500/10 text-green-500'
                            : call.sentiment === 'Neutral'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {call.sentiment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Intent Drill-down Panel */}
      <DrillDownPanel
        isOpen={selectedIntent !== null}
        onClose={() => setSelectedIntent(null)}
        title={`Intent Analysis: ${selectedIntent}`}
      >
        <DrillDownSection title="Performance Metrics">
          <DrillDownItem label="Total Calls" value="324" />
          <DrillDownItem label="Success Rate" value="94%" />
          <DrillDownItem label="Avg Handle Time" value="3:12" />
          <DrillDownItem label="Customer Satisfaction" value="4.8/5.0" />
        </DrillDownSection>

        <DrillDownSection title="Common Responses">
          <div className="space-y-3">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Response 1</p>
              <p className="text-white">"I'd be happy to help you schedule a service..."</p>
              <p className="text-xs text-gray-500 mt-2">Used 142 times</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Response 2</p>
              <p className="text-white">"Let me check our available time slots..."</p>
              <p className="text-xs text-gray-500 mt-2">Used 98 times</p>
            </div>
          </div>
        </DrillDownSection>
      </DrillDownPanel>
    </div>
  )
}
