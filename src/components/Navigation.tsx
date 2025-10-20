import { useState } from 'react'
import { LayoutDashboard, ClipboardCheck, Phone, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react'
import { supabaseClient } from '../App'

interface NavigationProps {
  user: any
}

export default function Navigation({ user }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut()
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: ClipboardCheck, label: 'Inspections', active: false },
    { icon: Phone, label: 'Bot Calls', active: false },
    { icon: MessageSquare, label: 'AI Chat', active: false },
  ]

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GW</span>
              </div>
              <span className="text-white font-semibold">Greenworks</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              item.active
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <item.icon size={20} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Profile & Settings */}
      <div className="border-t border-gray-700 p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
          <Settings size={20} />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </button>

        {!isCollapsed && (
          <div className="px-3 py-2 bg-gray-900/50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Signed in as</p>
            <p className="text-sm text-white font-medium truncate">{user?.email}</p>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  )
}
