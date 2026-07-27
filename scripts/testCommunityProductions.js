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
    getProduction
} = require('../database/communityProductions');

const {
    startCommunityProductions
} = require('../features/community-production/communityProduction');

const {
    isBusy
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

    for (
        const userId of [
            'male-a',
            'female-a',
            'male-b'
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
                'MFM',
            title:
                'Persistence Test',
            castingChannelId:
                'casting',
            sceneChannelId:
                'scenes',
            slots: [
                {
                    gender: 'm',
                    userId: null,
                    category: null
                },
                {
                    gender: 'f',
                    userId: null,
                    category: null
                },
                {
                    gender: 'm',
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
                'female-a',
                'bf'
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

    const rewards =
        running.slots.map(
            (slot) => ({
                userId:
                    slot.userId,
                coins:
                    200,
                xp:
                    50,
                ranking:
                    10,
                booster: {
                    stat:
                        'performance',
                    tier:
                        2
                },
                gift: {
                    key:
                        'rose',
                    name:
                        'Rose',
                    emoji:
                        'rose'
                }
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
        user.ranking,
        10
    );

    assert.equal(
        user.scenes_completed,
        1
    );

    assert.equal(
        booster.quantity,
        1
    );

    assert.equal(
        gift.quantity,
        1
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
