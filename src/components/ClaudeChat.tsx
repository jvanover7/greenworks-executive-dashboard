import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { Card } from './ui/Card'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ClaudeChat({ user }: any) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI assistant for the Greenworks Executive Dashboard. I can help you analyze your data, answer questions about your metrics, and provide insights. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response - In production, this would call Claude API
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('calls') || lowerQuery.includes('phone')) {
      return "Based on your current metrics, you have 1,247 total calls with a 3.4% miss rate. Your answered calls show a strong conversion rate of 34.2%. I notice your peak call times are between 2pm-4pm. Would you like me to analyze the missed calls in more detail or suggest ways to improve your answer rate?"
    } else if (lowerQuery.includes('inspection')) {
      return "Your inspection metrics are performing well with 342 total inspections and an average quality score of 89.5. The failure rate is at 6.4%, which is below industry average. Lawn Care category has the highest volume with 142 inspections and a 94% pass rate. Would you like to see a breakdown by category or timeframe?"
    } else if (lowerQuery.includes('bot') || lowerQuery.includes('ai')) {
      return "Your bot calls are showing excellent performance with 963 total calls and a 93.3% success rate. Customer satisfaction is at 4.7/5.0. The most common intent is 'Schedule Service' with 324 calls and a 94% success rate. Average handle time is 3.2 minutes. Would you like recommendations for improving bot performance?"
    } else if (lowerQuery.includes('revenue') || lowerQuery.includes('sales')) {
      return "You currently have 89 sales opportunities with a total pipeline value of $127,500. Your average deal size is $1,433 with an expected close rate of 34.2%. New opportunities are coming primarily from phone calls (68%) and website inquiries (23%). Would you like me to analyze your conversion funnel or suggest ways to increase your close rate?"
    } else if (lowerQuery.includes('help')) {
      return "I can help you with:\n\n• Analyzing call metrics and patterns\n• Reviewing inspection performance\n• Understanding bot call analytics\n• Sales and revenue insights\n• Identifying trends and opportunities\n• Making data-driven recommendations\n\nJust ask me about any specific metric or request an analysis!"
    } else {
      return "I understand you're asking about your dashboard data. I have access to all your metrics including calls, inspections, bot performance, and sales data. Could you be more specific about what you'd like to know? For example, you could ask about call trends, inspection scores, bot performance, or sales opportunities."
    }
  }

  const quickPrompts = [
    "What's my call performance this week?",
    "Show me inspection trends",
    "How are bot calls performing?",
    "What are my top sales opportunities?",
  ]

  return (
    <div className="w-full p-8 bg-gray-900 min-h-screen flex flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Sparkles className="text-purple-500" size={40} />
          AI Assistant
        </h1>
        <p className="text-gray-400">Ask questions about your data and get instant insights</p>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'assistant'
                    ? 'bg-purple-600'
                    : 'bg-blue-600'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Bot size={20} className="text-white" />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </div>

              <div
                className={`flex-1 max-w-3xl ${
                  message.role === 'user' ? 'flex justify-end' : ''
                }`}
              >
                <div
                  className={`rounded-lg p-4 ${
                    message.role === 'assistant'
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-blue-600'
                  }`}
                >
                  <p className="text-white whitespace-pre-line">{message.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-400 mb-3">Try asking:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="text-left text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-700 p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your dashboard data..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 transition-colors flex items-center gap-2"
            >
              <Send size={20} />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            AI assistant powered by Claude. Responses are generated based on your dashboard data.
          </p>
        </div>
      </Card>
    </div>
  )
}
