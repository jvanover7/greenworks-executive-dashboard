import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as aircall from '@/lib/connectors/aircall'

export async function POST(req: NextRequest) {
  try {
    // Verify webhook token
    const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-aircall-token') || ''
    if (!aircall.verifyWebhook(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    const supabase = await createServiceClient()

    // Handle different event types
    if (payload.event === 'call.created' || payload.event === 'call.ended') {
      const call = payload.data
      await supabase.from('aircall_calls').upsert(
        {
          id: call.id.toString(),
          direction: call.direction,
          from_number: call.from,
          to_number: call.to,
          agent_id: call.user?.id?.toString(),
          started_at: new Date(call.started_at * 1000).toISOString(),
          ended_at: call.ended_at ? new Date(call.ended_at * 1000).toISOString() : null,
          duration: call.duration,
          status: call.status,
          recording_url: call.recording,
          raw: call,
        },
        { onConflict: 'id' }
      )
    } else if (payload.event === 'message.sent' || payload.event === 'message.received') {
      const message = payload.data
      await supabase.from('aircall_sms').upsert(
        {
          id: message.id.toString(),
          direction: message.direction,
          from_number: message.from,
          to_number: message.to,
          body: message.content,
          status: message.status,
          sent_at: new Date(message.sent_at * 1000).toISOString(),
          raw: message,
        },
        { onConflict: 'id' }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Aircall webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
