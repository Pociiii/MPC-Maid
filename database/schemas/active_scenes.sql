CREATE TABLE IF NOT EXISTS active_scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_type TEXT NOT NULL CHECK (scene_type IN ('porn', 'custom')),
    status TEXT NOT NULL DEFAULT 'running'
        CHECK (status IN ('running', 'finalizing', 'completed', 'failed')),
    channel_id TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    target_id TEXT,
    category TEXT NOT NULL,
    parts_json TEXT NOT NULL,
    result_json TEXT,
    title TEXT NOT NULL,
    author_json TEXT NOT NULL,
    color TEXT,
    interval_ms INTEGER NOT NULL,
    next_part_index INTEGER NOT NULL DEFAULT 0,
    scene_links_json TEXT NOT NULL DEFAULT '[]',
    next_part_at INTEGER NOT NULL,
    rewards_applied INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_active_scenes_restore
ON active_scenes(status, next_part_at);

CREATE INDEX IF NOT EXISTS idx_active_scenes_users
ON active_scenes(scene_type, owner_id, target_id, status);
