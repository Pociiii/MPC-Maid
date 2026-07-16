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
            'mpc-lottery-'
        )
    );

process.chdir(
    testDirectory
);

const db =
    require('../database/database');

const lottery =
    require('../features/lottery/lottery');

function dbRun(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.run(
                sql,
                params,
                function onRun(error) {
                    error
                        ? reject(error)
                        : resolve(this);
                }
            )
    );

}

function dbGet(
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
                        ? reject(error)
                        : resolve(row)
            )
    );

}

async function closeDatabase() {

    await new Promise(
        (resolve, reject) =>
            db.close(
                (error) =>
                    error
                        ? reject(error)
                        : resolve()
            )
    );

}

async function main() {

    await db.ready;

    const initial =
        await lottery.getLotterySummary();

    assert.equal(
        initial.jackpot,
        2500
    );

    await dbRun(
        'INSERT INTO users (id, coins) VALUES (?, ?)',
        [
            'user-a',
            5000
        ]
    );

    const one =
        await lottery.buyLotteryTickets(
            'user-a',
            1
        );

    assert.equal(one.quantity, 1);
    assert.equal(one.cost, 100);

    const maximum =
        await lottery.buyLotteryTickets(
            'user-a',
            'max'
        );

    assert.equal(maximum.quantity, 19);
    assert.equal(maximum.totalOwned, 20);

    const blocked =
        await lottery.buyLotteryTickets(
            'user-a',
            1
        );

    assert.equal(blocked.ok, false);

    const userA =
        await dbGet(
            'SELECT coins FROM users WHERE id = ?',
            [
                'user-a'
            ]
        );

    assert.equal(userA.coins, 3000);

    const afterPurchase =
        await lottery.getLotterySummary();

    assert.equal(afterPurchase.totalTickets, 20);
    assert.equal(afterPurchase.jackpot, 4100);

    const numbers =
        await lottery.getUserTicketNumbers(
            'user-a'
        );

    assert.equal(
        new Set(
            numbers.map(
                (ticket) =>
                    ticket.ticket_number
            )
        ).size,
        20
    );

    const fakeChannel = {
        send: async () => ({})
    };

    const fakeClient = {
        channels: {
            cache: new Map([
                [
                    require('../data/constants').CHANNELS.MAID_FEED,
                    fakeChannel
                ]
            ]),
            fetch: async () => null
        }
    };

    const [
        firstDraw,
        duplicateDraw
    ] = await Promise.all([
        lottery.drawCurrentLottery(
            fakeClient,
            {
                force: true
            }
        ),
        lottery.drawCurrentLottery(
            fakeClient,
            {
                force: true
            }
        )
    ]);

    assert.equal(
        [
            firstDraw,
            duplicateDraw
        ].filter(
            (result) =>
                result.ok
        ).length,
        1
    );

    const winningDraw =
        firstDraw.ok
            ? firstDraw
            : duplicateDraw;

    assert.equal(winningDraw.prize, 4100);
    assert.ok(
        numbers.some(
            (ticket) =>
                ticket.ticket_number === winningDraw.winningTicket
        )
    );

    const winner =
        await dbGet(
            'SELECT coins FROM users WHERE id = ?',
            [
                winningDraw.winnerId
            ]
        );

    assert.equal(winner.coins, 7100);

    const next =
        await lottery.getLotterySummary();

    assert.equal(next.totalTickets, 0);
    assert.equal(next.jackpot, 2500);

    const noTicketDraw =
        await lottery.drawCurrentLottery(
            fakeClient,
            {
                force: true
            }
        );

    assert.equal(noTicketDraw.ok, true);
    assert.equal(noTicketDraw.winnerId, null);
    assert.equal(noTicketDraw.prize, 0);

    console.log(
        'Lottery transaction and draw tests passed.'
    );

}

main()
    .then(
        closeDatabase
    )
    .catch(
        async (error) => {
            console.error(error);
            await closeDatabase().catch(() => null);
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
                    force: true,
                    recursive: true
                }
            );

        }
    );
