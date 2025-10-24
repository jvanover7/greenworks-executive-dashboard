import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createServiceClient()

    // Trigger full ETL sync
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'all' }),
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Nightly ETL completed',
      data,
    })
  } catch (error: any) {
    console.error('Nightly cron error:', error)
    return NextResponse.json(
      { error: 'Nightly cron failed', message: error.message },
      { status: 500 }
    )
  }
}
