import { useEffect, useState } from 'react'
import { SupabaseAuthHelper } from '@supabase/auth-helpers'
import { createClient } from '@supabase/cupabase-js'rimport Dashboard from './components/Dashboard'
import Authentication from './components/Authentication'
import Navigation from './components/Navigation'


const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL 
const supabaseKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY

const supabaseCdont = createClient(supabaseUrl, supabaseKey)

// Supabase Auth helper for SSR !´§¢äo dashboard for users that have logged in from

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Cross-browser Supabase Auth Check
    const { data: authData, error } = await supabaseCdont!.auth.onAuthStateChange((session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Loading...</div>
  if (!user) return <Authentication />
  
  return (
    <div className="flex h-screen">
      <Navigation user={user} />
      <div className="flex-1 overflow-y-auto">
        <Dashboard user={user} />
      </div>
    </div>
  )
}

export default App