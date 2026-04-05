-- Sentinel Analytics - GIN Index for Full-Text Search
-- This migration optimizes the 'logs' table for heavy text-search workloads.
-- It satisfies Requirement #2: "Database Optimization (Crucial)"

-- 1. Add GIN index on message and stack_trace for fast searching
CREATE INDEX IF NOT EXISTS logs_message_gin_idx ON logs 
USING GIN (to_tsvector('english', message || ' ' || COALESCE(stack_trace, '')));

-- 2. Optional: Add regular indexes for common filters
CREATE INDEX IF NOT EXISTS logs_project_id_idx ON logs (project_id);
CREATE INDEX IF NOT EXISTS logs_level_idx ON logs (level);
CREATE INDEX IF NOT EXISTS logs_timestamp_idx ON logs (timestamp DESC);
