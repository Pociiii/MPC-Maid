function getTableColumns(
    db,
    table
) {

    return new Promise(
        (resolve, reject) =>
            db.all(
                `PRAGMA table_info(${table})`,
                (error, rows) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            rows.map(
                                (row) =>
                                    row.name
                            )
                        )
            )
    );

}

function run(
    db,
    sql
) {

    return new Promise(
        (resolve, reject) =>
            db.run(
                sql,
                (error) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve()
            )
    );

}

async function addColumnIfMissing(
    db,
    table,
    column,
    definition
) {

    const columns =
        await getTableColumns(
            db,
            table
        );

    if (
        columns.includes(
            column
        )
    )
        return;

    await run(
        db,
        `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`
    );

}

async function runMigrations(
    db
) {

    await run(
        db,
        `CREATE TABLE IF NOT EXISTS daily_quest_weekly_streaks (
            user_id TEXT PRIMARY KEY,
            last_completed_date TEXT,
            streak_count INTEGER DEFAULT 0,
            weekly_rewards_claimed INTEGER DEFAULT 0
        )`
    );

    await run(
        db,
        `CREATE TABLE IF NOT EXISTS relationships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_a_id TEXT NOT NULL,
            user_b_id TEXT NOT NULL,
            type TEXT NOT NULL,
            started_at TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
    );

    await run(
        db,
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_relationships_unique
         ON relationships(type, user_a_id, user_b_id)`
    );

    await run(
        db,
        `CREATE INDEX IF NOT EXISTS idx_relationships_user_a
         ON relationships(user_a_id)`
    );

    await run(
        db,
        `CREATE INDEX IF NOT EXISTS idx_relationships_user_b
         ON relationships(user_b_id)`
    );

    await run(
        db,
        `CREATE TABLE IF NOT EXISTS relationship_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL DEFAULT '',
            requester_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            type TEXT NOT NULL,
            started_at TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at TEXT
        )`
    );

    await run(
        db,
        `CREATE INDEX IF NOT EXISTS idx_relationship_requests_target
         ON relationship_requests(target_id, status)`
    );

    await run(
        db,
        `CREATE INDEX IF NOT EXISTS idx_relationship_requests_pair
         ON relationship_requests(requester_id, target_id, type, status)`
    );

    await addColumnIfMissing(
        db,
        'relationship_requests',
        'guild_id',
        "TEXT NOT NULL DEFAULT ''"
    );

    await run(
        db,
        `INSERT OR IGNORE INTO relationships (
            user_a_id,
            user_b_id,
            type
        )
        SELECT mother_id,
               id,
               'mother'
        FROM users
        WHERE mother_id IS NOT NULL
        AND mother_id != ''`
    );

    await run(
        db,
        `INSERT OR IGNORE INTO relationships (
            user_a_id,
            user_b_id,
            type
        )
        SELECT father_id,
               id,
               'father'
        FROM users
        WHERE father_id IS NOT NULL
        AND father_id != ''`
    );

    await run(
        db,
        `CREATE TABLE IF NOT EXISTS spank_dilli_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            total_spanks INTEGER DEFAULT 0,
            current_prize INTEGER DEFAULT 0,
            last_spanker_id TEXT,
            last_winner_id TEXT,
            last_win_amount INTEGER DEFAULT 0,
            last_win_at TEXT
        )`
    );

    await run(
        db,
        `INSERT OR IGNORE INTO spank_dilli_state (
            id,
            total_spanks,
            current_prize,
            last_win_amount
        ) VALUES (
            1,
            0,
            0,
            0
        )`
    );

    await run(
        db,
        `CREATE TABLE IF NOT EXISTS user_activity_period_stats (
            user_id TEXT NOT NULL,
            activity_type TEXT NOT NULL,
            period_type TEXT NOT NULL,
            period_key TEXT NOT NULL,
            count INTEGER DEFAULT 0,
            xp INTEGER DEFAULT 0,
            coins INTEGER DEFAULT 0,
            ranking INTEGER DEFAULT 0,
            hot_count INTEGER DEFAULT 0,
            viral_count INTEGER DEFAULT 0,
            critical_count INTEGER DEFAULT 0,
            last_at TEXT,
            PRIMARY KEY (
                user_id,
                activity_type,
                period_type,
                period_key
            )
        )`
    );

    await run(
        db,
        `CREATE TABLE IF NOT EXISTS user_activity_moment_posts (
            user_id TEXT NOT NULL,
            activity_type TEXT NOT NULL,
            period_type TEXT NOT NULL,
            period_key TEXT NOT NULL,
            milestone INTEGER NOT NULL,
            posted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (
                user_id,
                activity_type,
                period_type,
                period_key,
                milestone
            )
        )`
    );

    await addColumnIfMissing(
        db,
        'user_achievements',
        'points',
        'INTEGER DEFAULT 0'
    );

    await addColumnIfMissing(
        db,
        'users',
        'horny_helps',
        'INTEGER DEFAULT 0'
    );

    await addColumnIfMissing(
        db,
        'users',
        'horny_helped',
        'INTEGER DEFAULT 0'
    );

    await addColumnIfMissing(
        db,
        'users',
        'brofists_given',
        'INTEGER DEFAULT 0'
    );

    await addColumnIfMissing(
        db,
        'users',
        'brofists_taken',
        'INTEGER DEFAULT 0'
    );

    await addColumnIfMissing(
        db,
        'pregnancy_profiles',
        'pregnancy_count',
        'INTEGER DEFAULT 0'
    );

    await addColumnIfMissing(
        db,
        'pregnancy_profiles',
        'children_born',
        'INTEGER DEFAULT 0'
    );

    await addColumnIfMissing(
        db,
        'pregnancy_profiles',
        'pregnancy_partner_count',
        'INTEGER DEFAULT 0'
    );

    await addColumnIfMissing(
        db,
        'pregnancy_profiles',
        'last_pregnancy_at',
        'TEXT'
    );

    await addColumnIfMissing(
        db,
        'pregnancy_profiles',
        'last_birth_at',
        'TEXT'
    );

    await addColumnIfMissing(
        db,
        'pregnancy_profiles',
        'pregnancy_opt_in',
        'INTEGER DEFAULT 1'
    );

    await addColumnIfMissing(
        db,
        'pregnancy_profiles',
        'pregnancy_public_announcements',
        'INTEGER DEFAULT 1'
    );

}

module.exports = {
    runMigrations
};
