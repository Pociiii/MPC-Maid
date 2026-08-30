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

process.env.MPC_DATA_DIR =
    path.join(
        originalDirectory,
        'runtime-data'
    );

const testDirectory =
    fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            'mpc-community-productions-'
        )
    );

process.chdir(
    testDirectory
);

const db =
    require('../database/database');

const {
    applyRewardsOnce,
    checkpointPart,
    claimCastingSlot,
    createProduction,
    getProduction,
    startCasting
} = require('../database/communityProductions');

const {
    getCanonicalProductionCategory,
    getProductionTypeFromSlots,
    startCommunityProductions
} = require('../features/community-production/communityProduction');

const {
    clearAllSceneBusy,
    isBusy,
    tryReserveUsers,
    trySetSceneBusy
} = require('../utils/pornScenes');

function dbRun(
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
                        ? reject(error)
                        : resolve()
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

    assert.equal(
        tryReserveUsers(['one', 'two', 'three'], { type: 'test' }),
        true
    );
    assert.equal(
        trySetSceneBusy('three', 'four'),
        false
    );
    assert.equal(isBusy('four'), false);
    clearAllSceneBusy();

    assert.equal(
        getCanonicalProductionCategory({
            category:
                'wm_wf_bm',
            slots: [
                {
                    index:
                        0,
                    gender:
                        'm',
                    category:
                        'wm'
                },
                {
                    index:
                        1,
                    gender:
                        'f',
                    category:
                        'wf'
                },
                {
                    index:
                        2,
                    gender:
                        'm',
                    category:
                        'bm'
                }
            ]
        }),
        'wm_bm_wf'
    );

    assert.equal(
        getCanonicalProductionCategory({
            category:
                'bm_wm_wf',
            slots: [
                {
                    category:
                        'bm'
                },
                {
                    category:
                        'wf'
                },
                {
                    category:
                        'wm'
                }
            ]
        }),
        'wm_bm_wf'
    );

    assert.equal(
        getCanonicalProductionCategory({
            category:
                'bm_bf_wf',
            slots: [
                {
                    category:
                        'bm'
                },
                {
                    category:
                        'bf'
                },
                {
                    category:
                        'wf'
                }
            ]
        }),
        'bm_wf_bf'
    );

    for (
        const userId of [
            'male-a',
            'female-a',
            'male-b',
            'male-c'
        ]
    )
        await dbRun(
            'INSERT INTO users (id) VALUES (?)',
            [
                userId
            ]
        );

    const production =
        await createProduction({
            productionType:
                null,
            title:
                'Persistence Test',
            castingChannelId:
                'casting',
            sceneChannelId:
                'scenes',
            slots: [
                {
                    gender: null,
                    userId: null,
                    category: null
                },
                {
                    gender: null,
                    userId: null,
                    category: null
                },
                {
                    gender: null,
                    userId: null,
                    category: null
                }
            ],
            parts: [
                'finale'
            ],
            castingClosesAt:
                Date.now() + 60_000,
            color:
                '#123456'
        });

    assert.equal(
        (
            await claimCastingSlot(
                production.id,
                'male-a',
                'wm'
            )
        ).full,
        false
    );

    assert.equal(
        (
            await claimCastingSlot(
                production.id,
                'male-b',
                'bm'
            )
        ).full,
        false
    );

    assert.deepEqual(
        await claimCastingSlot(
            production.id,
            'male-c',
            'wm'
        ),
        {
            ok: false,
            reason: 'role_full'
        }
    );

    assert.equal(
        (await claimCastingSlot(
            production.id,
            'female-a',
            'bf'
        )).full,
        true
    );

    const filled = await getProduction(
        production.id
    );

    assert.equal(
        filled.status,
        'casting'
    );

    assert.equal(
        getProductionTypeFromSlots(filled.slots),
        'MFM'
    );

    assert.equal(
        await startCasting(
            production.id,
            filled.slots,
            'MFM',
            'wm_bm_bf',
            'Finalized Test'
        ),
        true
    );

    const running =
        await getProduction(
            production.id
        );

    assert.equal(
        running.status,
        'running'
    );

    assert.equal(
        running.category,
        'wm_bm_bf'
    );

    await dbRun(
        `UPDATE community_productions
         SET next_part_at = ?
         WHERE id = ?`,
        [
            Date.now() + 60_000,
            production.id
        ]
    );

    const restored =
        await startCommunityProductions({
            channels: {
                cache:
                    new Map(),
                fetch:
                    async () => null
            },
            guilds: {
                cache:
                    new Map()
            }
        });

    assert.equal(
        restored.running,
        1
    );

    assert.equal(
        isBusy(
            'male-a'
        ),
        true
    );

    assert.equal(
        isBusy(
            'female-a'
        ),
        true
    );

    await dbRun(
        `INSERT INTO lotteries (
            status,
            ticket_price,
            max_tickets_per_user,
            base_prize,
            jackpot_percentage,
            opens_at,
            draws_at,
            created_at
         ) VALUES ('OPEN', 100, 20, 1000, 65, ?, ?, ?)`,
        [
            Date.now() - 60_000,
            Date.now() + 60_000,
            Date.now()
        ]
    );

    for (
        let ticketNumber = 1;
        ticketNumber <= 20;
        ticketNumber += 1
    )
        await dbRun(
            `INSERT INTO lottery_tickets (
                lottery_id,
                user_id,
                ticket_number,
                purchased_at
             ) VALUES (1, 'female-a', ?, ?)`,
            [
                ticketNumber,
                Date.now()
            ]
        );

    const rewards =
        running.slots.map(
            (slot) => ({
                userId:
                    slot.userId,
                coins:
                    200,
                xp:
                    50,
                booster:
                    slot.userId === 'male-a'
                        ? {
                            stat:
                                'performance',
                            tier:
                                2
                        }
                        : null,
                gift:
                    slot.userId === 'male-a'
                        ? {
                            key:
                                'rose',
                            name:
                                'Rose',
                            emoji:
                                'rose'
                        }
                        : null,
                lotteryTicket:
                    true
            })
        );

    assert.equal(
        await checkpointPart(
            production.id,
            0,
            [
                'https://discord.test/finale'
            ],
            Date.now(),
            true,
            rewards
        ),
        true
    );

    assert.equal(
        await applyRewardsOnce(
            production.id
        ),
        true
    );

    assert.equal(
        await applyRewardsOnce(
            production.id
        ),
        false
    );

    const user =
        await dbGet(
            'SELECT * FROM users WHERE id = ?',
            [
                'male-a'
            ]
        );

    const booster =
        await dbGet(
            `SELECT quantity FROM user_boosters
             WHERE user_id = ? AND stat = ? AND tier = ?`,
            [
                'male-a',
                'performance',
                2
            ]
        );

    const gift =
        await dbGet(
            `SELECT quantity FROM user_gift_inventory
             WHERE user_id = ? AND gift_key = ?`,
            [
                'male-a',
                'rose'
            ]
        );

    assert.equal(
        user.coins,
        700
    );

    assert.equal(
        user.xp,
        50
    );

    assert.equal(
        user.scenes_completed,
        1
    );

    const productionIncome =
        await dbGet(
            `SELECT SUM(amount) AS amount
             FROM user_coin_income
             WHERE user_id = 'male-a'
             AND source = 'community_production'`
        );

    assert.equal(
        productionIncome.amount,
        200
    );

    assert.equal(
        booster.quantity,
        1
    );

    assert.equal(
        gift.quantity,
        1
    );

    const maleLotteryTickets =
        await dbGet(
            `SELECT COUNT(*) AS count
             FROM lottery_tickets
             WHERE lottery_id = 1 AND user_id = 'male-a'`
        );

    const femaleLotteryTickets =
        await dbGet(
            `SELECT COUNT(*) AS count
             FROM lottery_tickets
             WHERE lottery_id = 1 AND user_id = 'female-a'`
        );

    const rewardedProduction =
        await getProduction(
            production.id
        );

    assert.equal(
        maleLotteryTickets.count,
        1
    );

    assert.equal(
        femaleLotteryTickets.count,
        20
    );

    assert.equal(
        rewardedProduction.rewards.find(
            (reward) =>
                reward.userId === 'male-a'
        ).lotteryTicket.number,
        21
    );

    assert.equal(
        rewardedProduction.rewards.find(
            (reward) =>
                reward.userId === 'female-a'
        ).lotteryTicket,
        null
    );

    assert.equal(
        await dbGet(
            `SELECT quantity FROM user_boosters
             WHERE user_id = ?`,
            [
                'female-a'
            ]
        ),
        undefined
    );

    assert.equal(
        await dbGet(
            `SELECT quantity FROM user_gift_inventory
             WHERE user_id = ?`,
            [
                'female-a'
            ]
        ),
        undefined
    );

    console.log(
        'Community production persistence tests passed.'
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
                    force: true,
                    recursive: true
                }
            );

        }
    );
