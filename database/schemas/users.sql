CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,

    coins INTEGER DEFAULT 500,
    xp INTEGER DEFAULT 0,

    performance INTEGER DEFAULT 1,
    stamina INTEGER DEFAULT 1,
    fame INTEGER DEFAULT 1,

    scenes_completed INTEGER DEFAULT 0,

    spanks_taken INTEGER DEFAULT 0,
    spanks_given INTEGER DEFAULT 0,
    
    kisses_taken INTEGER DEFAULT 0,
    kisses_given INTEGER DEFAULT 0,

    horny_helps INTEGER DEFAULT 0,
    horny_helped INTEGER DEFAULT 0,

    brofists_given INTEGER DEFAULT 0,
    brofists_taken INTEGER DEFAULT 0,

    partner_id TEXT DEFAULT NULL,

    mother_id TEXT DEFAULT NULL,
    father_id TEXT DEFAULT NULL

);

CREATE TABLE IF NOT EXISTS user_coin_income (
    user_id TEXT NOT NULL,
    income_date TEXT NOT NULL,
    source TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, income_date, source),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_coin_income_date
ON user_coin_income(user_id, income_date);
