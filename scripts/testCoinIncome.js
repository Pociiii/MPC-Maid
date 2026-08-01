#!/usr/bin/env node

const assert =
    require('node:assert/strict');

const fs =
    require('node:fs');

const os =
    require('node:os');

const path =
    require('node:path');

const originalDirectory =
    process.cwd();

const testDirectory =
    fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            'mpc-coin-income-'
        )
    );

process.chdir(
    testDirectory
);

const db =
    require('../database/database');

const {
    addCoins
} = require('../utils/user/economy');

const {
    getCoinIncome,
    getCoinIncomeDate,
    getPreviousCoinIncomeDate
} = require('../utils/coinIncome');

function run(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.run(
                sql,
                params,
                (error) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve()
            )
    );

}

function get(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.get(
                sql,
                params,
                (error, row) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            row
                        )
            )
    );

}

function closeDatabase() {

    return new Promise(
        (resolve, reject) =>
            db.close(
                (error) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve()
            )
    );

}

async function main() {

    await db.ready;

    assert.equal(
        getCoinIncomeDate(
            new Date('2026-08-01T11:59:59.000Z')
        ),
        '2026-07-31'
    );

    assert.equal(
        getCoinIncomeDate(
            new Date('2026-08-01T12:00:00.000Z')
        ),
        '2026-08-01'
    );

    assert.equal(
        getPreviousCoinIncomeDate(
            new Date('2026-08-02T10:00:00.000Z')
        ),
        '2026-07-31'
    );

    await run(
        `INSERT INTO users (id, coins)
         VALUES ('income-user', 500)`
    );

    await addCoins(
        'income-user',
        100,
        {
            source:
                'daily_quest'
        }
    );

    await addCoins(
        'income-user',
        50,
        {
            incomeAmount:
                20,
            source:
                'casino_test'
        }
    );

    await addCoins(
        'income-user',
        30
    );

    const user =
        await get(
            `SELECT coins FROM users
             WHERE id = 'income-user'`
        );

    assert.equal(
        user.coins,
        680
    );

    assert.equal(
        await getCoinIncome(
            'income-user',
            getCoinIncomeDate()
        ),
        120
    );

    console.log(
        'Coin income tracking tests passed.'
    );

}

main()
    .then(
        closeDatabase
    )
    .catch(
        async (error) => {
            console.error(
                error
            );
            await closeDatabase().catch(
                () => null
            );
            process.exitCode = 1;
        }
    )
    .finally(
        () => {
            process.chdir(
                originalDirectory
            );
            fs.rmSync(
                testDirectory,
                {
                    recursive: true,
                    force: true
                }
            );
        }
    );
