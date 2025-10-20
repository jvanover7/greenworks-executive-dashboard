import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  iconColor?: string
  onClick?: () => void
  subtitle?: string
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-500',
  onClick,
  subtitle
}: MetricCardProps) {
  const changeColor = change && change > 0 ? 'text-green-500' : change && change < 0 ? 'text-red-500' : 'text-gray-400'

  return (
    <div
      className={`metric-card ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {change !== undefined && (
            <p className={`text-sm ${changeColor} flex items-center gap-1`}>
              {change > 0 ? '↑' : change < 0 ? '↓' : '='} {Math.abs(change)}%
              <span className="text-gray-500 text-xs">vs last period</span>
            </p>
          )}
        </div>
        <div className={`${iconColor} p-3 bg-gray-900/50 rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
