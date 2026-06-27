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
    createTargetUserEmbed,
    fetchDisplayTarget
} = require('../../utils/embeds');

const emojis =
    require('../../utils/emojis');

const views = {
    overview: {
        label:
            'Overview',
        emoji:
            '\uD83C\uDFC5',
        title:
            'Achievements',
        keys:
            [
                'porn_scenes',
                'scene_combined_stat',
                'scene_combined_two_stats',
                'scene_combined_three_stats',
                'performance',
                'stamina',
                'fame',
                'all_stats',
                'wallet_coins',
                'xp_earned',
                'ranking_reached',
                'profile_likes_received',
                'daily_wyr_votes',
                'drinks_bought',
                'fireworks_launched',
                'button_interactions',
                'showcase_posts',
                'gif_submissions'
            ]
    },
    porn: {
        label:
            'Porn',
        emoji:
            '\uD83C\uDFAC',
        title:
            'Porn Career Achievements',
        keys:
            [
                'porn_scenes',
                'scene_combined_stat',
                'scene_combined_two_stats',
                'scene_combined_three_stats'
            ]
    },
    stats: {
        label:
            'Stats',
        emoji:
            '\uD83D\uDCC8',
        title:
            'Stat Achievements',
        keys:
            [
                'performance',
                'stamina',
                'fame',
                'all_stats'
            ]
    },
    progress: {
        label:
            'Progress',
        emoji:
            '\uD83D\uDCC8',
        title:
            'Progress Achievements',
        keys:
            [
                'wallet_coins',
                'xp_earned',
                'ranking_reached'
            ]
    },
    social: {
        label:
            'Social',
        emoji:
            '\u2728',
        title:
            'Social Achievements',
        keys:
            [
                'button_interactions',
                'spanks_given',
                'spanks_taken',
                'kisses_given',
                'kisses_taken',
                'horny_helps',
                'horny_helped',
                'brofists_given',
                'brofists_taken',
                'profile_likes_received',
                'daily_wyr_votes',
                'drinks_bought',
                'fireworks_launched'
            ]
    },
    showcase: {
        label:
            'Showcase',
        emoji:
            '\uD83D\uDD25',
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
            '\uD83D\uDDBC\uFE0F',
        title:
            'GIF Achievements',
        keys:
            [
                'gif_submissions'
            ]
    }
};

const categoryLabels = {
    all_stats:
        '\u2696\uFE0F Balanced Stats',
    brofists_given:
        '\uD83E\uDD1C Brofists Given',
    brofists_taken:
        '\uD83E\uDD1C Brofists Received',
    button_interactions:
        '\uD83D\uDD18 Interaction Buttons',
    daily_wyr_votes:
        '\u2753 Daily WYR Votes',
    drinks_bought:
        '\uD83C\uDF79 Drink Rounds',
    fame:
        '\uD83D\uDC51 Fame',
    fireworks_launched:
        '\uD83C\uDF86 Fireworks Launched',
    gif_submissions:
        '\uD83D\uDDBC\uFE0F GIF Submissions',
    horny_helped:
        '\uD83E\uDD1D Helps Received',
    horny_helps:
        '\uD83E\uDD1D Helps Given',
    kisses_given:
        '\uD83D\uDC8B Kisses Given',
    kisses_taken:
        '\uD83D\uDC8B Kisses Received',
    performance:
        '\uD83D\uDCAA Performance',
    porn_scenes:
        '\uD83C\uDFAC Porn Career',
    profile_likes_received:
        '\u2764\uFE0F Profile Likes',
    ranking_reached:
        '\uD83C\uDFC6 Ranking',
    scene_combined_stat:
        '\uD83D\uDCCA Scene Stat Thresholds',
    scene_combined_three_stats:
        '\uD83C\uDFB2 Scene Triple Stat Thresholds',
    scene_combined_two_stats:
        '\uD83D\uDC65 Scene Duo Stat Thresholds',
    showcase_posts:
        '\uD83D\uDD25 Showcase Commands',
    spanks_given:
        '\uD83D\uDC4B Spanks Given',
    spanks_taken:
        '\uD83D\uDC4B Spanks Received',
    stamina:
        '\u2764\uFE0F Stamina',
    wallet_coins:
        `${emojis.coin} Coins`,
    xp_earned:
        '\u2B50 XP Earned'
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
                    getAchievementLabel(
                        achievement
                    )
            );

    return [
        `- Progress: **${current}**`,
        `- Unlocked: **${unlocked.length}**`,
        next
            ? `- Next: **${next.label}** (${formatProgress(
                current,
                next.milestone
            )})`
            : '- All fixed milestones complete.',
        latest.length
            ? `- Latest: ${latest.join(
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
        ? `- Unlocked: **${unlocked}**\n- Next: **${formatProgress(
            current,
            next.milestone
        )}**`
        : `- Unlocked: **${unlocked}**\n- All fixed milestones complete.`;

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
`- Achievement Points: **${Number(
    data.points
).toLocaleString()}**
- Fixed Unlocked: **${data.unlocked.filter(
    (achievement) =>
        definitionsById.has(
            achievement.achievement_id
        )
).length}/${achievementDefinitions.length}**
- Total Unlocked: **${data.unlocked.length}**`
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
        await fetchDisplayTarget(
            interaction.client,
            targetId
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
