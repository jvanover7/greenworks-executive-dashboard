import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { CheckCircle, XCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { MetricCard } from './ui/MetricCard'

export default function InspectionsView() {
  // Mock data - will be replaced with real API data
  const weeklyTrend = [
    { day: 'Mon', completed: 45, pending: 12, score: 87 },
    { day: 'Tue', completed: 52, pending: 8, score: 92 },
    { day: 'Wed', completed: 48, pending: 15, score: 85 },
    { day: 'Thu', completed: 61, pending: 9, score: 90 },
    { day: 'Fri', completed: 55, pending: 11, score: 88 },
    { day: 'Sat', completed: 38, pending: 6, score: 91 },
    { day: 'Sun', completed: 24, pending: 4, score: 89 },
  ]

  const categoryData = [
    { category: 'Lawn Care', count: 142, passRate: 94 },
    { category: 'Irrigation', count: 87, passRate: 88 },
    { category: 'Landscaping', count: 65, passRate: 91 },
    { category: 'Tree Service', count: 48, passRate: 86 },
  ]

  const statusDistribution = [
    { name: 'Completed', value: 278, color: '#10b981' },
    { name: 'Pending', value: 42, color: '#f59e0b' },
    { name: 'Failed', value: 22, color: '#ef4444' },
  ]

  const metrics = {
    total: 342,
    completed: 278,
    pending: 42,
    avgScore: 89.5,
    failureRate: 6.4,
  }

  return (
    <div className="w-full p-8 bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Inspection Analytics</h1>
        <p className="text-gray-400">Comprehensive inspection performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Total Inspections"
          value={metrics.total}
          change={15.2}
          icon={CheckCircle}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Completed"
          value={metrics.completed}
          change={12.8}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Pending"
          value={metrics.pending}
          change={-5.3}
          icon={Clock}
          iconColor="text-yellow-500"
        />
        <MetricCard
          title="Average Score"
          value={metrics.avgScore}
          change={2.1}
          icon={TrendingUp}
          iconColor="text-purple-500"
          subtitle="Out of 100"
        />
        <MetricCard
          title="Failure Rate"
          value={`${metrics.failureRate}%`}
          change={-8.7}
          icon={AlertCircle}
          iconColor="text-red-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Trend Chart */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Weekly Inspection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
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
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Pending"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Inspection Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
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

        {/* Category Performance */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9ca3af" />
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
                <Bar dataKey="count" fill="#3b82f6" name="Total Inspections" />
                <Bar dataKey="passRate" fill="#10b981" name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality Score Trend */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Quality Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[80, 95]} />
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
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Quality Score"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Inspections Table */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Recent Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Location</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Score</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'INS-1247', category: 'Lawn Care', location: 'Oak Park', score: 92, status: 'Completed' },
                  { id: 'INS-1246', category: 'Irrigation', location: 'Maple Street', score: 88, status: 'Completed' },
                  { id: 'INS-1245', category: 'Landscaping', location: 'Pine Grove', score: 95, status: 'Completed' },
                  { id: 'INS-1244', category: 'Tree Service', location: 'Elm Avenue', score: 0, status: 'Pending' },
                  { id: 'INS-1243', category: 'Lawn Care', location: 'Cedar Hills', score: 76, status: 'Failed' },
                ].map((inspection) => (
                  <tr key={inspection.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-white font-mono text-sm">{inspection.id}</td>
                    <td className="py-3 px-4 text-gray-300">{inspection.category}</td>
                    <td className="py-3 px-4 text-gray-300">{inspection.location}</td>
                    <td className="py-3 px-4">
                      <span className={inspection.score >= 85 ? 'text-green-500' : inspection.score >= 70 ? 'text-yellow-500' : 'text-gray-500'}>
                        {inspection.status === 'Pending' ? '-' : inspection.score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          inspection.status === 'Completed'
                            ? 'bg-green-500/10 text-green-500'
                            : inspection.status === 'Pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {inspection.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">2025-10-{20 - Math.floor(Math.random() * 5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
