-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID,
  engineer_id UUID,
  date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  score NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  customer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create engineers table
CREATE TABLE IF NOT EXISTS engineers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create work_orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id),
  opened_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  cost NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table with vector embeddings
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  vector VECTOR(1536),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create aircall_calls table
CREATE TABLE IF NOT EXISTS aircall_calls (
  id TEXT PRIMARY KEY,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT,
  to_number TEXT,
  agent_id TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration INT,
  status TEXT NOT NULL,
  recording_url TEXT,
  raw JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create aircall_sms table
CREATE TABLE IF NOT EXISTS aircall_sms (
  id TEXT PRIMARY KEY,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT,
  to_number TEXT,
  body TEXT,
  status TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  raw JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create whatconverts_leads table
CREATE TABLE IF NOT EXISTS whatconverts_leads (
  id TEXT PRIMARY KEY,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  keyword TEXT,
  caller_number TEXT,
  email TEXT,
  conversion_type TEXT NOT NULL,
  revenue NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  raw JSONB DEFAULT '{}'::JSONB
);

-- Create isn_inspections table
CREATE TABLE IF NOT EXISTS isn_inspections (
  id TEXT PRIMARY KEY,
  site_id UUID REFERENCES sites(id),
  customer TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_engineer TEXT,
  raw JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create etl_runs table for tracking data sync
CREATE TABLE IF NOT EXISTS etl_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  run_started TIMESTAMPTZ NOT NULL,
  run_finished TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  details JSONB DEFAULT '{}'::JSONB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(date DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_site_id ON inspections(site_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_site_id ON work_orders(site_id);
CREATE INDEX IF NOT EXISTS idx_documents_vector ON documents USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_aircall_calls_started_at ON aircall_calls(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatconverts_leads_created_at ON whatconverts_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_isn_inspections_scheduled_at ON isn_inspections(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_etl_runs_source_started ON etl_runs(source, run_started DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircall_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircall_sms ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatconverts_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE isn_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - authenticated users can read, admins can write)
-- For production, implement org-based filtering

-- Allow authenticated users to read all data
CREATE POLICY "Allow read access to authenticated users" ON inspections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON sites FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON engineers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON work_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON chat_sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON chat_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON aircall_calls FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON aircall_sms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON whatconverts_leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON isn_inspections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users" ON etl_runs FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can do everything (for ETL and vector operations)
-- This is handled by using the service role key in backend operations
