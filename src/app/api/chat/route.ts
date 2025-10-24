import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import * as aircall from '@/lib/connectors/aircall'
import * as whatconverts from '@/lib/connectors/whatconverts'
import * as isn from '@/lib/connectors/isn'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages, useLiveConnectors = false, sessionId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Build system prompt with context
    let systemPrompt = `You are a helpful AI assistant for Greenworks, a company that manages inspections, sites, engineers, and work orders.
You have access to data about:
- Inspections and their statuses
- Sites and customer information
- Engineers and their assignments
- Work orders and costs
- Call logs from Aircall
- Leads from WhatConverts
- Inspection data from ISN

Provide concise, accurate answers based on the available data. When citing specific data, include relevant IDs or references.`

    // If live connectors are enabled, fetch recent data
    if (useLiveConnectors) {
      try {
        const [calls, leads, inspections] = await Promise.all([
          aircall.listCalls(new Date(Date.now() - 24 * 60 * 60 * 1000)).catch(() => []),
          whatconverts.listLeads(new Date(Date.now() - 24 * 60 * 60 * 1000)).catch(() => []),
          isn.listInspections(new Date(Date.now() - 24 * 60 * 60 * 1000)).catch(() => []),
        ])

        systemPrompt += `\n\nRecent live data (last 24 hours):
- Calls: ${calls.length} total
- Leads: ${leads.length} total
- ISN Inspections: ${inspections.length} total`
      } catch (error) {
        console.error('Error fetching live data:', error)
      }
    } else {
      // Query database for context
      const { data: recentInspections } = await supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentInspections && recentInspections.length > 0) {
        systemPrompt += `\n\nRecent inspections in database: ${recentInspections.length}`
      }
    }

    // Stream response from Claude
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    })

    // Create a ReadableStream for the response
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }

          // Save message to database if sessionId provided
          if (sessionId) {
            const userMessage = messages[messages.length - 1].content
            const fullResponse = await stream.finalMessage()
            const assistantMessage = fullResponse.content
              .filter((block: any) => block.type === 'text')
              .map((block: any) => block.text)
              .join('')

            await supabase.from('chat_messages').insert([
              { session_id: sessionId, role: 'user', content: userMessage },
              { session_id: sessionId, role: 'assistant', content: assistantMessage },
            ])
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
