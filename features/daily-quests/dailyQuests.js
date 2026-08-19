const db =
    require('../../database/database');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    createTargetUserEmbed,
    createUserEmbed,
    fetchDisplayTarget
} = require('../../utils/embeds');

const {
    addCoins,
    addXP,
    getOrCreateUser
} = require('../../utils/users');

const {
    addBooster,
    boosterStats,
    formatBooster
} = require('../../utils/boosters');

const {
    dailyFlavor,
    pickOne
} = require('../../utils/flavorText');

const {
    syncUserAchievementCounters
} = require('../achievements/achievements');

const emojis =
    require('../../utils/emojis');

const QUESTS_PER_DAY =
    2;

const assignmentLocks =
    new Map();

const RESET_HOUR_UTC =
    12;

const WEEK_START_DAY_UTC =
    1;

const DAILY_BONUS = {
    coins:
        75,
    xp:
        35
};

const WEEKLY_STREAK_TARGET =
    7;

const WEEKLY_STREAK_REWARD = {
    coins:
        500,
    xp:
        250
};

const DAILY_QUEST_BOOSTER_CHANCE =
    0.05;

const DAILY_QUEST_BOOSTER_TIER =
    1;

const rewardByActionAndTarget = {
    porn_scene: {
        1: { coins: 60, xp: 30 },
        2: { coins: 120, xp: 60 },
        3: { coins: 200, xp: 100 }
    },
    titty_drop: {
        1: { coins: 45, xp: 25 },
        2: { coins: 90, xp: 45 },
        3: { coins: 150, xp: 75 }
    },
    showcase: {
        1: { coins: 30, xp: 15 },
        2: { coins: 55, xp: 25 },
        3: { coins: 85, xp: 40 }
    },
    social_interaction: {
        1: { coins: 50, xp: 25 },
        2: { coins: 95, xp: 50 },
        3: { coins: 160, xp: 80 }
    },
    casino_play: {
        1: { coins: 0, xp: 20 },
        2: { coins: 0, xp: 40 },
        3: { coins: 0, xp: 60 }
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
            'titty_drop_1',
        action:
            'titty_drop',
        label:
            'Post 1 titty drop',
        target:
            1,
        tier:
            'easy'
    },
    {
        id:
            'titty_drop_2',
        action:
            'titty_drop',
        label:
            'Post 2 titty drops',
        target:
            2,
        tier:
            'medium'
    },
    {
        id:
            'titty_drop_3',
        action:
            'titty_drop',
        label:
            'Post 3 titty drops',
        target:
            3,
        tier:
            'hard'
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
    },
    {
        id:
            'casino_play_1',
        action:
            'casino_play',
        label:
            'Play casino games 1 time',
        target:
            1,
        tier:
            'easy'
    },
    {
        id:
            'casino_play_2',
        action:
            'casino_play',
        label:
            'Play casino games 2 times',
        target:
            2,
        tier:
            'medium'
    },
    {
        id:
            'casino_play_3',
        action:
            'casino_play',
        label:
            'Play casino games 3 times',
        target:
            3,
        tier:
            'hard'
    }
].map(
    (quest) => ({
        ...quest,
        reward:
            rewardByActionAndTarget[
                quest.action
            ][quest.target]
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

function getWeeklyQuestDate(
    now = new Date()
) {

    return getWeeklyQuestDateFromQuestDate(
        getDailyQuestDate(
            now
        )
    );

}

function getWeeklyQuestDateFromQuestDate(
    questDate
) {

    const weekDate =
        new Date(
            `${questDate}T${String(
                RESET_HOUR_UTC
            ).padStart(
                2,
                '0'
            )}:00:00.000Z`
        );

    const day =
        weekDate.getUTCDay() || 7;

    weekDate.setUTCDate(
        weekDate.getUTCDate() - day + WEEK_START_DAY_UTC
    );

    return weekDate
        .toISOString()
        .slice(
            0,
            10
        );

}

function clampWeeklyStreakCount(
    streakCount
) {

    return Math.min(
        WEEKLY_STREAK_TARGET,
        Math.max(
            0,
            Number(
                streakCount ?? 0
            )
        )
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

function addDays(
    dateText,
    amount
) {

    const date =
        new Date(
            `${dateText}T00:00:00.000Z`
        );

    date.setUTCDate(
        date.getUTCDate() + amount
    );

    return date
        .toISOString()
        .slice(
            0,
            10
        );

}

function pickRandomQuest(
    quests
) {

    return quests[
        Math.floor(
            Math.random() * quests.length
        )
    ];

}

function pickDailyQuests() {

    const pornSceneQuest =
        pickRandomQuest(
            questPool.filter(
                (quest) =>
                    quest.action === 'porn_scene'
            )
        );

    const otherActions = [
        'titty_drop',
        'showcase',
        'social_interaction',
        'casino_play'
    ];

    const otherAction =
        otherActions[
            Math.floor(
                Math.random() * otherActions.length
            )
        ];

    const otherQuest =
        pickRandomQuest(
            questPool.filter(
                (quest) =>
                    quest.action === otherAction
            )
        );

    return [
        pornSceneQuest,
        otherQuest
    ];

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

async function convertRetiredDailyQuests(
    quests
) {

    return Promise.all(
        quests.map(
            async (quest) => {

                if (
                    quest.action !==
                    'horny_help'
                )
                    return quest;

                const label =
                    `Give or receive ${quest.target} interaction${quest.target === 1 ? '' : 's'}`;

                await dbRun(
                    `UPDATE daily_quests
                     SET action = ?,
                         label = ?
                     WHERE rowid = ?`,
                    [
                        'social_interaction',
                        label,
                        quest.row_id
                    ]
                );

                return {
                    ...quest,
                    action:
                        'social_interaction',
                    label
                };

            }
        )
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

async function refreshTittyDropQuestRewards(
    userId,
    questDate
) {

    await dbRun(
        `UPDATE daily_quests
         SET reward_coins = CASE target
             WHEN 1 THEN ?
             WHEN 2 THEN ?
             ELSE ?
         END,
             reward_xp = CASE target
             WHEN 1 THEN ?
             WHEN 2 THEN ?
             ELSE ?
         END
         WHERE user_id = ?
         AND quest_date = ?
         AND action = 'titty_drop'
         AND completed = 0
         AND reward_coins != CASE target
             WHEN 1 THEN ?
             WHEN 2 THEN ?
             ELSE ?
         END`,
        [
            rewardByActionAndTarget.titty_drop[1].coins,
            rewardByActionAndTarget.titty_drop[2].coins,
            rewardByActionAndTarget.titty_drop[3].coins,
            rewardByActionAndTarget.titty_drop[1].xp,
            rewardByActionAndTarget.titty_drop[2].xp,
            rewardByActionAndTarget.titty_drop[3].xp,
            userId,
            questDate,
            rewardByActionAndTarget.titty_drop[1].coins,
            rewardByActionAndTarget.titty_drop[2].coins,
            rewardByActionAndTarget.titty_drop[3].coins
        ]
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
    ) {

        await refreshTittyDropQuestRewards(
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
            await convertRetiredDailyQuests(
                existing
            )
        );

    }

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

    return `**${coins} coins** + **${xp} XP**`;

}

function formatWeeklyStreakProgress(
    streak,
    questDate
) {

    if (
        streak.lastCompletedDate === questDate &&
        clampWeeklyStreakCount(
            streak.streakCount
        ) === 0 &&
        streak.weeklyRewardsClaimed > 0
    )
        return `${WEEKLY_STREAK_TARGET}/${WEEKLY_STREAK_TARGET} - reward claimed today`;

    return `${clampWeeklyStreakCount(
        streak.streakCount
    )}/${WEEKLY_STREAK_TARGET}`;

}

function pickBooster(
    tier
) {

    const stat =
        boosterStats[
            Math.floor(
                Math.random() *
                boosterStats.length
            )
        ];

    return {
        stat,
        tier
    };

}

function pickDailyQuestBooster() {

    return pickBooster(
        DAILY_QUEST_BOOSTER_TIER
    );

}

async function getWeeklyStreak(
    userId
) {

    const streak =
        await dbGet(
            `SELECT *
             FROM daily_quest_weekly_streaks
             WHERE user_id = ?`,
            [
                userId
            ]
        );

    return {
        lastCompletedDate:
            streak?.last_completed_date ?? null,
        streakCount:
            Number(
                streak?.streak_count ?? 0
            ),
        weeklyRewardsClaimed:
            Number(
                streak?.weekly_rewards_claimed ?? 0
            )
    };

}

async function updateWeeklyStreak(
    userId,
    questDate
) {

    const storedStreak =
        await getWeeklyStreak(
            userId
        );

    const streak =
        storedStreak;

    const currentStreakCount =
        clampWeeklyStreakCount(
            streak.streakCount
        );

    if (
        streak.lastCompletedDate === questDate
    )
        return {
            awarded:
                false,
            streakCount:
                currentStreakCount
        };

    const expectedNextDate =
        streak.lastCompletedDate
            ? addDays(
                streak.lastCompletedDate,
                1
            )
            : null;

    let nextStreakCount =
        expectedNextDate === questDate
            ? currentStreakCount + 1
            : 1;

    nextStreakCount =
        clampWeeklyStreakCount(
            nextStreakCount
        );

    let awarded =
        false;

    let rewardsClaimed =
        streak.weeklyRewardsClaimed;

    if (
        nextStreakCount >= WEEKLY_STREAK_TARGET
    ) {

        await Promise.all([
            addCoins(
                userId,
                WEEKLY_STREAK_REWARD.coins,
                {
                    source:
                        'weekly_quest_streak'
                }
            ),
            addXP(
                userId,
                WEEKLY_STREAK_REWARD.xp
            )
        ]);

        nextStreakCount = 0;
        rewardsClaimed += 1;
        awarded = true;

    }

    await dbRun(
        `INSERT INTO daily_quest_weekly_streaks (
            user_id,
            last_completed_date,
            streak_count,
            weekly_rewards_claimed
        ) VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id)
        DO UPDATE SET
            last_completed_date = excluded.last_completed_date,
            streak_count = excluded.streak_count,
            weekly_rewards_claimed = excluded.weekly_rewards_claimed`,
        [
            userId,
            questDate,
            nextStreakCount,
            rewardsClaimed
        ]
    );

    return {
        awarded,
        streakCount:
            nextStreakCount
    };

}

async function getAnnouncementTarget(
    client,
    userId
) {

    return fetchDisplayTarget(
        client,
        userId
    );

}

async function buildDailyEmbed(
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

    const weeklyStreak =
        await getWeeklyStreak(
            interaction.user.id
        );

    const questDate =
        getDailyQuestDate();

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
                `- Next reset: <t:${nextReset}:F> (<t:${nextReset}:R>)\n- Completed: **${completed}/${QUESTS_PER_DAY}**\n- Weekly streak: **${formatWeeklyStreakProgress(
                    weeklyStreak,
                    questDate
                )}**`
            }
        );

    embed.addFields(
        ...quests.map(
            (quest) => ({
                name:
                    quest.completed
                        ? `\u2705 Done - ${quest.label}`
                        : `\uD83D\uDCCB ${quest.label}`,
                value:
                    `- Progress: **${Math.min(
                        quest.progress,
                        quest.target
                    )}/${quest.target}**\n- Reward: ${formatReward(
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
            await buildDailyEmbed(
                interaction,
                quests
            )
        ],
        flags:
            64
    };

}

async function getMaidFeedChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.MAID_FEED
    ) ||
        await client.channels.fetch(
            CHANNELS.MAID_FEED
        ).catch(
            () => null
        );

}

async function sendQuestCompleteFeed(
    client,
    userId,
    quest,
    completedCount,
    luckyBooster = null
) {

    const channel =
        await getMaidFeedChannel(
            client
        );

    if (
        !channel?.send
    )
        return;

    const target =
        await getAnnouncementTarget(
            client,
            userId
        );

    const embed =
        createTargetUserEmbed({
            color:
                getRandomColor(),
            command:
                '/daily',
            target,
            title:
                'Daily Quest Complete',
            description:
                pickOne(
                    dailyFlavor.quest
                )
        });

    embed.addFields(
        {
            name:
                '\uD83D\uDCCB Quest',
            value:
                quest.label,
            inline:
                false
        },
        {
            name:
                '\uD83D\uDCC8 Progress',
            value:
                `${quest.target} / ${quest.target}`,
            inline:
                true
        },
        {
            name:
                `${emojis.coin} Reward`,
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
                '\u2705 Daily Progress',
            value:
                `${Math.min(
                    completedCount,
                    QUESTS_PER_DAY
                )} / ${QUESTS_PER_DAY} quests completed`,
            inline:
                false
        }
    );

    if (
        luckyBooster
    )
        embed.addFields({
            name:
                '\uD83C\uDFB2 Lucky Drop',
            value:
                `You also found **${formatBooster(
                    luckyBooster
                )}**.`,
            inline:
                false
        });

    await channel.send({
        content:
            null,
        embeds: [
            embed
        ]
    });

}

async function sendDailySetCompleteFeed(
    client,
    userId,
    weeklyResult = null
) {

    const channel =
        await getMaidFeedChannel(
            client
        );

    if (
        !channel?.send
    )
        return;

    const target =
        await getAnnouncementTarget(
            client,
            userId
        );

    const embed =
        createTargetUserEmbed({
            color:
                getRandomColor(),
            command:
                '/daily',
            target,
            title:
                'Daily Set Complete',
            description:
                pickOne(
                    weeklyResult?.awarded
                        ? dailyFlavor.weekly
                        : dailyFlavor.set
                )
        });

    embed.addFields(
        {
            name:
                '\u2705 Completed',
            value:
                `${QUESTS_PER_DAY} / ${QUESTS_PER_DAY} daily quests`,
            inline:
                true
        },
        {
            name:
                `${emojis.coin} Bonus Reward`,
            value:
                formatReward(
                    DAILY_BONUS.coins,
                    DAILY_BONUS.xp
                ),
            inline:
                true
        }
    );

    if (
        weeklyResult
    )
        embed.addFields({
            name:
                '\uD83D\uDCC5 Weekly Streak',
            value:
                weeklyResult.awarded
                    ? `${WEEKLY_STREAK_TARGET} / ${WEEKLY_STREAK_TARGET} days complete`
                    : `${weeklyResult.streakCount} / ${WEEKLY_STREAK_TARGET} days complete`,
            inline:
                true
        });

    if (
        weeklyResult?.awarded
    )
        embed.addFields({
            name:
                '\uD83C\uDF81 Weekly Reward',
            value:
                formatReward(
                    WEEKLY_STREAK_REWARD.coins,
                    WEEKLY_STREAK_REWARD.xp
                ),
            inline:
                false
        });

    await channel.send({
        content:
            weeklyResult?.awarded
                ? `<@${userId}> completed a full weekly streak!`
                : `<@${userId}> completed all daily quests!`,
        embeds: [
            embed
        ]
    });

}

async function grantQuestReward(
    client,
    userId,
    quest
) {

    await Promise.all([
        addCoins(
            userId,
            quest.reward_coins,
            {
                source:
                    'daily_quest'
            }
        ),
        addXP(
            userId,
            quest.reward_xp
        )
    ]);

    await syncUserAchievementCounters(
        client,
        userId,
        [
            'wallet_coins',
            'xp_earned'
        ]
    );

}

async function maybeGrantDailyQuestBooster(
    userId
) {

    if (
        Math.random() >= DAILY_QUEST_BOOSTER_CHANCE
    )
        return null;

    const booster =
        pickDailyQuestBooster();

    await addBooster(
        userId,
        booster.stat,
        booster.tier
    );

    return booster;

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
                DAILY_BONUS.coins,
                {
                    source:
                        'daily_quest_bonus'
                }
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

    await syncUserAchievementCounters(
        client,
        userId,
        [
            'wallet_coins',
            'xp_earned'
        ]
    );

    const weeklyResult =
        await updateWeeklyStreak(
            userId,
            questDate
        );

    if (
        weeklyResult.awarded
    )
        await syncUserAchievementCounters(
            client,
            userId,
            [
                'wallet_coins',
                'xp_earned'
            ]
        );

    await sendDailySetCompleteFeed(
        client,
        userId,
        weeklyResult
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

    const casinoActions =
        new Set([
            'dice',
            'blackjack',
            'slots'
        ]);

    const compatibleAction =
        casinoActions.has(
            action
        )
            ? 'casino_play'
            : action;

    const quests =
        await dbAll(
            `SELECT *
             FROM daily_quests
             WHERE user_id = ?
             AND quest_date = ?
             AND action IN (?, ?)
             AND completed = 0`,
            [
                userId,
                questDate,
                compatibleAction,
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
            client,
            userId,
            completedQuest
        );

        const luckyBooster =
            await maybeGrantDailyQuestBooster(
                userId
            );

        const completedCount =
            await getCompletedQuestCount(
                userId,
                questDate
            );

        await sendQuestCompleteFeed(
            client,
            userId,
            completedQuest,
            completedCount,
            luckyBooster
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
    getNextResetTimestamp,
    getWeeklyQuestDate,
    questPool,
    trackDailyQuest
};
