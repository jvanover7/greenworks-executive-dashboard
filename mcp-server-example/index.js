import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock data generators
function generateCallMetrics(startDate, endDate) {
  return {
    totalCalls: Math.floor(Math.random() * 1000) + 500,
    missedCalls: Math.floor(Math.random() * 50) + 20,
    answeredCalls: Math.floor(Math.random() * 950) + 450,
    avgDuration: Math.floor(Math.random() * 10) + 5,
    salesOpportunities: Math.floor(Math.random() * 100) + 50,
    conversionRate: (Math.random() * 20 + 25).toFixed(1),
    dateRange: { startDate, endDate },
  };
}

function generateInspectionData(status) {
  const inspections = [];
  const count = Math.floor(Math.random() * 50) + 10;

  for (let i = 0; i < count; i++) {
    inspections.push({
      id: `INS-${1000 + i}`,
      category: ['Lawn Care', 'Irrigation', 'Landscaping', 'Tree Service'][Math.floor(Math.random() * 4)],
      location: ['Oak Park', 'Maple Street', 'Pine Grove', 'Elm Avenue'][Math.floor(Math.random() * 4)],
      score: status === 'completed' ? Math.floor(Math.random() * 30) + 70 : 0,
      status: status || ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)],
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return inspections;
}

function generateBotCallData() {
  return {
    totalBotCalls: Math.floor(Math.random() * 500) + 700,
    successfulCalls: Math.floor(Math.random() * 450) + 650,
    failedCalls: Math.floor(Math.random() * 50) + 30,
    avgHandleTime: (Math.random() * 3 + 2).toFixed(1),
    customerSatisfaction: (Math.random() * 0.5 + 4.5).toFixed(1),
    intents: [
      { intent: 'Schedule Service', count: Math.floor(Math.random() * 200) + 200, successRate: 94 },
      { intent: 'Get Quote', count: Math.floor(Math.random() * 150) + 150, successRate: 89 },
      { intent: 'Check Status', count: Math.floor(Math.random() * 100) + 100, successRate: 97 },
    ],
  };
}

// MCP Tool endpoints
app.get('/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'get_call_metrics',
        description: 'Fetch call metrics from phone system',
        inputSchema: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
          },
          required: ['startDate', 'endDate'],
        },
      },
      {
        name: 'get_inspection_data',
        description: 'Fetch inspection data from database',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['pending', 'completed', 'failed'], description: 'Filter by status' },
          },
        },
      },
      {
        name: 'get_bot_call_data',
        description: 'Fetch bot call analytics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  });
});

app.post('/tools/get_call_metrics', (req, res) => {
  const { params } = req.body;
  const { startDate, endDate } = params || {};

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  const metrics = generateCallMetrics(startDate, endDate);
  res.json({ data: metrics });
});

app.post('/tools/get_inspection_data', (req, res) => {
  const { params } = req.body;
  const { status } = params || {};

  const inspections = generateInspectionData(status);
  res.json({ data: inspections });
});

app.post('/tools/get_bot_call_data', (req, res) => {
  const data = generateBotCallData();
  res.json({ data });
});

// Legacy API endpoint for backward compatibility
app.get('/api/metrics', (req, res) => {
  res.json({
    calls: generateCallMetrics('2025-10-01', '2025-10-20'),
    inspections: generateInspectionData(),
    botCalls: generateBotCallData(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
  console.log(`📋 Available tools: http://localhost:${PORT}/tools`);
});
