import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as isn from '@/lib/connectors/isn'

export async function POST(req: NextRequest) {
  try {
    // Verify webhook token
    const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-isn-token') || ''
    if (!isn.verifyWebhook(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    const supabase = await createServiceClient()

    // ISN sends inspection data
    const inspection = payload
    await supabase.from('isn_inspections').upsert(
      {
        id: inspection.id,
        customer: inspection.customer_name,
        address: `${inspection.address || ''} ${inspection.city || ''} ${inspection.state || ''} ${inspection.zip || ''}`.trim(),
        status: inspection.status,
        scheduled_at: inspection.scheduled_date ? new Date(inspection.scheduled_date).toISOString() : null,
        completed_at: inspection.completed_date ? new Date(inspection.completed_date).toISOString() : null,
        assigned_engineer: inspection.inspector_name,
        raw: inspection,
      },
      { onConflict: 'id' }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('ISN webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
