import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Dashboard from './components/Dashboard'
import Authentication from './components/Authentication'
import Navigation from './components/Navigation'

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY

export const supabaseClient = createClient(supabaseUrl, supabaseKey)

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check for authenticated user
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>
  if (!user) return <Authentication />

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Navigation user={user} />
      <div className="flex-1 overflow-y-auto">
        <Dashboard user={user} />
      </div>
    </div>
  )
}

export default App
