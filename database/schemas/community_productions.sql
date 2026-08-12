CREATE TABLE IF NOT EXISTS community_productions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL DEFAULT 'casting'
        CHECK (status IN ('casting', 'running', 'finalizing', 'completed', 'expired', 'failed')),
    production_type TEXT
        CHECK (production_type IN ('MFM', 'FMF', 'FFF')),
    title TEXT NOT NULL,
    casting_channel_id TEXT NOT NULL,
    casting_message_id TEXT,
    scene_channel_id TEXT NOT NULL,
    slots_json TEXT NOT NULL,
    category TEXT,
    parts_json TEXT NOT NULL,
    next_part_index INTEGER NOT NULL DEFAULT 0,
    scene_links_json TEXT NOT NULL DEFAULT '[]',
    next_part_at INTEGER,
    casting_closes_at INTEGER NOT NULL,
    rewards_json TEXT,
    rewards_applied INTEGER NOT NULL DEFAULT 0,
    color TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_community_productions_restore
ON community_productions(status, next_part_at, casting_closes_at);
