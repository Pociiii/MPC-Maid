const db =
    require('../../database/database');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed,
    createUserEmbed
} = require('../../utils/embeds');

const {
    commandFooter
} = require('../../utils/version');

const {
    addCoins,
    addXP,
    getOrCreateUser
} = require('../../utils/users');

const emojis =
    require('../../utils/emojis');

const QUESTS_PER_DAY =
    3;

const assignmentLocks =
    new Map();

const RESET_HOUR_UTC =
    12;

const DAILY_BONUS = {
    coins:
        100,
    xp:
        50
};

const rewardByTier = {
    easy: {
        coins:
            40,
        xp:
            20
    },
    medium: {
        coins:
            75,
        xp:
            35
    },
    hard: {
        coins:
            120,
        xp:
            60
    }
};

const questPool = [
    {
        id:
            'porn_scene_1',
        action:
            'porn_scene',
        label:
            'Be part of 1 porn scene',
        target:
            1,
        tier:
            'easy'
    },
    {
        id:
            'porn_scene_2',
        action:
            'porn_scene',
        label:
            'Be part of 2 porn scenes',
        target:
            2,
        tier:
            'medium'
    },
    {
        id:
            'porn_scene_3',
        action:
            'porn_scene',
        label:
            'Be part of 3 porn scenes',
        target:
            3,
        tier:
            'hard'
    },
    {
        id:
            'horny_help_1',
        action:
            'horny_help',
        label:
            'Help someone horny 1 time',
        target:
            1,
        tier:
            'easy'
    },
    {
        id:
            'horny_help_2',
        action:
            'horny_help',
        label:
            'Help someone horny 2 times',
        target:
            2,
        tier:
            'medium'
    },
    {
        id:
            'horny_help_3',
        action:
            'horny_help',
        label:
            'Help someone horny 3 times',
        target:
            3,
        tier:
            'hard'
    },
    {
        id:
            'train_1',
        action:
            'train',
        label:
            'Train 1 stat',
        target:
            1,
        tier:
            'easy'
    },
    {
        id:
            'dice_1',
        action:
            'dice',
        label:
            'Play dice 1 time',
        target:
            1,
        tier:
            'easy'
    },
    {
        id:
            'dice_2',
        action:
            'dice',
        label:
            'Play dice 2 times',
        target:
            2,
        tier:
            'medium'
    },
    {
        id:
            'dice_3',
        action:
            'dice',
        label:
            'Play dice 3 times',
        target:
            3,
        tier:
            'hard'
    },
    {
        id:
            'matchme_1',
        action:
            'matchme',
        label:
            'Use matchme 1 time',
        target:
            1,
        tier:
            'easy'
    },
    {
        id:
            'showcase_1',
        action:
            'showcase',
        label:
            'Use showcase commands 1 time',
        target:
            1,
        tier:
            'easy'
    },
    {
        id:
            'showcase_2',
        action:
            'showcase',
        label:
            'Use showcase commands 2 times',
        target:
            2,
        tier:
            'medium'
    },
    {
        id:
            'showcase_3',
        action:
            'showcase',
        label:
            'Use showcase commands 3 times',
        target:
            3,
        tier:
            'hard'
    },
    {
        id:
            'social_1',
        action:
            'social_interaction',
        label:
            'Give or receive 1 interaction',
        target:
            1,
        tier:
            'easy'
    },
    {
        id:
            'social_2',
        action:
            'social_interaction',
        label:
            'Give or receive 2 interactions',
        target:
            2,
        tier:
            'medium'
    },
    {
        id:
            'social_3',
        action:
            'social_interaction',
        label:
            'Give or receive 3 interactions',
        target:
            3,
        tier:
            'hard'
    }
].map(
    (quest) => ({
        ...quest,
        reward:
            rewardByTier[quest.tier]
    })
);

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
                        ? reject(
                            error
                        )
                        : resolve(
                            rows
                        )
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
                        ? reject(
                            error
                        )
                        : resolve(
                            row
                        )
            )
    );

}

function dbRun(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.run(
                sql,
                params,
                function(error) {
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            this
                        );
                }
            )
    );

}

function getDailyQuestDate(
    now = new Date()
) {

    const resetDate =
        new Date(
            now
        );

    if (
        resetDate.getUTCHours() < RESET_HOUR_UTC
    ) {

        resetDate.setUTCDate(
            resetDate.getUTCDate() - 1
        );

    }

    return resetDate
        .toISOString()
        .slice(
            0,
            10
        );

}

function getNextResetTimestamp(
    now = new Date()
) {

    const nextReset =
        new Date(
            now
        );

    nextReset.setUTCHours(
        RESET_HOUR_UTC,
        0,
        0,
        0
    );

    if (
        nextReset <= now
    ) {

        nextReset.setUTCDate(
            nextReset.getUTCDate() + 1
        );

    }

    return Math.floor(
        nextReset.getTime() / 1000
    );

}

function shuffle(
    items
) {

    return [...items]
        .sort(
            () =>
                Math.random() - 0.5
        );

}

