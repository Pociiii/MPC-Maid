const {
    prestigeStatStart,
    trainableStats
} = require('../utils/statTraining');

const {
    SCENE_BALANCE
} = require('./constants');

const fixedSceneMilestones = [
    1,
    10,
    25,
    50,
    100,
    250,
    500,
    1000
];

const socialMilestones = [
    1,
    10,
    25,
    50,
    100,
    250,
    500,
    1000
];

const coinMilestones = [
    1000,
    2500,
    5000,
    10000,
    25000,
    50000
];

const xpMilestones = [
    100,
    500,
    1000,
    2500,
    5000,
    10000,
    25000,
    50000
];

const rankingMilestones = [
    500,
    1000,
    1500,
    2500,
    5000,
    10000
];

const statMilestones =
    Array.from(
        {
            length:
                Math.floor(
                    prestigeStatStart / 10
                )
        },
        (_, index) =>
            (index + 1) * 10
    );

const combinedSceneStatMilestones =
    Array.from(
        {
            length:
                10
        },
        (_, index) =>
            (index + 1) * SCENE_BALANCE.STAT_BONUS_THRESHOLD
    );

function milestoneDefinition(
    key,
    milestone,
    label,
    points
) {

    return {
        id:
            `${key}_${milestone}`,
        key,
        milestone,
        points,
        label:
            label(
                milestone
            )
    };

}

function progressionPoints(
    milestone
) {

    if (
        milestone >= 1000
    )
        return 500;

    if (
        milestone >= 500
    )
        return 250;

    if (
        milestone >= 250
    )
        return 150;

    if (
        milestone >= 100
    )
        return 100;

    if (
        milestone >= 50
    )
        return 75;

    if (
        milestone >= 25
    )
        return 50;

    if (
        milestone >= 10
    )
        return 25;

    return 10;

}

function statPoints(
    milestone
) {

    return {
        10:
            25,
        20:
            50,
        30:
            100,
        40:
            200
    }[milestone] ?? milestone * 5;

}

const sceneAchievements =
    fixedSceneMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'porn_scenes',
                milestone,
                (value) =>
                    `Complete ${value} porn scene${value === 1 ? '' : 's'}`
                ,
                progressionPoints(
                    milestone
                )
            )
    );

const statAchievements =
    trainableStats.flatMap(
        (stat) =>
            statMilestones.map(
                (milestone) =>
                    milestoneDefinition(
                        stat,
                        milestone,
                        (value) =>
                            `${stat.charAt(0).toUpperCase()}${stat.slice(1)} reaches ${value}`
                        ,
                        statPoints(
                            milestone
                        )
                    )
            )
    );

const allStatsAchievements =
    statMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'all_stats',
                milestone,
                (value) =>
                    `Performance, Stamina, and Fame reach ${value}`,
                statPoints(
                    milestone
                ) * 3
            )
    );

const combinedSceneStatAchievements =
    combinedSceneStatMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'scene_combined_stat',
                milestone,
                (value) =>
                    `Be part of a scene with a combined stat of ${value}`,
                statPoints(
                    milestone
                )
            )
    );

const combinedSceneTwoStatsAchievements =
    combinedSceneStatMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'scene_combined_two_stats',
                milestone,
                (value) =>
                    `Be part of a scene with 2 combined stats at ${value}`,
                statPoints(
                    milestone
                ) * 2
            )
    );

const combinedSceneThreeStatsAchievements =
    combinedSceneStatMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'scene_combined_three_stats',
                milestone,
                (value) =>
                    `Be part of a scene with all 3 combined stats at ${value}`,
                statPoints(
                    milestone
                ) * 3
            )
    );

const showcaseAchievements =
    socialMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'showcase_posts',
                milestone,
                (value) =>
                    `Use showcase commands ${value} time${value === 1 ? '' : 's'}`
                ,
                progressionPoints(
                    milestone
                )
            )
    );

const buttonAchievements =
    socialMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'button_interactions',
                milestone,
                (value) =>
                    `Click interaction buttons ${value} time${value === 1 ? '' : 's'}`
                ,
                progressionPoints(
                    milestone
                )
            )
    );

