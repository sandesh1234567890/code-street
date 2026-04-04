-- Sentinel Analytics: PostgreSQL Schema

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS & PROJECTS (Multi-tenancy)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'DEVELOPER', -- ADMIN, MANAGER, DEVELOPER
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    api_key VARCHAR(100) UNIQUE NOT NULL,
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TEAMS & SUB-MODULES (RBAC Hierarchy)
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sub_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ASSOCIATIONS (Many-to-Many)
CREATE TABLE users_teams (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, team_id)
);

CREATE TABLE teams_submodules (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    sub_module_id UUID REFERENCES sub_modules(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, sub_module_id)
);

-- 5. ISSUES (Aggregated Errors)
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    fingerprint VARCHAR(255) NOT NULL, -- Hashed stack trace
    level VARCHAR(20) NOT NULL, -- ERROR, FATAL
    occurrence_count BIGINT DEFAULT 1,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, RESOLVED, IGNORED
    UNIQUE(project_id, fingerprint)
);

-- 4. LOGS (Raw Ingestion - Partitioned by Timestamp)
CREATE TABLE logs (
    id UUID DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sub_module_id UUID REFERENCES sub_modules(id),
    issue_id UUID REFERENCES issues(id),
    level VARCHAR(20) NOT NULL, -- TRACE, DEBUG, INFO, WARN, ERROR, FATAL
    message TEXT NOT NULL,
    environment VARCHAR(50) DEFAULT 'production', -- prod, staging, dev
    stack_trace TEXT,
    context JSONB, -- Additional metadata (Device, OS, User ID)
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Example Partition (for April 2026)
CREATE TABLE logs_y2026m04 PARTITION OF logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- 5. INDEXING FOR PERFORMANCE
CREATE INDEX idx_logs_project_timestamp ON logs (project_id, timestamp DESC);
CREATE INDEX idx_logs_fts ON logs USING gin(to_tsvector('english', message)); -- Full-text search
CREATE INDEX idx_issues_project ON issues (project_id);

-- 6. VIEWS & AGGREGATIONS
CREATE VIEW issue_stats AS
SELECT 
    project_id,
    level,
    COUNT(*) as total_occurrences,
    MIN(timestamp) as earliest,
    MAX(timestamp) as latest
FROM logs
GROUP BY project_id, level;
