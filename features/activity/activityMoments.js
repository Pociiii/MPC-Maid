const db =
    require('../../database/database');

const {
    getDailyQuestDate,
    getWeeklyQuestDate
} = require('../daily-quests/dailyQuests');

const {
    CHANNELS
} = require('../../data/constants');

const {
    buildMomentEmbed
} = require('../../utils/moments');

const {
    fetchDisplayTarget,
    getDisplayAvatar,
    getDisplayName
} = require('../../utils/embeds');

const sceneDailyThresholds = [
    3,
    5,
    10,
    20,
    40
];

const sceneWeeklyThresholds = [
    10,
    25,
    50,
    100,
    200
];

const buttonDailyThresholds = [
    5,
    10,
    20,
    40,
    80
];

const buttonWeeklyThresholds = [
    25,
    50,
    100,
    200,
    400
];

const fieldIcons = {
    actor:
        '\uD83C\uDFAD',
    career:
        '\uD83C\uDF1F',
    latestOutcome:
        '\uD83C\uDFB2',
    milestone:
        '\uD83C\uDFC1',
    partner:
        '\uD83E\uDD1D',
    today:
        '\uD83D\uDCC5',
    week:
        '\uD83D\uDCC6'
};

const activityConfig = {
    scene: {
        actorLabel:
            'Performer',
        command:
            '/pornscene',
        lifetimeColumn:
            'scenes_completed',
        lifetimeEvery:
            10,
        momentType:
            'activity_scene_milestone',
        partnerLabel:
            'Scene Partner',
        plural:
            'scenes',
        singular:
            'scene',
        titles: {
            daily:
                'Daily Scene Update',
            lifetime:
                'Career Scene Moment',
            weekly:
                'Weekly Scene Update'
        },
        dailyThresholds:
            sceneDailyThresholds,
        weeklyThresholds:
            sceneWeeklyThresholds
    },
    help: {
        actorLabel:
            'Helper',
        command:
            '/horny',
        lifetimeColumn:
            'horny_helps',
        lifetimeEvery:
            10,
        momentType:
            'activity_help_milestone',
        partnerLabel:
            'Helped',
        plural:
            'helps',
        singular:
            'help',
        titles: {
            daily:
                'Daily Help Update',
            lifetime:
                'Help Moment',
            weekly:
                'Weekly Help Update'
        },
        dailyThresholds:
            sceneDailyThresholds,
        weeklyThresholds:
            sceneWeeklyThresholds
    },
    spank: {
        actorLabel:
            'Spanker',
        command:
            '/wiggle',
        lifetimeColumn:
            'spanks_given',
        lifetimeEvery:
            25,
        momentType:
            'activity_spank_milestone',
        partnerLabel:
            'Latest Spanked',
        plural:
            'spanks',
        singular:
            'spank',
        titles: {
            daily:
                'Daily Spank Update',
            lifetime:
                'Spank Moment',
            weekly:
                'Weekly Spank Update'
        },
        dailyThresholds:
            buttonDailyThresholds,
        weeklyThresholds:
            buttonWeeklyThresholds
    },
    kiss: {
        actorLabel:
            'Kisser',
        command:
            '/flex',
        lifetimeColumn:
            'kisses_given',
        lifetimeEvery:
            25,
        momentType:
            'activity_kiss_milestone',
        partnerLabel:
            'Latest Kissed',
        plural:
            'kisses',
        singular:
            'kiss',
        titles: {
            daily:
                'Daily Kiss Update',
            lifetime:
                'Kiss Moment',
            weekly:
                'Weekly Kiss Update'
        },
        dailyThresholds:
            buttonDailyThresholds,
        weeklyThresholds:
            buttonWeeklyThresholds
    },
    brofist: {
        actorLabel:
            'Brofist',
        command:
            '/flex',
        lifetimeColumn:
            'brofists_given',
        lifetimeEvery:
            25,
        momentType:
            'activity_brofist_milestone',
        partnerLabel:
            'Latest Brofist',
        plural:
            'brofists',
        singular:
            'brofist',
        titles: {
            daily:
                'Daily Brofist Update',
            lifetime:
                'Brofist Moment',
            weekly:
                'Weekly Brofist Update'
        },
        dailyThresholds:
            buttonDailyThresholds,
        weeklyThresholds:
            buttonWeeklyThresholds
    }
};

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

function numberOrZero(
    value
) {

    return Number(
        value ?? 0
    );

}

function unitLabel(
    config,
    count
) {

    return count === 1
        ? config.singular
        : config.plural;

}

function formatCount(
    config,
    count
) {

    return `${count} ${unitLabel(
        config,
        count
    )}`;

}

function hotCountFor(
    details
) {

    return details.outcome === 'Hot'
        ? 1
        : 0;

}

function viralCountFor(
    details
) {

    return details.outcome === 'Viral'
        ? 1
        : 0;

}

function criticalCountFor(
    details
) {

    return details.criticalScene
        ? 1
        : 0;

}

