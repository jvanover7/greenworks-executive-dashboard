# API Integrations Guide

This document explains how to integrate your executive dashboard with real data sources.

## Overview

The dashboard supports multiple data sources:
- **Aircall** - Call center data and analytics
- **ElevenLabs** - AI voice agent and bot call analytics
- **ISN** - Inspection management and tracking
- **Supabase (via MCP)** - Data storage and authentication
- **Vercel (via MCP)** - Deployment analytics

## Quick Start

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your API credentials to `.env`

3. Restart your development server:
```bash
npm run dev
```

The dashboard will automatically detect which APIs are configured and use real data when available, falling back to mock data for unconfigured services.

---

## Aircall Integration

### What is Aircall?
Aircall is a cloud-based call center solution that provides call analytics, recording, and management features.

### Setup Steps

1. **Get API Credentials**:
   - Log in to your Aircall dashboard
   - Navigate to: Settings → Integrations → API Keys
   - Create a new API key
   - Copy your API ID and API Token

2. **Configure Environment Variables**:
```env
VITE_AIRCALL_API_ID=your-aircall-api-id
VITE_AIRCALL_API_TOKEN=your-aircall-api-token
```

3. **Restart the Dashboard**:
```bash
npm run dev
```

### Data Provided
- Total calls count
- Missed calls
- Answered calls
- Average call duration
- Call trends over time
- Call sources and distribution
- Sales opportunities (from call tags)

### API Documentation
https://developer.aircall.io/api-references/

---

## ElevenLabs Integration

### What is ElevenLabs?
ElevenLabs provides AI voice agents and conversational AI for automated customer interactions.

### Setup Steps

1. **Get API Key**:
   - Log in to ElevenLabs
   - Go to: Settings → API Keys
   - Generate a new API key
   - Copy the key

2. **Configure Environment Variables**:
```env
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

3. **Restart the Dashboard**:
```bash
npm run dev
```

### Data Provided
- Total bot calls
- Successful vs failed calls
- Average handle time
- Customer satisfaction scores
- Intent recognition metrics
- Hourly call distribution
- Conversation transcripts
- Sentiment analysis

### API Documentation
https://elevenlabs.io/docs/api-reference/

---

## ISN Integration

### What is ISN?
ISN (Inspection Support Network) is a inspection scheduling and management platform.

### Setup Steps

1. **Get API Credentials**:
   - Log in to your ISN account
   - Navigate to: Settings → API Access
   - Generate API key
   - Find your Company ID

2. **Configure Environment Variables**:
```env
VITE_ISN_API_KEY=your-isn-api-key
VITE_ISN_COMPANY_ID=your-company-id
```

3. **Restart the Dashboard**:
```bash
npm run dev
```

### Data Provided
- Total inspections
- Completed inspections
- Pending inspections
- Average quality scores
- Failure rates
- Category performance
- Inspector performance metrics
- Inspection trends over time

### API Documentation
https://www.isn.com/resources/isn-api-documentation

---

## MCP Integration (Supabase & Vercel)

### What is MCP?
Model Context Protocol (MCP) allows you to connect to services like Supabase and Vercel through a unified interface.

### Setup with rube.app

1. **Access rube.app MCP Server**:
   - Your rube.app MCP server provides access to Supabase and Vercel
   - Get the MCP server URL from rube.app
   - Get authentication token

2. **Configure Environment Variables**:
```env
VITE_MCP_SERVER_URL=https://your-rube-app-mcp-url
VITE_MCP_AUTH_TOKEN=your-mcp-auth-token
```

3. **Restart the Dashboard**:
```bash
npm run dev
```

### Available MCP Tools

#### Supabase Tools
- `supabase_query` - Run custom SQL queries
- `supabase_get_table` - Fetch data from tables
- `supabase_insert` - Insert data
- `supabase_update` - Update data
- `supabase_delete` - Delete data
- `supabase_get_metrics` - Get aggregated metrics

#### Vercel Tools
- `vercel_get_deployment` - Get deployment info
- `vercel_get_analytics` - Get project analytics
- `vercel_get_env_vars` - Get environment variables
- `vercel_trigger_deployment` - Trigger new deployment

### Example Usage

```typescript
import { mcpClient } from './utils/mcp'

// Query Supabase
const metrics = await mcpClient?.runSupabaseQuery('SELECT * FROM metrics WHERE date > ?', ['2025-01-01'])

