CREATE TABLE IF NOT EXISTS lotteries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'DRAWING', 'CLOSED', 'NO WINNER')),
    ticket_price INTEGER NOT NULL,
    max_tickets_per_user INTEGER NOT NULL,
    base_prize INTEGER NOT NULL,
    jackpot_percentage INTEGER NOT NULL,
    opens_at INTEGER NOT NULL,
    draws_at INTEGER NOT NULL,
    total_ticket_revenue INTEGER NOT NULL DEFAULT 0,
    winner_id TEXT,
    winning_ticket_id INTEGER,
    final_prize INTEGER,
    completed_at INTEGER,
    created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lotteries_one_active
ON lotteries((1))
WHERE status IN ('OPEN', 'DRAWING');

CREATE INDEX IF NOT EXISTS idx_lotteries_status_draw
ON lotteries(status, draws_at);

CREATE TABLE IF NOT EXISTS lottery_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lottery_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    ticket_number INTEGER NOT NULL,
    purchased_at INTEGER NOT NULL,
    FOREIGN KEY (lottery_id) REFERENCES lotteries(id) ON DELETE CASCADE,
    UNIQUE (lottery_id, ticket_number)
);

CREATE INDEX IF NOT EXISTS idx_lottery_tickets_lottery
ON lottery_tickets(lottery_id);

CREATE INDEX IF NOT EXISTS idx_lottery_tickets_user
ON lottery_tickets(lottery_id, user_id);

CREATE TABLE IF NOT EXISTS lottery_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    channel_id TEXT NOT NULL,
    message_id TEXT,
    updated_at INTEGER NOT NULL
);
