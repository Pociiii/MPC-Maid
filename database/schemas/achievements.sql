CREATE TABLE IF NOT EXISTS user_achievements (
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    achievement_key TEXT NOT NULL,
    milestone INTEGER NOT NULL,
    unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS achievement_progress (
    user_id TEXT NOT NULL,
    achievement_key TEXT NOT NULL,
    current_value INTEGER DEFAULT 0,
    last_milestone INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user
ON user_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_achievement_progress_key
ON achievement_progress(achievement_key);