// Get Vercel analytics
const analytics = await mcpClient?.getVercelAnalytics('your-project-id', {
  start: '2025-01-01',
  end: '2025-01-31'
})
```

---

## Data Flow

### How Data is Fetched

1. **Data Aggregator** (`src/utils/dataAggregator.ts`):
   - Combines data from all sources
   - Handles caching (30-second cache)
   - Falls back to mock data if APIs unavailable
   - Stores metrics in Supabase via MCP

2. **Individual Clients**:
   - `aircall.ts` - Aircall API calls
   - `elevenlabs.ts` - ElevenLabs API calls
   - `isn.ts` - ISN API calls
   - `mcp.ts` - MCP tool calls

3. **Dashboard Components**:
   - Use `fetchAllMetrics()` to get aggregated data
   - Auto-refresh every 30 seconds
   - Display loading states
   - Handle errors gracefully

### Data Flow Diagram

```
┌─────────────┐
│  Aircall    │────┐
└─────────────┘    │
                   │
┌─────────────┐    │    ┌──────────────┐    ┌───────────┐
│ ElevenLabs  │────┼───→│ Data         │───→│ Dashboard │
└─────────────┘    │    │ Aggregator   │    │ Component │
                   │    └──────────────┘    └───────────┘
┌─────────────┐    │           │
│     ISN     │────┘           │
└─────────────┘                ↓
                    ┌──────────────────┐
                    │ Supabase via MCP │
                    │  (Data Storage)  │
                    └──────────────────┘
```

---

## Testing Your Integration

### Check Data Source Status

Open your browser console and run:
```javascript
import { getDataSourceStatus } from './utils/dataAggregator'
const status = getDataSourceStatus()
console.log(status)
```

Expected output:
```json
{
  "aircall": {
    "available": true,
    "configured": true
  },
  "elevenlabs": {
    "available": true,
    "configured": true
  },
  "isn": {
    "available": true,
    "configured": true
  },
  "mcp": {
    "available": true,
    "configured": true
  }
}
```

### Test Individual APIs

```javascript
// Test Aircall
import { aircallClient } from './utils/aircall'
const calls = await aircallClient?.getCallMetrics()

// Test ElevenLabs
import { elevenLabsClient } from './utils/elevenlabs'
const botCalls = await elevenLabsClient?.getBotCallMetrics()

// Test ISN
import { isnClient } from './utils/isn'
const inspections = await isnClient?.getInspectionMetrics()

// Test MCP
import { mcpClient } from './utils/mcp'
const tools = await mcpClient?.listTools()
```

---

## Troubleshooting

### "Client not available" Warnings

**Cause**: API credentials not configured or invalid

**Solution**:
1. Check `.env` file has correct credentials
2. Ensure all required variables are set
3. Restart development server
4. Check browser console for specific errors

### API Request Failures

**Cause**: Invalid credentials, network issues, or API limits

**Solution**:
1. Verify credentials in respective dashboards
2. Check API rate limits
3. Review network requests in browser DevTools
4. Check CORS settings if running locally

### Mock Data Still Showing

**Cause**: APIs not configured or failed to fetch

**Solution**:
1. Dashboard uses mock data as fallback
2. Check console for API errors
3. Verify environment variables are loaded
4. Use `getDataSourceStatus()` to check configuration

### MCP Connection Issues

**Cause**: MCP server URL incorrect or server not running

**Solution**:
1. Verify MCP server URL in `.env`
2. Test MCP server endpoint directly
3. Check authentication token
4. Ensure MCP server is running

---

## Best Practices

1. **API Keys Security**:
   - Never commit `.env` file to git
   - Use environment variables in production
   - Rotate API keys regularly
   - Use read-only keys when possible

2. **Rate Limiting**:
   - Dashboard caches data for 30 seconds
   - Adjust refresh interval if needed
   - Monitor API usage in provider dashboards

3. **Error Handling**:
   - Dashboard falls back to mock data on errors
   - Check console for error messages
   - Monitor Supabase logs for MCP errors

4. **Performance**:
   - Data is cached for 30 seconds
   - Multiple API calls run in parallel
   - Failed APIs don't block others

---

## Support

### API Documentation Links
- Aircall: https://developer.aircall.io/
- ElevenLabs: https://elevenlabs.io/docs/
- ISN: https://www.isn.com/resources/
- Supabase: https://supabase.com/docs/
- Vercel: https://vercel.com/docs/

### Getting Help
1. Check API provider documentation
2. Review browser console for errors
3. Test API credentials directly
4. Contact API provider support if needed
