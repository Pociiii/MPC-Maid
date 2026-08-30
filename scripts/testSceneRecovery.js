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
            'mpc-scenes-'
        )
    );

process.chdir(
    testDirectory
);

const db =
    require('../database/database');

const {
    applyPornSceneRewardsOnce,
    checkpointScenePart,
    createActiveScene,
    getActiveScene,
    markSceneFailed
} = require('../database/activeScenes');

const {
    restoreCustomScenes
} = require('../features/custom-scene/scheduler');

const {
    restorePornScenes
} = require('../features/porn-career/sceneScheduler');

const {
    applyProductionManagerInterval,
    compareSceneResults,
    selectBetterSceneResult
} = require('../features/porn-career/studioSceneEffects');

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

function wait(
    milliseconds
) {

    return new Promise(
        (resolve) =>
            setTimeout(
                resolve,
                milliseconds
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

    assert.equal(applyProductionManagerInterval(600000, true), 540000);
    assert.equal(applyProductionManagerInterval(600000, false), 600000);
    const awkward = { outcome: 'Awkward Scene', score: 100, viewers: 1000, xp: 10 };
    const hot = { outcome: 'Hot Scene', score: 1, viewers: 1, xp: 35 };
    assert.equal(compareSceneResults(hot, awkward) > 0, true);
    assert.equal(selectBetterSceneResult(awkward, hot), hot);

    await db.ready;

    let messageNumber =
        0;

    const client = {
        channels: {
            cache:
                new Map(),
            fetch:
                async () => null
        }
    };

    function buildChannel(
        id
    ) {

        return {
            id,
            client,
            send: async () => {
                messageNumber += 1;
                return {
                    url: `https://discord.test/messages/${messageNumber}`
                };
            }
        };

    }

    client.channels.cache.set(
        'custom-channel',
        buildChannel(
            'custom-channel'
        )
    );

    client.channels.cache.set(
        'porn-channel',
        buildChannel(
            'porn-channel'
        )
    );

    const custom =
        await createActiveScene({
            sceneType: 'custom',
            channelId: 'custom-channel',
            ownerId: 'custom-user',
            category: 'wm_wf',
            parts: [
                'foreplay'
            ],
            title: 'Recovery Test',
            author: {
                name: 'Custom User'
            },
            intervalMs: 1000,
            nextPartAt: Date.now() - 1000
        });

    const porn =
        await createActiveScene({
            sceneType: 'porn',
            channelId: 'porn-channel',
            ownerId: 'requester',
            targetId: 'target',
            category: 'wm_wf',
            parts: [
                'foreplay',
                'finale'
            ],
            result: {
                totalParts: 2,
                partViewers: [
                    100,
                    200
                ],
                viewers: 200
            },
            title: 'Recovery Test',
            author: {
                name: 'Requester'
            },
            color: '#FF2E88',
            intervalMs: 60 * 1000,
            nextPartAt: Date.now() - 1000
        });

    await Promise.all([
        restoreCustomScenes(
            client
        ),
        restorePornScenes(
            client
        )
    ]);

    await wait(
        300
    );

    const restoredCustom =
        await getActiveScene(
            custom.id
        );

    const restoredPorn =
        await getActiveScene(
            porn.id
        );

    assert.equal(
        restoredCustom.status,
        'completed'
    );

    assert.equal(
        restoredCustom.next_part_index,
        1
    );

    assert.equal(
        restoredPorn.status,
        'running'
    );

    assert.equal(
        restoredPorn.next_part_index,
        1
    );

    assert.equal(
        isBusy('requester'),
        true
    );

    assert.equal(
        isBusy('target'),
        true
    );

    await markSceneFailed(
        porn.id
    );

    await dbRun(
        'INSERT INTO users (id, coins) VALUES (?, ?), (?, ?)',
        [
            'reward-a',
            500,
            'reward-b',
            500
        ]
    );

    const rewardScene =
        await createActiveScene({
            sceneType: 'porn',
            channelId: 'porn-channel',
            ownerId: 'reward-a',
            targetId: 'reward-b',
            category: 'wm_wf',
            parts: [
                'finale'
            ],
            result: {},
            title: 'Reward Test',
            author: {
                name: 'Reward User'
            },
            intervalMs: 0,
            nextPartAt: Date.now()
        });

    await checkpointScenePart(
        rewardScene.id,
        0,
        [
            'https://discord.test/finale'
        ],
        Date.now(),
        true
    );

    const rewardResult = {
        coins: 125,
        requesterCoins: 137,
        targetCoins: 125,
        marketingBonus: 12
    };

    const firstReward =
        await applyPornSceneRewardsOnce(
            rewardScene.id,
            'reward-a',
            'reward-b',
            rewardResult,
            30,
            25
        );

    const duplicateReward =
        await applyPornSceneRewardsOnce(
            rewardScene.id,
            'reward-a',
            'reward-b',
            rewardResult,
            30,
            25
        );

    const rewardA =
        await dbGet(
            'SELECT * FROM users WHERE id = ?',
            [
                'reward-a'
            ]
        );

    assert.equal(firstReward, true);
    assert.equal(duplicateReward, false);
    assert.equal(rewardA.coins, 637);
    assert.equal(rewardA.xp, 30);
    assert.equal(rewardA.scenes_completed, 1);

    const rewardIncome =
        await dbGet(
            `SELECT SUM(amount) AS amount
             FROM user_coin_income
             WHERE user_id = ? AND source = 'porn_scene'`,
            [
                'reward-a'
            ]
        );

    assert.equal(rewardIncome.amount, 137);

    const rewardB = await dbGet(
        'SELECT * FROM users WHERE id = ?',
        ['reward-b']
    );
    assert.equal(rewardB.coins, 625);

    console.log(
        'Active scene restart recovery tests passed.'
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
