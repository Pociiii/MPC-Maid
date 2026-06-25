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
