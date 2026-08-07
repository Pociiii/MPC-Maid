const db =
    require('./database');

const {
    getCoinIncomeDate
} = require('../utils/coinIncome');

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
                        : resolve({
                            changes: this.changes,
                            lastID: this.lastID
                        });
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

function dbAll(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.all(
                sql,
                params,
                (error, rows) =>
                    error
                        ? reject(error)
                        : resolve(rows)
            )
    );

}

function parseScene(
    row
) {

    if (
        !row
    )
        return null;

    return {
        ...row,
        parts:
            JSON.parse(row.parts_json),
        result:
            row.result_json
                ? JSON.parse(row.result_json)
                : null,
        author:
            JSON.parse(row.author_json),
        sceneLinks:
            JSON.parse(row.scene_links_json)
    };

}

async function createActiveScene(
    scene
) {

    const now =
        Date.now();

    const result =
        await dbRun(
            `INSERT INTO active_scenes (
                scene_type,
                channel_id,
                owner_id,
                target_id,
                category,
                parts_json,
                result_json,
                title,
                author_json,
                color,
                interval_ms,
                next_part_at,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                scene.sceneType,
                scene.channelId,
                scene.ownerId,
                scene.targetId ?? null,
                scene.category,
                JSON.stringify(scene.parts),
                scene.result
                    ? JSON.stringify(scene.result)
                    : null,
                scene.title,
                JSON.stringify(scene.author),
                scene.color ?? null,
                scene.intervalMs,
                scene.nextPartAt ?? now,
                now,
                now
            ]
        );

    return getActiveScene(
        result.lastID
    );

}

async function getActiveScene(
    sceneId
) {

    return parseScene(
        await dbGet(
            'SELECT * FROM active_scenes WHERE id = ?',
            [
                sceneId
            ]
        )
    );

}

async function getRestorableScenes() {

    return (
        await dbAll(
            `SELECT *
             FROM active_scenes
             WHERE status IN ('running', 'finalizing')
             ORDER BY created_at, id`
        )
    ).map(
        parseScene
    );

}

async function checkpointScenePart(
    sceneId,
    expectedIndex,
    sceneLinks,
    nextPartAt,
    finalPart
) {

    const result =
        await dbRun(
            `UPDATE active_scenes
             SET next_part_index = next_part_index + 1,
                 scene_links_json = ?,
                 next_part_at = ?,
                 status = ?,
                 updated_at = ?
             WHERE id = ?
             AND status = 'running'
             AND next_part_index = ?`,
            [
                JSON.stringify(sceneLinks),
                nextPartAt,
                finalPart
                    ? 'finalizing'
                    : 'running',
                Date.now(),
                sceneId,
                expectedIndex
            ]
        );

    return result.changes === 1;

}

async function markSceneCompleted(
    sceneId
) {

    await dbRun(
        `UPDATE active_scenes
         SET status = 'completed',
             completed_at = ?,
             updated_at = ?
         WHERE id = ?`,
        [
            Date.now(),
            Date.now(),
            sceneId
        ]
    );

}

async function markSceneFailed(
    sceneId
) {

    await dbRun(
        `UPDATE active_scenes
         SET status = 'failed',
             completed_at = ?,
             updated_at = ?
         WHERE id = ?`,
        [
            Date.now(),
            Date.now(),
            sceneId
        ]
    );

}

async function applyPornSceneRewardsOnce(
    sceneId,
    requesterId,
    targetId,
    result,
    requesterXp,
    targetXp
) {

    const requesterCoins = result.requesterCoins ?? result.coins;
    const targetCoins = result.targetCoins ?? result.coins;

    await dbRun(
        'BEGIN IMMEDIATE'
    );

    try {

        const scene =
            await dbGet(
                `SELECT rewards_applied
                 FROM active_scenes
                 WHERE id = ? AND status = 'finalizing'`,
                [
                    sceneId
                ]
            );

        if (
            !scene ||
            scene.rewards_applied
        ) {

            await dbRun(
                'COMMIT'
            );

            return false;

        }

        await dbRun(
            `UPDATE users
             SET xp = xp + ?,
                 coins = coins + ?,
                 ranking = ranking + ?,
                 scenes_completed = scenes_completed + 1
             WHERE id = ?`,
            [
                requesterXp,
                requesterCoins,
                result.rankingChange,
                requesterId
            ]
        );

        await dbRun(
            `INSERT INTO user_coin_income (
                user_id, income_date, source, amount, updated_at
             ) VALUES (?, ?, 'porn_scene', ?, ?)
             ON CONFLICT(user_id, income_date, source)
             DO UPDATE SET
                amount = amount + excluded.amount,
                updated_at = excluded.updated_at`,
            [
                requesterId,
                getCoinIncomeDate(),
                requesterCoins,
                Date.now()
            ]
        );

        await dbRun(
            `UPDATE users
             SET xp = xp + ?,
                 coins = coins + ?,
                 ranking = ranking + ?,
                 scenes_completed = scenes_completed + 1
             WHERE id = ?`,
            [
                targetXp,
                targetCoins,
                result.rankingChange,
                targetId
            ]
        );

        await dbRun(
            `INSERT INTO user_coin_income (
                user_id, income_date, source, amount, updated_at
             ) VALUES (?, ?, 'porn_scene', ?, ?)
             ON CONFLICT(user_id, income_date, source)
             DO UPDATE SET
                amount = amount + excluded.amount,
                updated_at = excluded.updated_at`,
            [
                targetId,
                getCoinIncomeDate(),
                targetCoins,
                Date.now()
            ]
        );

        await dbRun(
            `UPDATE active_scenes
             SET rewards_applied = 1,
                 updated_at = ?
             WHERE id = ? AND rewards_applied = 0`,
            [
                Date.now(),
                sceneId
            ]
        );

        await dbRun(
            'COMMIT'
        );

        return true;

    }
    catch (error) {

        await dbRun(
            'ROLLBACK'
        ).catch(
            () => null
        );

        throw error;

    }

}

module.exports = {
    applyPornSceneRewardsOnce,
    checkpointScenePart,
    createActiveScene,
    getActiveScene,
    getRestorableScenes,
    markSceneCompleted,
    markSceneFailed
};
