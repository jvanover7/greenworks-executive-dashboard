# MCP (Model Context Protocol) Integration Guide

## Overview

The Greenworks Executive Dashboard supports integration with MCP servers to fetch data from various sources. MCP allows you to connect to:

- CRM systems (Salesforce, HubSpot, etc.)
- Phone systems (Twilio, RingCentral, etc.)
- Analytics platforms (Google Analytics, Mixpanel, etc.)
- Custom data sources

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# MCP Server Configuration
VITE_MCP_SERVER_URL=http://localhost:3001
VITE_MCP_AUTH_TOKEN=your-auth-token-here
```

### Setting Up an MCP Server

1. **Install MCP SDK** (if creating a custom server):

```bash
npm install @modelcontextprotocol/sdk
```

2. **Create an MCP Server** (example):

```typescript
// mcp-server/index.ts
import { Server } from '@modelcontextprotocol/sdk/server';

const server = new Server({
  name: 'greenworks-data-server',
  version: '1.0.0',
});

// Define tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'get_call_metrics',
      description: 'Fetch call metrics from phone system',
      inputSchema: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
        },
      },
    },
    {
      name: 'get_inspection_data',
      description: 'Fetch inspection data from database',
      inputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
        },
      },
    },
  ],
}));

// Implement tool handlers
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'get_call_metrics') {
    // Fetch from your phone system API
    const metrics = await fetchCallMetrics(args.startDate, args.endDate);
    return { content: [{ type: 'text', text: JSON.stringify(metrics) }] };
  }

  if (name === 'get_inspection_data') {
    // Fetch from your database
    const inspections = await fetchInspections(args.status);
    return { content: [{ type: 'text', text: JSON.stringify(inspections) }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

3. **Start the MCP Server**:

```bash
node mcp-server/index.ts
```

## Using MCP in the Dashboard

### Fetching Data from MCP

```typescript
import { mcpClient } from '../utils/mcp';

// Call a tool
const metrics = await mcpClient?.callTool('get_call_metrics', {
  startDate: '2025-10-01',
  endDate: '2025-10-20',
});

// List available tools
const tools = await mcpClient?.listTools();
```

### Data Source Configuration

Create data sources in your database or config:

```typescript
const dataSources: DataSource[] = [
  {
    id: 'phone-system',
    name: 'Phone System',
    type: 'mcp',
    mcpServer: 'get_call_metrics',
    enabled: true,
  },
  {
    id: 'inspection-db',
    name: 'Inspection Database',
    type: 'mcp',
    mcpServer: 'get_inspection_data',
    enabled: true,
  },
  {
    id: 'crm-api',
    name: 'CRM System',
    type: 'api',
    endpoint: 'https://api.yourcrm.com/metrics',
    enabled: true,
  },
];
```

## Example Integrations

### Twilio Phone System

```typescript
// MCP tool to fetch Twilio call data
async function getTwilioMetrics(startDate: string, endDate: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const client = require('twilio')(accountSid, authToken);

  const calls = await client.calls.list({
    startTimeAfter: new Date(startDate),
    startTimeBefore: new Date(endDate),
  });

  return {
    totalCalls: calls.length,
    missedCalls: calls.filter(c => c.status === 'no-answer').length,
    avgDuration: calls.reduce((sum, c) => sum + c.duration, 0) / calls.length,
  };
}
```

### Salesforce CRM

```typescript
// MCP tool to fetch Salesforce opportunities
async function getSalesforceOpportunities() {
  const jsforce = require('jsforce');
  const conn = new jsforce.Connection({
    loginUrl: process.env.SALESFORCE_LOGIN_URL,
  });

  await conn.login(
    process.env.SALESFORCE_USERNAME,
    process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_TOKEN
  );

  const result = await conn.query(`
    SELECT Id, Name, StageName, Amount, CloseDate
    FROM Opportunity
    WHERE CloseDate >= THIS_MONTH
  `);

  return {
    totalOpportunities: result.totalSize,
    pipelineValue: result.records.reduce((sum, r) => sum + r.Amount, 0),
  };
}
```

### Custom Database

```typescript
// MCP tool to fetch inspection data from PostgreSQL
async function getInspectionMetrics(status?: string) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const query = status
    ? 'SELECT * FROM inspections WHERE status = $1'
    : 'SELECT * FROM inspections';

  const result = await pool.query(query, status ? [status] : []);

  return {
    totalInspections: result.rows.length,
    inspections: result.rows,
  };
}
```

## Testing MCP Integration

1. **Test MCP Server**:

```bash
# List available tools
curl http://localhost:3001/tools

# Call a tool
curl -X POST http://localhost:3001/tools/get_call_metrics \
  -H "Content-Type: application/json" \
  -d '{"params": {"startDate": "2025-10-01", "endDate": "2025-10-20"}}'
```

2. **Test in Dashboard**:

```typescript
// In your component
useEffect(() => {
  async function fetchData() {
    const metrics = await mcpClient?.callTool('get_call_metrics', {
      startDate: '2025-10-01',
      endDate: '2025-10-20',
    });

    console.log('Metrics:', metrics);
  }

  fetchData();
}, []);
```

## Best Practices

1. **Error Handling**: Always wrap MCP calls in try-catch blocks
2. **Caching**: Cache MCP responses to reduce API calls
3. **Rate Limiting**: Implement rate limiting for external APIs
4. **Authentication**: Use secure tokens and environment variables
5. **Monitoring**: Log MCP calls and responses for debugging

## Troubleshooting

### MCP Server Not Found

- Check that `VITE_MCP_SERVER_URL` is set correctly
- Verify the MCP server is running
- Check network connectivity

### Tool Call Failures

- Verify tool name matches server configuration
- Check authentication token
- Review tool parameters match schema

### Data Format Issues

- Ensure MCP server returns expected data format
- Add data validation and transformation
- Handle missing or null values gracefully

## Support

For more information on MCP:
- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
