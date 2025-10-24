import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as aircall from '@/lib/connectors/aircall'
import * as whatconverts from '@/lib/connectors/whatconverts'
import * as isn from '@/lib/connectors/isn'

export async function POST(req: NextRequest) {
  try {
    const { source } = await req.json()

    const supabase = await createServiceClient()

    // Create ETL run record
    const { data: etlRun } = await supabase
      .from('etl_runs')
      .insert({
        source: source || 'all',
        run_started: new Date().toISOString(),
        status: 'running',
      })
      .select()
      .single()

    const results: any = {
      calls: 0,
      messages: 0,
      leads: 0,
      inspections: 0,
      errors: [],
    }

    try {
      // Fetch last successful run for watermark
      const { data: lastRun } = await supabase
        .from('etl_runs')
        .select('run_finished')
        .eq('source', source || 'all')
        .eq('status', 'success')
        .order('run_finished', { ascending: false })
        .limit(1)
        .single()

      const updatedSince = lastRun?.run_finished ? new Date(lastRun.run_finished) : undefined

      // Ingest Aircall data
      if (!source || source === 'all' || source === 'aircall') {
        try {
          const [calls, messages] = await Promise.all([
            aircall.listCalls(updatedSince),
            aircall.listMessages(updatedSince),
          ])

          if (calls.length > 0) {
            const callsData = calls.map((call) => ({
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
            }))

            await supabase.from('aircall_calls').upsert(callsData, { onConflict: 'id' })
            results.calls = calls.length
          }

          if (messages.length > 0) {
            const messagesData = messages.map((msg) => ({
              id: msg.id.toString(),
              direction: msg.direction,
              from_number: msg.from,
              to_number: msg.to,
              body: msg.content,
              status: msg.status,
              sent_at: new Date(msg.sent_at * 1000).toISOString(),
              raw: msg,
            }))

            await supabase.from('aircall_sms').upsert(messagesData, { onConflict: 'id' })
            results.messages = messages.length
          }
        } catch (error: any) {
          results.errors.push(`Aircall: ${error.message}`)
        }
      }

      // Ingest WhatConverts data
      if (!source || source === 'all' || source === 'whatconverts') {
        try {
          const leads = await whatconverts.listLeads(updatedSince)

          if (leads.length > 0) {
            const leadsData = leads.map((lead) => ({
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
            }))

            await supabase.from('whatconverts_leads').upsert(leadsData, { onConflict: 'id' })
            results.leads = leads.length
          }
        } catch (error: any) {
          results.errors.push(`WhatConverts: ${error.message}`)
        }
      }

      // Ingest ISN data
      if (!source || source === 'all' || source === 'isn') {
        try {
          const inspections = await isn.listInspections(updatedSince)

          if (inspections.length > 0) {
            const inspectionsData = inspections.map((insp) => ({
              id: insp.id,
              customer: insp.customer_name,
              address: `${insp.address || ''} ${insp.city || ''} ${insp.state || ''} ${insp.zip || ''}`.trim(),
              status: insp.status,
              scheduled_at: insp.scheduled_date ? new Date(insp.scheduled_date).toISOString() : null,
              completed_at: insp.completed_date ? new Date(insp.completed_date).toISOString() : null,
              assigned_engineer: insp.inspector_name,
              raw: insp,
            }))

            await supabase.from('isn_inspections').upsert(inspectionsData, { onConflict: 'id' })
            results.inspections = inspections.length
          }
        } catch (error: any) {
          results.errors.push(`ISN: ${error.message}`)
        }
      }

      // Update ETL run status
      await supabase
        .from('etl_runs')
        .update({
          run_finished: new Date().toISOString(),
          status: results.errors.length > 0 ? 'failed' : 'success',
          details: results,
        })
        .eq('id', etlRun.id)

      return NextResponse.json({
        success: true,
        etl_run_id: etlRun.id,
        results,
      })
    } catch (error: any) {
      // Update ETL run status
      await supabase
        .from('etl_runs')
        .update({
          run_finished: new Date().toISOString(),
          status: 'failed',
          details: { error: error.message },
        })
        .eq('id', etlRun.id)

      throw error
    }
  } catch (error: any) {
    console.error('Ingest API error:', error)
    return NextResponse.json(
      { error: 'Ingest failed', message: error.message },
      { status: 500 }
    )
  }
}
