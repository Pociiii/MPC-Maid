CREATE TABLE IF NOT EXISTS user_gift_inventory (
    user_id TEXT NOT NULL, gift_key TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    PRIMARY KEY (user_id, gift_key)
);
CREATE TABLE IF NOT EXISTS user_received_gifts (
    user_id TEXT NOT NULL, gift_key TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    total_value INTEGER NOT NULL DEFAULT 0 CHECK (total_value >= 0),
    PRIMARY KEY (user_id, gift_key)
);
CREATE TABLE IF NOT EXISTS gift_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL, gift_key TEXT NOT NULL,
    price_paid INTEGER NOT NULL, sent_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS gift_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,
    gift_key TEXT NOT NULL, price_paid INTEGER NOT NULL,
    quantity_remaining INTEGER NOT NULL DEFAULT 1 CHECK (quantity_remaining >= 0),
    purchased_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS user_daily_gift_shop (
    user_id TEXT NOT NULL, reset_key TEXT NOT NULL,
    gift_keys_json TEXT NOT NULL, created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, reset_key)
);
CREATE INDEX IF NOT EXISTS idx_gift_purchases_fifo
ON gift_purchases(user_id, gift_key, quantity_remaining, id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_receiver
ON gift_transactions(receiver_id, sent_at);
