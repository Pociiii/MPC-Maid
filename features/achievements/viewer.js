const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const db =
    require('../../database/database');

const {
    getRandomColor
} = require('../../data/constants');

const {
    achievementDefinitions,
    endlessAchievements
} = require('../../data/achievementDefinitions');

const {
    createTargetUserEmbed
} = require('../../utils/embeds');

const emojis =
    require('../../utils/emojis');

const views = {
    overview: {
        label:
            'Overview',
        emoji:
            '🏅',
        title:
            'Achievements',
        keys:
            [
                'porn_scenes',
                'scene_combined_stat',
                'performance',
                'stamina',
                'fame',
                'button_interactions',
                'showcase_posts',
                'gif_submissions'
            ]
    },
    porn: {
        label:
            'Porn',
        emoji:
            '🎬',
        title:
            'Porn Career Achievements',
        keys:
            [
                'porn_scenes',
                'scene_combined_stat'
            ]
    },
    stats: {
        label:
            'Stats',
        emoji:
            '📈',
        title:
            'Stat Achievements',
        keys:
            [
                'performance',
                'stamina',
                'fame'
            ]
    },
    social: {
        label:
            'Social',
        emoji:
            '✨',
        title:
            'Social Achievements',
        keys:
            [
                'button_interactions'
            ]
    },
    showcase: {
        label:
            'Showcase',
        emoji:
            '🔥',
        title:
            'Showcase Achievements',
        keys:
            [
                'showcase_posts'
            ]
    },
    gifs: {
        label:
            'GIFs',
        emoji:
            '🖼️',
        title:
            'GIF Achievements',
        keys:
            [
                'gif_submissions'
            ]
    }
};

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

const definitionsById =
    new Map(
        achievementDefinitions.map(
            (achievement) => [
                achievement.id,
                achievement
            ]
        )
    );