const gifSubmissionAchievements =
    socialMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'gif_submissions',
                milestone,
                (value) =>
                    `Submit ${value} GIF${value === 1 ? '' : 's'}`
                ,
                progressionPoints(
                    milestone
                )
            )
    );

const resourceAchievements = [
    ...coinMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'wallet_coins',
                milestone,
                (value) =>
                    `Hold ${value.toLocaleString()} coins`,
                progressionPoints(
                    milestone
                )
            )
    ),
    ...xpMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'xp_earned',
                milestone,
                (value) =>
                    `Earn ${value.toLocaleString()} total XP`,
                progressionPoints(
                    milestone
                )
            )
    ),
    ...rankingMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'ranking_reached',
                milestone,
                (value) =>
                    `Reach ${value.toLocaleString()} ranking`,
                progressionPoints(
                    milestone
                )
            )
    )
];

const socialCounterLabels = {
    brofists_given:
        (value) =>
            `Give ${value.toLocaleString()} brofist${value === 1 ? '' : 's'}`,
    brofists_taken:
        (value) =>
            `Receive ${value.toLocaleString()} brofist${value === 1 ? '' : 's'}`,
    drinks_bought:
        (value) =>
            `Buy ${value.toLocaleString()} drink round${value === 1 ? '' : 's'}`,
    fireworks_launched:
        (value) =>
            `Launch ${value.toLocaleString()} firework${value === 1 ? '' : 's'}`,
    horny_helped:
        (value) =>
            `Receive ${value.toLocaleString()} horny help${value === 1 ? '' : 's'}`,
    horny_helps:
        (value) =>
            `Help ${value.toLocaleString()} horny member${value === 1 ? '' : 's'}`,
    kisses_given:
        (value) =>
            `Give ${value.toLocaleString()} kiss${value === 1 ? '' : 'es'}`,
    kisses_taken:
        (value) =>
            `Receive ${value.toLocaleString()} kiss${value === 1 ? '' : 'es'}`,
    profile_likes_received:
        (value) =>
            `Receive ${value.toLocaleString()} profile like${value === 1 ? '' : 's'}`,
    spanks_given:
        (value) =>
            `Give ${value.toLocaleString()} spank${value === 1 ? '' : 's'}`,
    spanks_taken:
        (value) =>
            `Receive ${value.toLocaleString()} spank${value === 1 ? '' : 's'}`
};

const socialCounterAchievements =
    Object.entries(
        socialCounterLabels
    ).flatMap(
        ([
            key,
            label
        ]) =>
            socialMilestones.map(
                (milestone) =>
                    milestoneDefinition(
                        key,
                        milestone,
                        label,
                        progressionPoints(
                            milestone
                        )
                    )
            )
    );

const dailyWyrVoteAchievements =
    socialMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'daily_wyr_votes',
                milestone,
                (value) =>
                    `Vote in Daily WYR ${value.toLocaleString()} time${value === 1 ? '' : 's'}`,
                progressionPoints(
                    milestone
                )
            )
    );

const actionCounterLabels = {
    casino_plays:
        (value) =>
            `Play casino games ${value.toLocaleString()} time${value === 1 ? '' : 's'}`,
    spank_dilli_spanks:
        (value) =>
            `Spank Dilli ${value.toLocaleString()} time${value === 1 ? '' : 's'}`,
    shop_purchases:
        (value) =>
            `Buy ${value.toLocaleString()} shop item${value === 1 ? '' : 's'}`,
    titty_drops:
        (value) =>
            `Post ${value.toLocaleString()} titty drop${value === 1 ? '' : 's'}`,
    training_sessions:
        (value) =>
            `Train stats ${value.toLocaleString()} time${value === 1 ? '' : 's'}`
};

const actionCounterAchievements =
    Object.entries(
        actionCounterLabels
    ).flatMap(
        ([
            key,
            label
        ]) =>
            socialMilestones.map(
                (milestone) =>
                    milestoneDefinition(
                        key,
                        milestone,
                        label,
                        progressionPoints(
                            milestone
                        )
                    )
            )
    );

