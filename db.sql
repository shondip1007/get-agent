-- ============================================================================
-- SUPABASE DATABASE SCHEMA: Agentic AI Demo Platform
-- ============================================================================
-- This schema supports:
-- 1. Waitlist management for pre-launch users
-- 2. Anonymous and authenticated user sessions
-- 3. Chat sessions across 4 agent experience centers
-- 4. Message history with AI responses
-- 5. Lead generation tracking
-- 6. Analytics and admin reporting
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For pgvector embeddings

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Agent types matching the 4 experience centers
CREATE TYPE agent_type AS ENUM (
    'sales_agent',
    'customer_support',
    'website_navigator',
    'personal_assistant'
);

-- User status for tracking engagement
CREATE TYPE user_status AS ENUM (
    'anonymous',
    'waitlist',
    'registered',
    'lead_submitted',
    'converted'
);

-- Message role for chat history
CREATE TYPE message_role AS ENUM (
    'user',
    'assistant',
    'system'
);

-- Lead source tracking
CREATE TYPE lead_source AS ENUM (
    'waitlist_form',
    'demo_interaction',
    'direct_contact',
    'other'
);

-- Company size for lead qualification
CREATE TYPE company_size AS ENUM (
    'solo',
    'small_2_10',
    'medium_11_50',
    'large_51_200',
    'enterprise_200_plus'
);

-- ============================================================================
-- TABLE: waitlist_users
-- Purpose: Capture early interest before full platform launch
-- ============================================================================

CREATE TABLE waitlist_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    company_name TEXT,
    company_size company_size,
    interest_area TEXT, -- Which agent they're most interested in
    referral_source TEXT, -- How they heard about us
    metadata JSONB DEFAULT '{}', -- Flexible field for UTM params, etc.
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Engagement tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMPTZ,
    demo_access_granted BOOLEAN DEFAULT FALSE,
    demo_access_granted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_waitlist_email ON waitlist_users(email);
CREATE INDEX idx_waitlist_created_at ON waitlist_users(created_at DESC);
CREATE INDEX idx_waitlist_demo_access ON waitlist_users(demo_access_granted) WHERE demo_access_granted = TRUE;

-- ============================================================================
-- TABLE: users
-- Purpose: Both anonymous demo users and authenticated users
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Supabase Auth integration
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User info (optional for anonymous users)
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    
    -- User type and status
    user_status user_status NOT NULL DEFAULT 'anonymous',
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Session tracking
    session_count INTEGER DEFAULT 0, -- Number of chat sessions created
    total_messages_sent INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    
    -- Conversion tracking
    became_lead_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Browser info, device type, etc.
    preferences JSONB DEFAULT '{}', -- User preferences for UI/UX
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_auth_id ON users(auth_user_id);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_status ON users(user_status);
CREATE INDEX idx_users_anonymous ON users(is_anonymous);
CREATE INDEX idx_users_last_active ON users(last_active_at DESC);

-- ============================================================================
-- TABLE: chat_sessions
-- Purpose: Group messages into sessions per agent/experience center
-- ============================================================================

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User relationship
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Agent context
    agent_type agent_type NOT NULL,
    agent_name TEXT NOT NULL, -- Display name like "Sales Agent - Tech Store"
    
    -- Session metadata
    title TEXT, -- Auto-generated or user-defined session title
    is_active BOOLEAN DEFAULT TRUE,
    message_count INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_response_time_ms INTEGER, -- Average AI response latency
    total_tokens_used INTEGER DEFAULT 0,
    
    -- Conversation quality
    user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    
    -- Context and state
    session_context JSONB DEFAULT '{}', -- Store conversation context, user preferences
    last_user_message TEXT, -- Quick reference to last message
    last_ai_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_sessions_agent ON chat_sessions(agent_type);
CREATE INDEX idx_sessions_active ON chat_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sessions_created ON chat_sessions(created_at DESC);
CREATE INDEX idx_sessions_last_message ON chat_sessions(last_message_at DESC);

-- ============================================================================
-- TABLE: messages
-- Purpose: Store individual chat messages (user & AI responses)
-- ============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Message content
    role message_role NOT NULL,
    content TEXT NOT NULL,
    
    -- AI-specific metadata
    model_used TEXT, -- e.g., "gpt-4", "claude-3-opus"
    tokens_used INTEGER,
    response_time_ms INTEGER, -- Time to first token
    finish_reason TEXT, -- "stop", "length", "content_filter"
    
    -- Message context
    parent_message_id UUID REFERENCES messages(id), -- For threading/context
    sequence_number INTEGER NOT NULL, -- Order in conversation
    
    -- Embeddings for semantic search (pgvector)
    embedding vector(1536), -- OpenAI ada-002 dimension
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Store raw LLM response, tool calls, etc.
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_sequence ON messages(session_id, sequence_number);

