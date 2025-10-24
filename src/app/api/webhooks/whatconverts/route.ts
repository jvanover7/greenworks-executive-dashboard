import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as whatconverts from '@/lib/connectors/whatconverts'

export async function POST(req: NextRequest) {
  try {
    // Verify webhook token
    const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-whatconverts-token') || ''
    if (!whatconverts.verifyWebhook(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    const supabase = await createServiceClient()

    // WhatConverts sends lead data directly
    const lead = payload
    await supabase.from('whatconverts_leads').upsert(
      {
        id: lead.lead_id,
        source: lead.lead_source,
        medium: lead.lead_medium,
        campaign: lead.lead_campaign,
        keyword: lead.lead_keyword,
        caller_number: lead.caller_number,
        email: lead.contact_email,
        conversion_type: lead.lead_type,
        revenue: lead.lead_value,
        created_at: new Date(lead.date_created).toISOString(),
        raw: lead,
      },
      { onConflict: 'id' }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('WhatConverts webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