const achievementDefinitions = [
    ...sceneAchievements,
    ...combinedSceneStatAchievements,
    ...combinedSceneTwoStatsAchievements,
    ...combinedSceneThreeStatsAchievements,
    ...statAchievements,
    ...allStatsAchievements,
    ...resourceAchievements,
    ...socialCounterAchievements,
    ...dailyWyrVoteAchievements,
    ...actionCounterAchievements,
    ...showcaseAchievements,
    ...buttonAchievements,
    ...gifSubmissionAchievements
];

const endlessAchievements = {
    porn_scenes: {
        startsAfter:
            1000,
        step:
            100,
        label:
            (value) =>
                `Complete ${value} porn scenes`,
        points:
            50
    },
    button_interactions: {
        startsAfter:
            1000,
        step:
            100,
        label:
            (value) =>
                `Click interaction buttons ${value} times`,
        points:
            50
    },
    spank_dilli_spanks: {
        startsAfter:
            1000,
        step:
            100,
        label:
            (value) =>
                `Spank Dilli ${value.toLocaleString()} times`,
        points:
            50
    },
    titty_drops: {
        startsAfter:
            1000,
        step:
            100,
        label:
            (value) =>
                `Post ${value.toLocaleString()} titty drops`,
        points:
            50
    },
    gif_submissions: {
        startsAfter:
            1000,
        step:
            100,
        label:
            (value) =>
                `Submit ${value} GIFs`,
        points:
            50
    },
    scene_combined_stat: {
        startsAfter:
            SCENE_BALANCE.STAT_BONUS_THRESHOLD * 10,
        step:
            SCENE_BALANCE.STAT_BONUS_THRESHOLD,
        label:
            (value) =>
                `Be part of a scene with a combined stat of ${value}`,
        points:
            50
    },
    scene_combined_two_stats: {
        startsAfter:
            SCENE_BALANCE.STAT_BONUS_THRESHOLD * 10,
        step:
            SCENE_BALANCE.STAT_BONUS_THRESHOLD,
        label:
            (value) =>
                `Be part of a scene with 2 combined stats at ${value}`,
        points:
            100
    },
    scene_combined_three_stats: {
        startsAfter:
            SCENE_BALANCE.STAT_BONUS_THRESHOLD * 10,
        step:
            SCENE_BALANCE.STAT_BONUS_THRESHOLD,
        label:
            (value) =>
                `Be part of a scene with all 3 combined stats at ${value}`,
        points:
            150
    },
    all_stats: {
        startsAfter:
            prestigeStatStart,
        step:
            10,
        label:
            (value) =>
                `Performance, Stamina, and Fame reach ${value}`,
        points:
            150
    },
    wallet_coins: {
        startsAfter:
            50000,
        step:
            25000,
        label:
            (value) =>
                `Hold ${value.toLocaleString()} coins`,
        points:
            100
    },
    xp_earned: {
        startsAfter:
            50000,
        step:
            25000,
        label:
            (value) =>
                `Earn ${value.toLocaleString()} total XP`,
        points:
            100
    },
    ranking_reached: {
        startsAfter:
            10000,
        step:
            5000,
        label:
            (value) =>
                `Reach ${value.toLocaleString()} ranking`,
        points:
            100
    }
};

module.exports = {
    actionCounterAchievements,
    achievementDefinitions,
    allStatsAchievements,
    buttonAchievements,
    combinedSceneStatAchievements,
    combinedSceneThreeStatsAchievements,
    combinedSceneStatMilestones,
    combinedSceneTwoStatsAchievements,
    endlessAchievements,
    fixedSceneMilestones,
    gifSubmissionAchievements,
    progressionPoints,
    coinMilestones,
    rankingMilestones,
    resourceAchievements,
    sceneAchievements,
    showcaseAchievements,
    socialCounterAchievements,
    socialMilestones,
    statAchievements,
    statMilestones,
    xpMilestones
};
