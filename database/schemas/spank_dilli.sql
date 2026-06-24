CREATE TABLE IF NOT EXISTS spank_dilli_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    total_spanks INTEGER DEFAULT 0,
    current_prize INTEGER DEFAULT 0,
    last_spanker_id TEXT,
    last_winner_id TEXT,
    last_win_amount INTEGER DEFAULT 0,
    last_win_at TEXT
);

INSERT OR IGNORE INTO spank_dilli_state (
    id,
    total_spanks,
    current_prize,
    last_win_amount
) VALUES (
    1,
    0,
    0,
    0
);
