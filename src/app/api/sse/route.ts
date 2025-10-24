import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const supabase = await createClient()

        // Function to send updates
        const sendUpdate = async () => {
          try {
            // Fetch current KPIs
            const [{ count: todayCalls }, { count: newLeads }, { count: upcomingInspections }] = await Promise.all([
              supabase
                .from('aircall_calls')
                .select('*', { count: 'exact', head: true })
                .gte('started_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
              supabase
                .from('whatconverts_leads')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
              supabase
                .from('inspections')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'scheduled')
                .gte('date', new Date().toISOString()),
            ])

            const kpiData = {
              todayCalls: todayCalls || 0,
              newLeads: newLeads || 0,
              upcomingInspections: upcomingInspections || 0,
              timestamp: new Date().toISOString(),
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(kpiData)}\n\n`))
          } catch (error) {
            console.error('SSE update error:', error)
          }
        }

        // Send initial update
        await sendUpdate()

        // Send updates every 30 seconds
        const interval = setInterval(sendUpdate, 30000)

        // Clean up on close
        req.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      } catch (error) {
        console.error('SSE setup error:', error)
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
