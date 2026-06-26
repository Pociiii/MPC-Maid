const db =
    require('../../database/database');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    achievementDefinitions,
    endlessAchievements
} = require('../../data/achievementDefinitions');

const {
    createTargetUserEmbed,
    fetchDisplayTarget
} = require('../../utils/embeds');

const {
    maidFeedFlavor,
    pickOne
} = require('../../utils/flavorText');

const categoryLabels = {
    button_interactions:
        'Interaction Buttons',
    fame:
        'Fame',
    gif_submissions:
        'GIF Submissions',
    performance:
        'Performance',
    porn_scenes:
        'Porn Career',
    scene_combined_stat:
        'Scene Stat Thresholds',
    scene_combined_three_stats:
        'Scene Triple Stat Thresholds',
    scene_combined_two_stats:
        'Scene Duo Stat Thresholds',
    showcase_posts:
        'Showcase Commands',
    stamina:
        'Stamina'
};

const definitionsByKey =
    achievementDefinitions.reduce(
        (map, achievement) => {

            if (
                !map[achievement.key]
            )
                map[achievement.key] = [];

            map[achievement.key].push(
                achievement
            );

            return map;

        },
        {}
    );

for (
    const achievements of Object.values(
        definitionsByKey
    )
) {

    achievements.sort(
        (first, second) =>
            first.milestone - second.milestone
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

async function getProgress(
    userId,
    key
) {

    const row =
        await dbGet(
            `SELECT current_value
             FROM achievement_progress
             WHERE user_id = ?
             AND achievement_key = ?`,
            [
                userId,
                key
            ]
        );

    return row?.current_value ?? 0;

}

async function getAchievementPoints(
    userId
) {

    const row =
        await dbGet(
            `SELECT COALESCE(SUM(points), 0) AS points
             FROM user_achievements
             WHERE user_id = ?`,
            [
                userId
            ]
        );

    return row?.points ?? 0;

}

async function saveProgress(
    userId,
    key,
    value
) {

    await dbRun(
        `INSERT INTO achievement_progress (
            user_id,
            achievement_key,
            current_value,
            last_milestone,
            updated_at
        ) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, achievement_key)
        DO UPDATE SET
            current_value = excluded.current_value,
            updated_at = CURRENT_TIMESTAMP`,
        [
            userId,
            key,
            value
        ]
    );

}

function getMilestonesCrossed(
    key,
    previousValue,
    nextValue
) {

    const fixed =
        definitionsByKey[key] ?? [];

    const crossed =
        fixed.filter(
            (achievement) =>
                achievement.milestone > previousValue &&
                achievement.milestone <= nextValue
        );

    const endless =
        endlessAchievements[key];

    if (
        !endless ||
        nextValue <= endless.startsAfter
    )
        return crossed;

    const firstMilestone =
        Math.max(
            endless.startsAfter + endless.step,
            Math.floor(
                previousValue / endless.step
            ) * endless.step + endless.step
        );

    for (
        let milestone = firstMilestone;
        milestone <= nextValue;
        milestone += endless.step
    ) {

        if (
            milestone <= endless.startsAfter
        )
            continue;

        crossed.push({
            id:
                `${key}_${milestone}`,
            key,
            milestone,
            label:
                endless.label(
                    milestone
                ),
            points:
                endless.points
        });

    }

    return crossed;

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

async function announceAchievement(
    client,
    userId,
    achievement,
    progress
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
        await fetchDisplayTarget(
            client,
            userId
        );

    const embed =
        createTargetUserEmbed({
            color:
                getRandomColor(),
            command:
                '/profile',
            target:
                target,
            title:
                'Achievement Unlocked',
            description:
                pickOne(
                    maidFeedFlavor.achievement
                )
        });

    embed.addFields(
        {
            name:
                '🏅 Achievement',
            value:
                achievement.label,
            inline:
                false
        },
        {
            name:
                '📁 Category',
            value:
                categoryLabels[achievement.key] ??
                achievement.key,
            inline:
                true
        },
        {
            name:
                '📈 Progress',
            value:
                `${progress}`,
            inline:
                true
        },
        {
            name:
                '⭐ Points',
            value:
                `+${achievement.points ?? 0}`,
            inline:
                true
        }
    );

    await channel.send({
        content:
            null,
        embeds: [
            embed
        ]
    });

}

async function unlockAchievement(
    client,
    userId,
    achievement,
    progress
) {

    const result =
        await dbRun(
            `INSERT OR IGNORE INTO user_achievements (
                user_id,
                achievement_id,
                achievement_key,
                milestone,
                points
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                userId,
                achievement.id,
                achievement.key,
                achievement.milestone,
                achievement.points ?? 0
            ]
        );

    if (
        result.changes === 0
    )
        return;

    await dbRun(
        `UPDATE achievement_progress
         SET last_milestone = MAX(last_milestone, ?),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?
         AND achievement_key = ?`,
        [
            achievement.milestone,
            userId,
            achievement.key
        ]
    );

    await announceAchievement(
        client,
        userId,
        achievement,
        progress
    );

}

async function updateAchievementProgress(
    client,
    userId,
    key,
    nextValue
) {

    const previousValue =
        await getProgress(
            userId,
            key
        );

    if (
        nextValue <= previousValue
    )
        return;

    await saveProgress(
        userId,
        key,
        nextValue
    );

    const crossed =
        getMilestonesCrossed(
            key,
            previousValue,
            nextValue
        );

    for (
        const achievement of crossed
    ) {

        await unlockAchievement(
            client,
            userId,
            achievement,
            nextValue
        );

    }

}

async function setAchievementProgress(
    client,
    userId,
    key,
    value
) {

    try {

        await updateAchievementProgress(
            client,
            userId,
            key,
            value
        );

    }
    catch (error) {

        console.error(
            'ACHIEVEMENT ERROR'
        );
        console.error(
            error
        );

    }

}

async function incrementAchievementProgress(
    client,
    userId,
    key,
    amount = 1
) {

    try {

        const previousValue =
            await getProgress(
                userId,
                key
            );

        await updateAchievementProgress(
            client,
            userId,
            key,
            previousValue + amount
        );

    }
    catch (error) {

        console.error(
            'ACHIEVEMENT ERROR'
        );
        console.error(
            error
        );

    }

}

module.exports = {
    getAchievementPoints,
    getMilestonesCrossed,
    incrementAchievementProgress,
    setAchievementProgress
};