function pickDailyQuests() {

    const selected = [];
    const usedActions =
        new Set();

    for (
        const quest of shuffle(
            questPool
        )
    ) {

        if (
            usedActions.has(
                quest.action
            )
        )
            continue;

        selected.push(
            quest
        );

        usedActions.add(
            quest.action
        );

        if (
            selected.length === QUESTS_PER_DAY
        )
            break;

    }

    return selected;

}

async function getStoredDailyQuests(
    userId,
    questDate
) {

    return dbAll(
        `SELECT rowid AS row_id, *
         FROM daily_quests
         WHERE user_id = ?
         AND quest_date = ?
         ORDER BY rowid`,
        [
            userId,
            questDate
        ]
    );

}

async function normalizeDailyQuests(
    userId,
    questDate,
    quests
) {

    if (
        quests.length <= QUESTS_PER_DAY
    )
        return quests;

    const keep =
        quests.slice(
            0,
            QUESTS_PER_DAY
        );

    const remove =
        quests.slice(
            QUESTS_PER_DAY
        );

    await Promise.all(
        remove.map(
            (quest) =>
                dbRun(
                    `DELETE FROM daily_quests
                     WHERE rowid = ?`,
                    [
                        quest.row_id
                    ]
                )
        )
    );

    return keep;

}

