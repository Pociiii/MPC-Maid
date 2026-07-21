CREATE TABLE IF NOT EXISTS command_guide_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    channel_id TEXT NOT NULL,
    message_id TEXT,
    updated_at INTEGER NOT NULL
);