async function updatePeriodStats(
    userId,
    activityType,
    periodType,
    periodKey,
    details,
    now
) {

    const amount =
        numberOrZero(
            details.amount
        ) || 1;

    await dbRun(
        `INSERT INTO user_activity_period_stats (
            user_id,
            activity_type,
            period_type,
            period_key,
            count,
            xp,
            coins,
            ranking,
            hot_count,
            viral_count,
            critical_count,
            last_at
        ) VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
        ON CONFLICT (
            user_id,
            activity_type,
            period_type,
            period_key
        ) DO UPDATE SET
            count = count + excluded.count,
            xp = xp + excluded.xp,
            coins = coins + excluded.coins,
            ranking = ranking + excluded.ranking,
            hot_count = hot_count + excluded.hot_count,
            viral_count = viral_count + excluded.viral_count,
            critical_count = critical_count + excluded.critical_count,
            last_at = excluded.last_at`,
        [
            userId,
            activityType,
            periodType,
            periodKey,
            amount,
            numberOrZero(
                details.xp
            ),
            numberOrZero(
                details.coins
            ),
            numberOrZero(
                details.ranking
            ),
            hotCountFor(
                details
            ),
            viralCountFor(
                details
            ),
            criticalCountFor(
                details
            ),
            now.toISOString()
        ]
    );

    return dbGet(
        `SELECT *
         FROM user_activity_period_stats
         WHERE user_id = ?
         AND activity_type = ?
         AND period_type = ?
         AND period_key = ?`,
        [
            userId,
            activityType,
            periodType,
            periodKey
        ]
    );

}

async function getLifetimeCount(
    userId,
    config
) {

    const row =
        await dbGet(
            `SELECT ${config.lifetimeColumn} AS count
             FROM users
             WHERE id = ?`,
            [
                userId
            ]
        );

    return numberOrZero(
        row?.count
    );

}

function findPeriodMilestone(
    count,
    thresholds
) {

    return thresholds.includes(
        count
    )
        ? count
        : null;

}

function findLifetimeMilestone(
    count,
    every
) {

    if (
        count <= 0 ||
        every <= 0 ||
        count % every !== 0
    )
        return null;

    return count;

}

function pickMilestone(
    config,
    lifetimeCount,
    dailyCount,
    weeklyCount
) {

    const weeklyMilestone =
        findPeriodMilestone(
            weeklyCount,
            config.weeklyThresholds
        );

    if (
        weeklyMilestone
    )
        return {
            milestone:
                weeklyMilestone,
            periodType:
                'weekly'
        };

    const dailyMilestone =
        findPeriodMilestone(
            dailyCount,
            config.dailyThresholds
        );

    if (
        dailyMilestone
    )
        return {
            milestone:
                dailyMilestone,
            periodType:
                'daily'
        };

    const lifetimeMilestone =
        findLifetimeMilestone(
            lifetimeCount,
            config.lifetimeEvery
        );

    if (
        lifetimeMilestone
    )
        return {
            milestone:
                lifetimeMilestone,
            periodType:
                'lifetime'
        };

    return null;

}

function periodKeyForMilestone(
    milestone,
    dailyKey,
    weeklyKey
) {

    if (
        milestone.periodType === 'daily'
    )
        return dailyKey;

    if (
        milestone.periodType === 'weekly'
    )
        return weeklyKey;

    return 'all';

}

async function hasPostedMilestone(
    userId,
    activityType,
    milestone,
    periodKey
) {

    const row =
        await dbGet(
            `SELECT 1
             FROM user_activity_moment_posts
             WHERE user_id = ?
             AND activity_type = ?
             AND period_type = ?
             AND period_key = ?
             AND milestone = ?`,
            [
                userId,
                activityType,
                milestone.periodType,
                periodKey,
                milestone.milestone
            ]
        );

    return Boolean(
        row
    );

}

async function markMilestonePosted(
    userId,
    activityType,
    milestone,
    periodKey
) {

    await dbRun(
        `INSERT OR IGNORE INTO user_activity_moment_posts (
            user_id,
            activity_type,
            period_type,
            period_key,
            milestone
        ) VALUES (
            ?,
            ?,
            ?,
            ?,
            ?
        )`,
        [
            userId,
            activityType,
            milestone.periodType,
            periodKey,
            milestone.milestone
        ]
    );

}

function milestoneTitle(
    config,
    milestone
) {

    return config.titles[milestone.periodType] ??
        'Activity Moment';

}

function milestoneDescription(
    config,
    milestone
) {

    if (
        milestone.periodType === 'daily'
    )
        return `${formatCount(
            config,
            milestone.milestone
        )} today`;

    if (
        milestone.periodType === 'weekly'
    )
        return `${formatCount(
            config,
            milestone.milestone
        )} this week`;

    return `${formatCount(
        config,
        milestone.milestone
    )} total`;

}

function isActivityFeedMilestone(
    milestone
) {

    return [
        'daily',
        'weekly',
        'lifetime'
    ].includes(
        milestone.periodType
    );

}

async function getMaidFeedChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.MAID_FEED
    ) ??
        await client.channels.fetch(
            CHANNELS.MAID_FEED
        ).catch(
            () => null
        );

}