async function createDailyQuests(
    userId,
    questDate
) {

    await getOrCreateUser(
        userId
    );

    const quests =
        pickDailyQuests();

    await Promise.all(
        quests.map(
            (quest) =>
                dbRun(
                    `INSERT OR IGNORE INTO daily_quests (
                        user_id,
                        quest_date,
                        quest_id,
                        action,
                        label,
                        target,
                        progress,
                        completed,
                        reward_coins,
                        reward_xp
                    ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
                    [
                        userId,
                        questDate,
                        quest.id,
                        quest.action,
                        quest.label,
                        quest.target,
                        quest.reward.coins,
                        quest.reward.xp
                    ]
                )
        )
    );

}

async function ensureDailyQuests(
    userId
) {

    const questDate =
        getDailyQuestDate();

    let existing =
        await getStoredDailyQuests(
            userId,
            questDate
        );

    if (
        existing.length
    )
        return normalizeDailyQuests(
            userId,
            questDate,
            existing
        );

    await createDailyQuests(
        userId,
        questDate
    );

    existing =
        await getStoredDailyQuests(
            userId,
            questDate
        );

    return normalizeDailyQuests(
        userId,
        questDate,
        existing
    );

}

async function getDailyQuests(
    userId
) {

    const questDate =
        getDailyQuestDate();

    const lockKey =
        `${userId}:${questDate}`;

    if (
        assignmentLocks.has(
            lockKey
        )
    )
        return assignmentLocks.get(
            lockKey
        );

    const assignment =
        ensureDailyQuests(
            userId
        ).finally(
            () =>
                assignmentLocks.delete(
                    lockKey
                )
        );

    assignmentLocks.set(
        lockKey,
        assignment
    );

    return assignment;

}

function formatReward(
    coins,
    xp
) {

    return `${emojis.coin} **${coins} coins** + ${emojis.xp} **${xp} XP**`;

}

function buildDailyEmbed(
    interaction,
    quests
) {

    const completed =
        Math.min(
            quests.filter(
            (quest) =>
                quest.completed
            ).length,
            QUESTS_PER_DAY
        );

    const nextReset =
        getNextResetTimestamp();

    const embed =
        createUserEmbed(
            interaction,
            {
            color:
                getRandomColor(),
            command:
                '/daily',
            title:
                'Daily Quests',
            description:
                `Next reset: <t:${nextReset}:F> (<t:${nextReset}:R>)\nCompleted: **${completed}/${QUESTS_PER_DAY}**`
            }
        );

    embed.addFields(
        ...quests.map(
            (quest) => ({
                name:
                    quest.completed
                        ? `Done - ${quest.label}`
                        : quest.label,
                value:
                    `Progress: **${Math.min(
                        quest.progress,
                        quest.target
                    )}/${quest.target}**\nReward: ${formatReward(
                        quest.reward_coins,
                        quest.reward_xp
                    )}`,
                inline:
                    false
            })
        )
    );

    return embed;

}

async function buildDailyReply(
    interaction
) {

    const quests =
        await getDailyQuests(
            interaction.user.id
        );

    return {
        embeds: [
            buildDailyEmbed(
                interaction,
                quests
            )
        ],
        flags:
            64
    };

}

async function getRumorsChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.RUMORS
    ) ||
        await client.channels.fetch(
            CHANNELS.RUMORS
        ).catch(
            () => null
        );

}

async function sendQuestCompleteRumor(
    client,
    userId,
    quest,
    completedCount
) {

    const channel =
        await getRumorsChannel(
            client
        );

    if (
        !channel?.send
    )
        return;

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                'Daily Quest Complete',
            footerText:
                commandFooter(
                    '/daily'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                'Quest',
            value:
                quest.label,
            inline:
                false
        },
        {
            name:
                'Progress',
            value:
                `${quest.target} / ${quest.target}`,
            inline:
                true
        },
        {
            name:
                'Reward',
            value:
                formatReward(
                    quest.reward_coins,
                    quest.reward_xp
                ),
            inline:
                true
        },
        {
            name:
                'Daily Progress',
            value:
                `${Math.min(
                    completedCount,
                    QUESTS_PER_DAY
                )} / ${QUESTS_PER_DAY} quests completed`,
            inline:
                false
        }
    );

    await channel.send({
        content:
            `<@${userId}> completed a daily quest!`,
        embeds: [
            embed
        ]
    });

}

async function sendDailySetCompleteRumor(
    client,
    userId
) {

    const channel =
        await getRumorsChannel(
            client
        );

    if (
        !channel?.send
    )
        return;

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                'Daily Set Complete',
            footerText:
                commandFooter(
                    '/daily'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                'Completed',
            value:
                `${QUESTS_PER_DAY} / ${QUESTS_PER_DAY} daily quests`,
            inline:
                true
        },
        {
            name:
                'Bonus Reward',
            value:
                formatReward(
                    DAILY_BONUS.coins,
                    DAILY_BONUS.xp
                ),
            inline:
                true
        }
    );

    await channel.send({
        content:
            `<@${userId}> completed all daily quests!`,
        embeds: [
            embed
        ]
    });

}

async function grantQuestReward(
    userId,
    quest
) {

    await Promise.all([
        addCoins(
            userId,
            quest.reward_coins
        ),
        addXP(
            userId,
            quest.reward_xp
        )
    ]);

}

async function maybeGrantDailyBonus(
    client,
    userId,
    questDate
) {

    const completedCountRow =
        await dbGet(
            `SELECT COUNT(*) AS count
             FROM daily_quests
             WHERE user_id = ?
             AND quest_date = ?
             AND completed = 1`,
            [
                userId,
                questDate
            ]
        );

    const completedCount =
        Math.min(
            completedCountRow.count,
            QUESTS_PER_DAY
        );

    if (
        completedCount < QUESTS_PER_DAY
    )
        return completedCount;

    const bonus =
        await dbGet(
            `SELECT completed
             FROM daily_quest_bonus
             WHERE user_id = ?
             AND quest_date = ?`,
            [
                userId,
                questDate
            ]
        );

    if (
        bonus?.completed
    )
        return completedCount;

    await Promise.all([
        addCoins(
            userId,
            DAILY_BONUS.coins
        ),
        addXP(
            userId,
            DAILY_BONUS.xp
        ),
        dbRun(
            `INSERT INTO daily_quest_bonus (
                user_id,
                quest_date,
                completed
            ) VALUES (?, ?, 1)
            ON CONFLICT(user_id, quest_date)
            DO UPDATE SET completed = 1`,
            [
                userId,
                questDate
            ]
        )
    ]);

    await sendDailySetCompleteRumor(
        client,
        userId
    );

    return completedCount;

}

async function getCompletedQuestCount(
    userId,
    questDate
) {

    const row =
        await dbGet(
            `SELECT COUNT(*) AS count
             FROM daily_quests
             WHERE user_id = ?
             AND quest_date = ?
             AND completed = 1`,
            [
                userId,
                questDate
            ]
        );

    return Math.min(
        row.count,
        QUESTS_PER_DAY
    );

}

async function updateDailyQuestProgress(
    client,
    userId,
    action,
    amount = 1
) {

    const questDate =
        getDailyQuestDate();

    await getDailyQuests(
        userId
    );

    const quests =
        await dbAll(
            `SELECT *
             FROM daily_quests
             WHERE user_id = ?
             AND quest_date = ?
             AND action = ?
             AND completed = 0`,
            [
                userId,
                questDate,
                action
            ]
        );

    for (
        const quest of quests
    ) {

        const progress =
            Math.min(
                quest.progress + amount,
                quest.target
            );

        const completed =
            progress >= quest.target;

        const updateResult =
            await dbRun(
            `UPDATE daily_quests
             SET progress = ?,
                 completed = ?
             WHERE user_id = ?
             AND quest_date = ?
             AND quest_id = ?
             AND completed = 0`,
            [
                progress,
                completed
                    ? 1
                    : 0,
                userId,
                questDate,
                quest.quest_id
            ]
        );

        if (
            updateResult.changes === 0
        )
            continue;

        if (
            !completed
        )
            continue;

        const completedQuest = {
            ...quest,
            progress,
            completed:
                1
        };

        await grantQuestReward(
            userId,
            completedQuest
        );

        const completedCount =
            await getCompletedQuestCount(
                userId,
                questDate
            );

        await sendQuestCompleteRumor(
            client,
            userId,
            completedQuest,
            completedCount
        );

        await maybeGrantDailyBonus(
            client,
            userId,
            questDate
        );

    }

}

async function trackDailyQuest(
    client,
    userId,
    action,
    amount = 1
) {

    try {

        await updateDailyQuestProgress(
            client,
            userId,
            action,
            amount
        );

    }
    catch (error) {

        console.error(
            'DAILY QUEST ERROR'
        );
        console.error(
            error
        );

    }

}

module.exports = {
    buildDailyReply,
    getDailyQuestDate,
    getDailyQuests,
    questPool,
    trackDailyQuest
};
