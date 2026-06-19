CREATE TABLE IF NOT EXISTS user_boosters (
    user_id TEXT NOT NULL,
    stat TEXT NOT NULL,
    tier INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,

    PRIMARY KEY (user_id, stat, tier)
);