async function postActivityFeed(
    client,
    options
) {

    const channel =
        await getMaidFeedChannel(
            client
        );

    if (
        !channel?.isTextBased?.() &&
        !channel?.send
    )
        return null;

    const embed =
        buildMomentEmbed(
            options
        );

    return channel.send({
        content:
            options.content,
        embeds: [
            embed
        ]
    });

}

function activityFeedFlavor(
    displayName,
    config,
    milestone
) {

    if (
        !isActivityFeedMilestone(
            milestone
        )
    )
        return undefined;

    return `${displayName} reached ${milestoneDescription(
        config,
        milestone
    )}.`;

}

function buildFields(
    userId,
    config,
    milestone,
    dailyStats,
    weeklyStats,
    lifetimeCount,
    details
) {

    const fields = [
        {
            name:
                `${fieldIcons.actor} ${config.actorLabel}`,
            value:
                `<@${userId}>`,
            inline:
                true
        },
        {
            name:
                `${fieldIcons.milestone} Milestone`,
            value:
                `**${milestoneDescription(
                    config,
                    milestone
                )}**`,
            inline:
                true
        },
        {
            name:
                `${fieldIcons.today} Today`,
            value:
                `**${formatCount(
                    config,
                    numberOrZero(
                        dailyStats?.count
                    )
                )}**`,
            inline:
                true
        },
        {
            name:
                `${fieldIcons.week} This Week`,
            value:
                `**${formatCount(
                    config,
                    numberOrZero(
                        weeklyStats?.count
                    )
                )}**`,
            inline:
                true
        },
        {
            name:
                `${fieldIcons.career} Career`,
            value:
                `**${formatCount(
                    config,
                    lifetimeCount
                )}**`,
            inline:
                true
        }
    ];

    if (
        details.partnerId
    )
        fields.push({
            name:
                `${fieldIcons.partner} ${config.partnerLabel}`,
            value:
                `<@${details.partnerId}>`,
            inline:
                true
        });

    if (
        details.outcome
    )
        fields.push({
            name:
                `${fieldIcons.latestOutcome} Latest Outcome`,
            value:
                details.criticalScene
                    ? `**${details.outcome}**\nCritical Scene`
                    : `**${details.outcome}**`,
            inline:
                true
        });

    return fields;

}

async function postActivityMilestone(
    client,
    userId,
    activityType,
    config,
    milestone,
    periodKey,
    dailyStats,
    weeklyStats,
    lifetimeCount,
    details
) {

    if (
        await hasPostedMilestone(
            userId,
            activityType,
            milestone,
            periodKey
        )
    )
        return null;

    const target =
        await fetchDisplayTarget(
            client,
            userId
        );

    const avatar =
        getDisplayAvatar(
            target
        );

    const displayName =
        getDisplayName(
            target
        );

    const postOptions = {
        authorIcon:
            avatar,
        authorName:
            displayName,
        type:
            config.momentType,
        thumbnail:
            avatar,
        title:
            milestoneTitle(
                config,
                milestone
            ),
        command:
            config.command,
        flavor:
            activityFeedFlavor(
                displayName,
                config,
                milestone
            ),
        fields:
            buildFields(
                userId,
                config,
                milestone,
                dailyStats,
                weeklyStats,
                lifetimeCount,
                details
            )
    };

    const message =
        await postActivityFeed(
            client,
            postOptions
        ).catch(
            (error) => {

                console.error(
                    'ACTIVITY MOMENT ERROR'
                );
                console.error(
                    error
                );

                return null;

            }
        );

    if (
        !message
    )
        return null;

    await markMilestonePosted(
        userId,
        activityType,
        milestone,
        periodKey
    );

    return message;

}

async function recordActivityMoment(
    client,
    userId,
    activityType,
    details = {}
) {

    const config =
        activityConfig[activityType];

    if (
        !config
    )
        return null;

    try {

        const now =
            new Date();

        const dailyKey =
            getDailyQuestDate(
                now
            );

        const weeklyKey =
            getWeeklyQuestDate(
                now
            );

        const [
            dailyStats,
            weeklyStats,
            lifetimeCount
        ] =
            await Promise.all([
                updatePeriodStats(
                    userId,
                    activityType,
                    'daily',
                    dailyKey,
                    details,
                    now
                ),
                updatePeriodStats(
                    userId,
                    activityType,
                    'weekly',
                    weeklyKey,
                    details,
                    now
                ),
                getLifetimeCount(
                    userId,
                    config
                )
            ]);

        const milestone =
            pickMilestone(
                config,
                lifetimeCount,
                numberOrZero(
                    dailyStats?.count
                ),
                numberOrZero(
                    weeklyStats?.count
                )
            );

        if (
            !milestone
        )
            return null;

        return postActivityMilestone(
            client,
            userId,
            activityType,
            config,
            milestone,
            periodKeyForMilestone(
                milestone,
                dailyKey,
                weeklyKey
            ),
            dailyStats,
            weeklyStats,
            lifetimeCount,
            details
        );

    }
    catch (error) {

        console.error(
            'ACTIVITY TRACKING ERROR'
        );
        console.error(
            error
        );

        return null;

    }

}

module.exports = {
    recordActivityMoment
};
