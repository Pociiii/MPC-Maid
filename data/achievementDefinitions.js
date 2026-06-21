const {
    maxTrainableStat,
    trainableStats
} = require('../utils/statTraining');

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
                    maxTrainableStat / 10
                )
        },
        (_, index) =>
            (index + 1) * 10
    );

function milestoneDefinition(
    key,
    milestone,
    label
) {

    return {
        id:
            `${key}_${milestone}`,
        key,
        milestone,
        label:
            label(
                milestone
            )
    };

}

const sceneAchievements =
    fixedSceneMilestones.map(
        (milestone) =>
            milestoneDefinition(
                'porn_scenes',
                milestone,
                (value) =>
                    `Complete ${value} porn scene${value === 1 ? '' : 's'}`
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
                    )
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
            )
    );

const achievementDefinitions = [
    ...sceneAchievements,
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
                `Complete ${value} porn scenes`
    },
    button_interactions: {
        startsAfter:
            1000,
        step:
            100,
        label:
            (value) =>
                `Click interaction buttons ${value} times`
    },
    gif_submissions: {
        startsAfter:
            1000,
        step:
            100,
        label:
            (value) =>
                `Submit ${value} GIFs`
    }
};

module.exports = {
    achievementDefinitions,
    buttonAchievements,
    endlessAchievements,
    fixedSceneMilestones,
    gifSubmissionAchievements,
    sceneAchievements,
    showcaseAchievements,
    socialMilestones,
    statAchievements,
    statMilestones
};
