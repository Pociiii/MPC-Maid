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

    await addColumnIfMissing(
        db,
        'user_achievements',
        'points',
        'INTEGER DEFAULT 0'
    );

}

module.exports = {
    runMigrations
};
