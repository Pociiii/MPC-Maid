const db =
    require('./database');

const {
    getCoinIncomeDate
} = require('../utils/coinIncome');

const {
    canonicalizeCastCategories
} = require('../data/sceneSubmitGroups');

function run(
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
                        ? reject(error)
                        : resolve(row)
            )
    );

}

function all(
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

function parse(
    row
) {

    if (
        !row
    )
        return null;

    return {
        ...row,
        slots:
            JSON.parse(
                row.slots_json
            ),
        parts:
            JSON.parse(
                row.parts_json
            ),
        sceneLinks:
            JSON.parse(
                row.scene_links_json
            ),
        rewards:
            row.rewards_json
                ? JSON.parse(
                    row.rewards_json
                )
                : null
    };

}

async function createProduction(
    production
) {

    const now =
        Date.now();

    const result =
        await run(
            `INSERT INTO community_productions (
                production_type, title, casting_channel_id,
                scene_channel_id, slots_json, parts_json,
                casting_closes_at, color, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                production.productionType,
                production.title,
                production.castingChannelId,
                production.sceneChannelId,
                JSON.stringify(
                    production.slots
                ),
                JSON.stringify(
                    production.parts
                ),
                production.castingClosesAt,
                production.color ?? null,
                now,
                now
            ]
        );

    return getProduction(
        result.lastID
    );

}

async function getProduction(
    productionId
) {

    return parse(
        await get(
            'SELECT * FROM community_productions WHERE id = ?',
            [
                productionId
            ]
        )
    );

}

async function getOpenCasting() {

    return parse(
        await get(
            `SELECT * FROM community_productions
             WHERE status = 'casting'
             ORDER BY id DESC LIMIT 1`
        )
    );

}

async function getLatestProductionType() {

    const row =
        await get(
            `SELECT production_type
             FROM community_productions
             ORDER BY id DESC LIMIT 1`
        );

    return row?.production_type ??
        null;

}

async function getRestorableProductions() {

    return (
        await all(
            `SELECT * FROM community_productions
             WHERE status IN ('casting', 'running', 'finalizing')
             ORDER BY created_at, id`
        )
    ).map(
        parse
    );

}

async function setCastingMessage(
    productionId,
    messageId
) {

    await run(
        `UPDATE community_productions
         SET casting_message_id = ?, updated_at = ?
         WHERE id = ?`,
        [
            messageId,
            Date.now(),
            productionId
        ]
    );

}

async function claimCastingSlot(
    productionId,
    userId,
    category
) {

    await run(
        'BEGIN IMMEDIATE'
    );

    try {

        const row =
            await get(
                `SELECT status, slots_json, casting_closes_at
                 FROM community_productions WHERE id = ?`,
                [
                    productionId
                ]
            );

        if (
            !row ||
            row.status !== 'casting' ||
            row.casting_closes_at <= Date.now()
        ) {

            await run(
                'COMMIT'
            );

            return {
                ok: false,
                reason: 'closed'
            };

        }

        const slots =
            JSON.parse(
                row.slots_json
            );

        if (
            slots.some(
                (slot) =>
                    slot.userId === userId
            )
        ) {

            await run(
                'COMMIT'
            );

            return {
                ok: false,
                reason: 'joined'
            };

        }

        const slotIndex =
            slots.findIndex(
                (slot) =>
                    !slot.userId &&
                    slot.gender === category.slice(
                        -1
                    )
            );

        if (
            slotIndex < 0
        ) {

            await run(
                'COMMIT'
            );

            return {
                ok: false,
                reason: 'role_full'
            };

        }

        slots[slotIndex] = {
            ...slots[slotIndex],
            userId,
            category
        };

        const full =
            slots.every(
                (slot) =>
                    Boolean(
                        slot.userId
                    )
            );

        const result =
            await run(
                `UPDATE community_productions
                 SET slots_json = ?,
                     status = ?,
                     category = ?,
                     next_part_at = ?,
                     updated_at = ?
                 WHERE id = ? AND status = 'casting'`,
                [
                    JSON.stringify(
                        slots
                    ),
                    full
                        ? 'running'
                        : 'casting',
                    full
                        ? canonicalizeCastCategories(
                            slots.map(
                                (slot) =>
                                    slot.category
                            )
                        )
                        : null,
                    full
                        ? Date.now()
                        : null,
                    Date.now(),
                    productionId
                ]
            );

        await run(
            'COMMIT'
        );

        return {
            ok:
                result.changes === 1,
            full,
            slots
        };

    }
    catch (error) {

        await run(
            'ROLLBACK'
        ).catch(
            () => null
        );

        throw error;

    }

}

async function expireCasting(
    productionId
) {

    const result =
        await run(
            `UPDATE community_productions
             SET status = 'expired', completed_at = ?, updated_at = ?
             WHERE id = ? AND status = 'casting'`,
            [
                Date.now(),
                Date.now(),
                productionId
            ]
        );

    return result.changes === 1;

}

async function checkpointPart(
    productionId,
    expectedIndex,
    sceneLinks,
    nextPartAt,
    finalPart,
    rewards = null
) {

    const result =
        await run(
            `UPDATE community_productions
             SET next_part_index = next_part_index + 1,
                 scene_links_json = ?,
                 next_part_at = ?,
                 status = ?,
                 rewards_json = COALESCE(?, rewards_json),
                 updated_at = ?
             WHERE id = ? AND status = 'running'
             AND next_part_index = ?`,
            [
                JSON.stringify(
                    sceneLinks
                ),
                nextPartAt,
                finalPart
                    ? 'finalizing'
                    : 'running',
                rewards
                    ? JSON.stringify(
                        rewards
                    )
                    : null,
                Date.now(),
                productionId,
                expectedIndex
            ]
        );

    return result.changes === 1;

}

async function applyRewardsOnce(
    productionId
) {

    await run(
        'BEGIN IMMEDIATE'
    );

    try {

        const production =
            parse(
                await get(
                    `SELECT * FROM community_productions
                     WHERE id = ? AND status = 'finalizing'`,
                    [
                        productionId
                    ]
                )
            );

        if (
            !production ||
            production.rewards_applied
        ) {

            await run(
                'COMMIT'
            );

            return false;

        }

        for (
            const reward of production.rewards
        ) {

            await run(
                `UPDATE users
                 SET coins = coins + ?, xp = xp + ?,
                     scenes_completed = scenes_completed + 1
                 WHERE id = ?`,
                [
                    reward.coins,
                    reward.xp,
                    reward.userId
                ]
            );

            await run(
                `INSERT INTO user_coin_income (
                    user_id, income_date, source, amount, updated_at
                 ) VALUES (?, ?, 'community_production', ?, ?)
                 ON CONFLICT(user_id, income_date, source)
                 DO UPDATE SET
                    amount = amount + excluded.amount,
                    updated_at = excluded.updated_at`,
                [
                    reward.userId,
                    getCoinIncomeDate(),
                    reward.coins,
                    Date.now()
                ]
            );

            if (
                reward.booster
            )
                await run(
                    `INSERT INTO user_boosters (
                        user_id, stat, tier, quantity
                     ) VALUES (?, ?, ?, 1)
                     ON CONFLICT(user_id, stat, tier)
                     DO UPDATE SET quantity = quantity + 1`,
                    [
                        reward.userId,
                        reward.booster.stat,
                        reward.booster.tier
                    ]
                );

            if (
                reward.gift
            )
                await run(
                    `INSERT INTO user_gift_inventory (
                        user_id, gift_key, quantity
                     ) VALUES (?, ?, 1)
                     ON CONFLICT(user_id, gift_key)
                     DO UPDATE SET quantity = quantity + 1`,
                    [
                        reward.userId,
                        reward.gift.key
                    ]
                );

            if (
                reward.lotteryTicket
            ) {

                const lottery =
                    await get(
                        `SELECT id, max_tickets_per_user
                         FROM lotteries
                         WHERE status = 'OPEN' AND draws_at > ?
                         ORDER BY id DESC
                         LIMIT 1`,
                        [
                            Date.now()
                        ]
                    );

                const owned =
                    lottery
                        ? await get(
                            `SELECT COUNT(*) AS count
                             FROM lottery_tickets
                             WHERE lottery_id = ? AND user_id = ?`,
                            [
                                lottery.id,
                                reward.userId
                            ]
                        )
                        : null;

                if (
                    lottery &&
                    Number(
                        owned?.count ?? 0
                    ) < lottery.max_tickets_per_user
                ) {

                    const highest =
                        await get(
                            `SELECT COALESCE(MAX(ticket_number), 0) AS number
                             FROM lottery_tickets
                             WHERE lottery_id = ?`,
                            [
                                lottery.id
                            ]
                        );

                    const ticketNumber =
                        Number(
                            highest.number
                        ) + 1;

                    await run(
                        `INSERT INTO lottery_tickets (
                            lottery_id,
                            user_id,
                            ticket_number,
                            purchased_at
                         ) VALUES (?, ?, ?, ?)`,
                        [
                            lottery.id,
                            reward.userId,
                            ticketNumber,
                            Date.now()
                        ]
                    );

                    reward.lotteryTicket = {
                        number:
                            ticketNumber
                    };

                }
                else
                    reward.lotteryTicket =
                        null;

            }

        }

        await run(
            `UPDATE community_productions
             SET rewards_json = ?, rewards_applied = 1, updated_at = ?
             WHERE id = ? AND rewards_applied = 0`,
            [
                JSON.stringify(
                    production.rewards
                ),
                Date.now(),
                productionId
            ]
        );

        await run(
            'COMMIT'
        );

        return true;

    }
    catch (error) {

        await run(
            'ROLLBACK'
        ).catch(
            () => null
        );

        throw error;

    }

}

async function markCompleted(
    productionId
) {

    await run(
        `UPDATE community_productions
         SET status = 'completed', completed_at = ?, updated_at = ?
         WHERE id = ?`,
        [
            Date.now(),
            Date.now(),
            productionId
        ]
    );

}

module.exports = {
    applyRewardsOnce,
    checkpointPart,
    claimCastingSlot,
    createProduction,
    expireCasting,
    getOpenCasting,
    getLatestProductionType,
    getProduction,
    getRestorableProductions,
    markCompleted,
    setCastingMessage
};
