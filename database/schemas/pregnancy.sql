CREATE TABLE IF NOT EXISTS pregnancy_profiles (
    user_id TEXT PRIMARY KEY,
    partner_fertility TEXT DEFAULT 'normal',
    carrier_fertility TEXT,
    fertility_date TEXT,
    pregnancy_count INTEGER DEFAULT 0,
    children_born INTEGER DEFAULT 0,
    pregnancy_partner_count INTEGER DEFAULT 0,
    last_pregnancy_at TEXT,
    last_birth_at TEXT,
    pregnancy_opt_in INTEGER DEFAULT 1,
    pregnancy_public_announcements INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pregnancy_daily_partners (
    carrier_id TEXT NOT NULL,
    partner_id TEXT NOT NULL,
    partner_fertility TEXT NOT NULL,
    partner_chance INTEGER NOT NULL,
    partner_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (carrier_id, partner_id, partner_date)
);

CREATE TABLE IF NOT EXISTS pregnancy_daily_checks (
    carrier_id TEXT NOT NULL,
    check_date TEXT NOT NULL,
    rolled_chance INTEGER NOT NULL,
    success INTEGER DEFAULT 0,
    father_id TEXT,
    carrier_pill_bonus INTEGER DEFAULT 0,
    partner_pill_bonus INTEGER DEFAULT 0,
    checked_at TEXT DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (carrier_id, check_date)
);

CREATE TABLE IF NOT EXISTS fertility_pill_activations (
    user_id TEXT NOT NULL,
    active_date TEXT NOT NULL,
    cost_paid INTEGER NOT NULL,
    purchase_token TEXT NOT NULL,
    purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, active_date)
);

CREATE TABLE IF NOT EXISTS pregnancies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carrier_id TEXT NOT NULL,
    father_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    due_at TEXT NOT NULL,
    baby_gender TEXT NOT NULL,
    gender_revealed INTEGER DEFAULT 0,
    birth_announced INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pregnant'
);

CREATE INDEX IF NOT EXISTS idx_pregnancies_carrier_status
ON pregnancies(carrier_id, status);

CREATE INDEX IF NOT EXISTS idx_pregnancy_partners_date
ON pregnancy_daily_partners(partner_date);