for (
    const definitions of Object.values(
        definitionsByKey
    )
)
    definitions.sort(
        (first, second) =>
            first.milestone - second.milestone
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

async function getAchievementData(
    userId
) {

    const [
        unlocked,
        progressRows,
        pointsRow
    ] =
        await Promise.all([
            dbAll(
                `SELECT *
                 FROM user_achievements
                 WHERE user_id = ?
                 ORDER BY unlocked_at DESC`,
                [
                    userId
                ]
            ),
            dbAll(
                `SELECT *
                 FROM achievement_progress
                 WHERE user_id = ?`,
                [
                    userId
                ]
            ),
            dbGet(
                `SELECT COALESCE(SUM(points), 0) AS points
                 FROM user_achievements
                 WHERE user_id = ?`,
                [
                    userId
                ]
            )
        ]);

    return {
        points:
            pointsRow?.points ?? 0,
        progressByKey:
            new Map(
                progressRows.map(
                    (row) => [
                        row.achievement_key,
                        Number(
                            row.current_value
                        )
                    ]
                )
            ),
        unlocked,
        unlockedById:
            new Set(
                unlocked.map(
                    (achievement) =>
                        achievement.achievement_id
                )
            ),
        unlockedByKey:
            unlocked.reduce(
                (map, achievement) => {

                    if (
                        !map[achievement.achievement_key]
                    )
                        map[achievement.achievement_key] = [];

                    map[achievement.achievement_key].push(
                        achievement
                    );

                    return map;

                },
                {}
            )
    };

}

function getNextEndlessAchievement(
    key,
    current
) {

    const endless =
        endlessAchievements[key];

    if (
        !endless
    )
        return null;

    const milestone =
        Math.max(
            endless.startsAfter + endless.step,
            Math.floor(
                current / endless.step
            ) * endless.step + endless.step
        );

    return {
        id:
            `${key}_${milestone}`,
        key,
        label:
            endless.label(
                milestone
            ),
        milestone,
        points:
            endless.points
    };

}

function getNextAchievement(
    key,
    current
) {

    const fixed =
        definitionsByKey[key] ?? [];

    const nextFixed =
        fixed.find(
            (achievement) =>
                achievement.milestone > current
        );

    if (
        nextFixed
    )
        return nextFixed;

    return getNextEndlessAchievement(
        key,
        current
    );

}

function getAchievementLabel(
    achievement
) {

    const fixed =
        definitionsById.get(
            achievement.achievement_id
        );

    if (
        fixed
    )
        return fixed.label;

    const endless =
        endlessAchievements[achievement.achievement_key];

    if (
        endless
    )
        return endless.label(
            achievement.milestone
        );

    return achievement.achievement_id;

}

function formatProgress(
    current,
    target
) {

    return `${Math.min(
        current,
        target
    )}/${target}`;

}

function formatKeySummary(
    key,
    data
) {

    const current =
        data.progressByKey.get(
            key
        ) ?? 0;

    const unlocked =
        data.unlockedByKey[key] ?? [];

    const next =
        getNextAchievement(
            key,
            current
        );

    const latest =
        unlocked
            .slice(
                0,
                3
            )
            .map(
                (achievement) =>
                    `✅ ${getAchievementLabel(
                        achievement
                    )}`
            );

    return [
        `${emojis.xp} Progress: **${current}**`,
        `🏅 Unlocked: **${unlocked.length}**`,
        next
            ? `➡️ Next: **${next.label}** (${formatProgress(
                current,
                next.milestone
            )})`
            : '✅ All fixed milestones complete.',
        latest.length
            ? `Latest: ${latest.join(
                ', '
            )}`
            : null
    ]
        .filter(
            Boolean
        )
        .join(
            '\n'
        );

}

function formatOverviewField(
    key,
    data
) {

    const current =
        data.progressByKey.get(
            key
        ) ?? 0;

    const unlocked =
        data.unlockedByKey[key]?.length ?? 0;

    const next =
        getNextAchievement(
            key,
            current
        );

    return next
        ? `Unlocked: **${unlocked}**\nNext: **${formatProgress(
            current,
            next.milestone
        )}**`
        : `Unlocked: **${unlocked}**\nAll fixed milestones complete.`;

}

function buildRows(
    ownerId,
    targetId,
    activeView
) {

    const buttons =
        Object.entries(
            views
        )
            .map(
                ([view, data]) =>
                    new ButtonBuilder()
                        .setCustomId(
                            `achievements_view:${ownerId}:${targetId}:${view}`
                        )
                        .setLabel(
                            data.label
                        )
                        .setEmoji(
                            data.emoji
                        )
                        .setStyle(
                            view === activeView
                                ? ButtonStyle.Primary
                                : ButtonStyle.Secondary
                        )
            );

    const rows = [];

    for (
        let index = 0;
        index < buttons.length;
        index += 5
    )
        rows.push(
            new ActionRowBuilder()
                .addComponents(
                    buttons.slice(
                        index,
                        index + 5
                    )
                )
        );

    return rows;

}

async function buildAchievementsReply(
    interaction,
    target,
    view = 'overview'
) {

    const activeView =
        views[view]
            ? view
            : 'overview';

    const data =
        await getAchievementData(
            target.id
        );

    const embed =
        createTargetUserEmbed({
            color:
                getRandomColor(),
            command:
                '/achievements',
            target,
            title:
                views[activeView].title,
            description:
`${emojis.xp} Achievement Points: **${Number(
    data.points
).toLocaleString()}**
🏅 Fixed Unlocked: **${data.unlocked.filter(
    (achievement) =>
        definitionsById.has(
            achievement.achievement_id
        )
).length}/${achievementDefinitions.length}**
✨ Total Unlocked: **${data.unlocked.length}**`
        });

    if (
        activeView === 'overview'
    ) {

        embed.addFields(
            ...views.overview.keys.map(
                (key) => ({
                    name:
                        categoryLabels[key] ?? key,
                    value:
                        formatOverviewField(
                            key,
                            data
                        ),
                    inline:
                        true
                })
            )
        );

    }
    else {

        embed.addFields(
            ...views[activeView].keys.map(
                (key) => ({
                    name:
                        categoryLabels[key] ?? key,
                    value:
                        formatKeySummary(
                            key,
                            data
                        ),
                    inline:
                        false
                })
            )
        );

    }

    return {
        components:
            buildRows(
                interaction.user.id,
                target.id,
                activeView
            ),
        embeds: [
            embed
        ]
    };

}

async function handleAchievementsView(
    interaction
) {

    const [
        ,
        ownerId,
        targetId,
        view
    ] =
        interaction.customId.split(
            ':'
        );

    if (
        interaction.user.id !== ownerId
    ) {

        await interaction.reply({
            content:
                'This achievement panel belongs to someone else.',
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    const target =
        await interaction.client.users.fetch(
            targetId
        ).catch(
            () => ({
                id:
                    targetId,
                displayName:
                    'MPC Member',
                displayAvatarURL:
                    () => undefined
            })
        );

    await interaction.editReply(
        await buildAchievementsReply(
            interaction,
            target,
            view
        )
    );

}

module.exports = {
    buildAchievementsReply,
    handleAchievementsView
};
