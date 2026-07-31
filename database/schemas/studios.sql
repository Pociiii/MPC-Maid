CREATE TABLE IF NOT EXISTS studios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'provisioning'
        CHECK (status IN ('provisioning', 'open', 'closed')),
    display_name TEXT NOT NULL,
    opened_at INTEGER NOT NULL,
    thread_id TEXT UNIQUE,
    overview_message_id TEXT,
    movies_produced INTEGER NOT NULL DEFAULT 0,
    total_viewers INTEGER NOT NULL DEFAULT 0,
    viral_hits INTEGER NOT NULL DEFAULT 0,
    latest_scene_title TEXT,
    latest_scene_at INTEGER,
    closed_at INTEGER,
    last_upkeep_date TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studios_status
ON studios(status);

CREATE TABLE IF NOT EXISTS studio_scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studio_id INTEGER NOT NULL,
    active_scene_id INTEGER NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'running'
        CHECK (status IN ('running', 'completed')),
    title TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    completed_at INTEGER,
    viewers INTEGER,
    outcome TEXT,
    FOREIGN KEY (studio_id) REFERENCES studios(id)
);

CREATE INDEX IF NOT EXISTS idx_studio_scenes_studio
ON studio_scenes(studio_id, status);

CREATE TABLE IF NOT EXISTS studio_staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studio_id INTEGER NOT NULL,
    npc_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended')),
    hired_at INTEGER NOT NULL,
    last_upkeep_date TEXT NOT NULL,
    suspended_at INTEGER,
    updated_at INTEGER NOT NULL,
    UNIQUE (studio_id, npc_key),
    FOREIGN KEY (studio_id) REFERENCES studios(id)
);

CREATE INDEX IF NOT EXISTS idx_studio_staff_upkeep
ON studio_staff(status, last_upkeep_date);

CREATE TABLE IF NOT EXISTS studio_mirrors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studio_scene_id INTEGER NOT NULL,
    mirror_key TEXT NOT NULL,
    embed_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'posted')),
    message_id TEXT,
    created_at INTEGER NOT NULL,
    posted_at INTEGER,
    UNIQUE(studio_scene_id, mirror_key),
    FOREIGN KEY (studio_scene_id) REFERENCES studio_scenes(id)
);
