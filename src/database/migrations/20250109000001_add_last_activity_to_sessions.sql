-- Migration: add_last_activity_to_sessions
-- Created: 2025-01-09T00:00:01.000Z
-- Description: Add last_activity column to sessions table for tracking session usage

-- Add last_activity column to sessions table
ALTER TABLE sessions ADD COLUMN last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index on last_activity for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);

-- Update existing sessions to have last_activity set to their created_at time
UPDATE sessions SET last_activity = created_at WHERE last_activity IS NULL;
