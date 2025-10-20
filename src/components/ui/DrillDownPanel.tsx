import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface DrillDownPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function DrillDownPanel({ isOpen, onClose, title, children }: DrillDownPanelProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-gray-900 shadow-2xl z-50 overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </>
  )
}

interface DrillDownSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function DrillDownSection({ title, children, className = '' }: DrillDownSectionProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}

interface DrillDownItemProps {
  label: string
  value: string | number
  icon?: ReactNode
  className?: string
}

export function DrillDownItem({ label, value, icon, className = '' }: DrillDownItemProps) {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-gray-800 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-gray-400">{icon}</div>}
        <span className="text-gray-300">{label}</span>
      </div>
      <span className="text-white font-semibold">{value}</span>
    </div>
  )
}
