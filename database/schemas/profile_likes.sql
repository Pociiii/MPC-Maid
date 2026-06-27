CREATE TABLE IF NOT EXISTS profile_likes (
    target_user_id TEXT NOT NULL,
    liker_user_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (target_user_id, liker_user_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_likes_target
ON profile_likes(target_user_id);

CREATE INDEX IF NOT EXISTS idx_profile_likes_liker
ON profile_likes(liker_user_id);
