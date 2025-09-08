-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(8) PRIMARY KEY,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);

-- Create index on expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
