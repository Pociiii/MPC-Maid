CREATE TABLE IF NOT EXISTS relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_a_id TEXT NOT NULL,
    user_b_id TEXT NOT NULL,
    type TEXT NOT NULL,
    started_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_relationships_unique
ON relationships(type, user_a_id, user_b_id);

CREATE INDEX IF NOT EXISTS idx_relationships_user_a
ON relationships(user_a_id);

CREATE INDEX IF NOT EXISTS idx_relationships_user_b
ON relationships(user_b_id);

CREATE TABLE IF NOT EXISTS relationship_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    type TEXT NOT NULL,
    started_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_relationship_requests_target
ON relationship_requests(target_id, status);

CREATE INDEX IF NOT EXISTS idx_relationship_requests_pair
ON relationship_requests(requester_id, target_id, type, status);