-- Vector similarity search index (for semantic search)
CREATE INDEX idx_messages_embedding ON messages USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- ============================================================================
-- TABLE: leads
-- Purpose: Capture lead generation form submissions
-- ============================================================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User relationship (may or may not link to existing user)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Lead information
    full_name TEXT NOT NULL,
    work_email TEXT NOT NULL,
    company_name TEXT,
    company_size company_size,
    job_title TEXT,
    phone_number TEXT,
    
    -- Intent and interest
    desired_agent_type agent_type,
    use_case_description TEXT,
    expected_monthly_volume INTEGER, -- Expected chat volume
    budget_range TEXT,
    timeline TEXT, -- "immediate", "1-3 months", "3-6 months", "exploring"
    
    -- Lead source tracking
    lead_source lead_source NOT NULL DEFAULT 'demo_interaction',
    referral_code TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Qualification
    qualified BOOLEAN DEFAULT FALSE,
    qualification_notes TEXT,
    assigned_to TEXT, -- Sales rep email/ID
    
    -- Follow-up tracking
    contacted BOOLEAN DEFAULT FALSE,
    contacted_at TIMESTAMPTZ,
    meeting_scheduled BOOLEAN DEFAULT FALSE,
    meeting_scheduled_at TIMESTAMPTZ,
    
    -- Conversion
    converted BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ,
    contract_value DECIMAL(10, 2),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_email ON leads(work_email);
CREATE INDEX idx_leads_user ON leads(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_leads_source ON leads(lead_source);
CREATE INDEX idx_leads_qualified ON leads(qualified) WHERE qualified = TRUE;
CREATE INDEX idx_leads_contacted ON leads(contacted);
CREATE INDEX idx_leads_converted ON leads(converted) WHERE converted = TRUE;
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- ============================================================================
-- TABLE: agent_knowledge_base
-- Purpose: Store mock data for agents (e.g., product catalogs, return policies)
-- ============================================================================

CREATE TABLE agent_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Agent relationship
    agent_type agent_type NOT NULL,
    
    -- Knowledge content
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT, -- "product", "policy", "faq", "documentation"
    
    -- Semantic search
    embedding vector(1536),
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Product prices, SKUs, links, etc.
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0, -- For ranking search results
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_knowledge_agent ON agent_knowledge_base(agent_type);
CREATE INDEX idx_knowledge_active ON agent_knowledge_base(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_knowledge_embedding ON agent_knowledge_base USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);


-- Indexes
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- ============================================================================
-- TABLE: system_prompts
-- Purpose: Store and version control agent system prompts
-- ============================================================================

CREATE TABLE system_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Agent relationship
    agent_type agent_type NOT NULL,
    
    -- Prompt content
    prompt_version TEXT NOT NULL, -- "v1.0", "v1.1", etc.
    system_prompt TEXT NOT NULL,
    
    -- Prompt configuration
    temperature DECIMAL(3, 2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 500,
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    
    -- Performance tracking
    avg_satisfaction_rating DECIMAL(3, 2),
    total_uses INTEGER DEFAULT 0,
    
    -- Metadata
    notes TEXT, -- Why this version was created
    created_by TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_prompts_agent ON system_prompts(agent_type);
CREATE INDEX idx_prompts_active ON system_prompts(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_updated_at BEFORE UPDATE ON agent_knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON system_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment user message count and session count
CREATE OR REPLACE FUNCTION increment_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'user' THEN
        UPDATE users
        SET 
            total_messages_sent = total_messages_sent + 1,
            last_active_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_user_message_count AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION increment_user_stats();

-- Function to update session message count and last message timestamp
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions
    SET 
        message_count = message_count + 1,
        last_message_at = NOW(),
        last_user_message = CASE 
            WHEN NEW.role = 'user' THEN NEW.content 
            ELSE last_user_message 
        END,
        last_ai_message = CASE 
            WHEN NEW.role = 'assistant' THEN NEW.content 
            ELSE last_ai_message 
        END
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_message_stats AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_session_stats();

-- Function to increment user session count when a new session is created
CREATE OR REPLACE FUNCTION increment_session_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET session_count = session_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_user_session_count AFTER INSERT ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION increment_session_count();

-- Function to update user status to 'lead_submitted' when lead is created
CREATE OR REPLACE FUNCTION update_user_to_lead()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NOT NULL THEN
        UPDATE users
        SET 
            user_status = 'lead_submitted',
            became_lead_at = NOW()
        WHERE id = NEW.user_id AND user_status != 'converted';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_as_lead AFTER INSERT ON leads
    FOR EACH ROW EXECUTE FUNCTION update_user_to_lead();



-- ============================================================================
-- GRANTS & PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_sessions TO authenticated;
GRANT SELECT, INSERT ON messages TO authenticated;
GRANT INSERT ON leads TO authenticated;
GRANT SELECT ON agent_knowledge_base TO authenticated;
GRANT SELECT ON system_prompts TO authenticated;

-- Grant permissions to anonymous users (for demo access)
GRANT SELECT, INSERT, UPDATE ON users TO anon;
GRANT SELECT, INSERT, UPDATE ON chat_sessions TO anon;
GRANT SELECT, INSERT ON messages TO anon;
GRANT INSERT ON waitlist_users TO anon;
GRANT INSERT ON leads TO anon;
GRANT SELECT ON agent_knowledge_base TO anon;
GRANT SELECT ON system_prompts TO anon;

