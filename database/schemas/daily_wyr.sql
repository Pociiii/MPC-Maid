CREATE TABLE IF NOT EXISTS daily_wyr_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_date TEXT NOT NULL UNIQUE,
    question_id TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    channel_id TEXT,
    message_id TEXT,
    thread_id TEXT,
    post_claim_token TEXT,
    post_claimed_at TEXT,
    posted_at TEXT,
    closes_at TEXT NOT NULL,
    closed_at TEXT,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'closed')),
    thread_reply_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_wyr_one_active
ON daily_wyr_sessions(status)
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_daily_wyr_sessions_status_close
ON daily_wyr_sessions(status, closes_at);

CREATE TABLE IF NOT EXISTS daily_wyr_votes (
    session_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('a', 'b')),
    reward_claimed INTEGER DEFAULT 0,
    voted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (session_id, user_id),
    FOREIGN KEY (session_id)
        REFERENCES daily_wyr_sessions(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_daily_wyr_votes_session
ON daily_wyr_votes(session_id);
