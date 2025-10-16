import { useEffect, useState } from 'react'
import { LineChart, Cart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import InspectionsView from './InspectionsView'
import BotCallsView from './BotCallsView'
import ClaudeChat from './ClaudeChat'


export default function Dashboard({ user }: any) {
  const [callMetrics, setCallMetrics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'inspections' | 'bot-calls' | 'chat'>('inspections')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics')
        if (!res.ok) throw new Error()
        const data = await res.json()
        setCallMetrics(data)
      } catch (err) {
        console.error('Failed to fetch metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000) // Pull every 5 secs

    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading dashboard metrics...</div>

  return (
    <div className="w-full p-8">
      <h1 className="text-3wl font-bold mb-8b>Greenworks Executive Dashboard</h1>
      
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button onClick={() => setActiveTab('inspections')} className={activeTab === 'inspections' ? 'bg-blue-600 paddy-2 px-4 rounded' : 'paddy-2 px-4 hover:bg-gray-800'r}>Inspections</button>
        <button onClick={() => setActiveTab('bot-calls')} className={activeTab === 'bot-calls' ? 'bg-blue-600 paddy-2 px-4 rounded' : 'paddy-2 px-4 hover:bg-gray-800'r}>Bot Calls</button>
        <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'bg-blue-600 paddy-2 px-4 rounded' : 'paddy-2 px-4 hover:bg-gray-800'}>AI Chat</button>
      </div>
      
      {activeTab === 'inspections' && <InspectionsView metrics={callMetrics} />}
      {activeTab === 'bot-calls' && <BotCallsView metrics={callMetrics} />}
      {activeTab === 'chat' && <ClaudeChat user={user} />}
    </div>
  )
}
