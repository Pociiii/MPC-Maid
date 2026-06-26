CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,

    coins INTEGER DEFAULT 500,
    xp INTEGER DEFAULT 0,

    performance INTEGER DEFAULT 1,
    stamina INTEGER DEFAULT 1,
    fame INTEGER DEFAULT 1,

    ranking INTEGER DEFAULT 0,
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
