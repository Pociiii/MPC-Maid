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

const achievementDefinitions = [
    ...sceneAchievements,
    ...combinedSceneStatAchievements,
    ...combinedSceneTwoStatsAchievements,
    ...combinedSceneThreeStatsAchievements,
    ...statAchievements,
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
    }
};

module.exports = {
    achievementDefinitions,
    buttonAchievements,
    combinedSceneStatAchievements,
    combinedSceneThreeStatsAchievements,
    combinedSceneStatMilestones,
    combinedSceneTwoStatsAchievements,
    endlessAchievements,
    fixedSceneMilestones,
    gifSubmissionAchievements,
    progressionPoints,
    sceneAchievements,
    showcaseAchievements,
    socialMilestones,
    statAchievements,
    statMilestones
};
