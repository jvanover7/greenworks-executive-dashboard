'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Database, CheckCircle2, XCircle } from 'lucide-react'

export default function DataSourcesPage() {
  const [syncing, setSyncing] = useState<string | null>(null)

  const handleSync = async (source: string) => {
    setSyncing(source)
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
      const data = await response.json()
      console.log('Sync result:', data)
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncing(null)
    }
  }

  const dataSources = [
    {
      name: 'Aircall',
      description: 'Call logs and SMS messages',
      status: 'connected',
      lastSync: '5 minutes ago',
    },
    {
      name: 'WhatConverts',
      description: 'Lead tracking and conversions',
      status: 'connected',
      lastSync: '10 minutes ago',
    },
    {
      name: 'ISN',
      description: 'Inspection data and scheduling',
      status: 'connected',
      lastSync: '15 minutes ago',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Sources</h2>
        <p className="text-muted-foreground">Manage your data integrations and sync status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dataSources.map((source) => (
          <Card key={source.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    {source.name}
                  </CardTitle>
                  <CardDescription>{source.description}</CardDescription>
                </div>
                {source.status === 'connected' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={source.status === 'connected' ? 'success' : 'destructive'}>
                  {source.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last sync</span>
                <span>{source.lastSync}</span>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleSync(source.name.toLowerCase())}
                disabled={syncing === source.name.toLowerCase()}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing === source.name.toLowerCase() ? 'animate-spin' : ''}`} />
                {syncing === source.name.toLowerCase() ? 'Syncing...' : 'Sync Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync All Data Sources</CardTitle>
          <CardDescription>Trigger a full sync of all connected data sources</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleSync('all')}
            disabled={syncing === 'all'}
            size="lg"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing === 'all' ? 'animate-spin' : ''}`} />
            {syncing === 'all' ? 'Syncing All...' : 'Sync All'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
