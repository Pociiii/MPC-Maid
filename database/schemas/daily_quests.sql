CREATE TABLE IF NOT EXISTS daily_quests (
    user_id TEXT NOT NULL,
    quest_date TEXT NOT NULL,
    quest_id TEXT NOT NULL,
    action TEXT NOT NULL,
    label TEXT NOT NULL,
    target INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    reward_coins INTEGER DEFAULT 0,
    reward_xp INTEGER DEFAULT 0,

    PRIMARY KEY (user_id, quest_date, quest_id)
);

CREATE TABLE IF NOT EXISTS daily_quest_bonus (
    user_id TEXT NOT NULL,
    quest_date TEXT NOT NULL,
    completed INTEGER DEFAULT 0,

    PRIMARY KEY (user_id, quest_date)
);
