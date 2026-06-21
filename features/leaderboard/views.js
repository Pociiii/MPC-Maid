const ROLES =
    require('../../data/roles.json');

const {
    achievementUsers,
    allUsers,
    filterByRole,
    topBy
} = require('./data');

const {
    baseEmbed,
    formatRows
} = require('./ui');

function hasCareerActivity(
    user
) {

    return Number(
        user.scenes_completed
    ) > 0 ||
    Number(
        user.ranking
    ) !== 0;

}

async function getGenderGroups(
    interaction,
    users
) {

    return {
        maleUsers:
            await filterByRole(
                interaction,
                users,
                ROLES.MALE
            ),
        femaleUsers:
            await filterByRole(
                interaction,
                users,
                ROLES.FEMALE
            )
    };

}

async function buildRankingEmbed(
    interaction
) {

    const users =
        await allUsers();

    const {
        maleUsers,
        femaleUsers
    } =
        await getGenderGroups(
            interaction,
            users
        );

    const embed =
        baseEmbed(
            interaction,
            'ranking'
        );

    embed.addFields(
        {
            name:
                'Male Ranking',
            value:
                formatRows(
                    topBy(
                        maleUsers,
                        'ranking',
                        hasCareerActivity
                    ),
                    'ranking'
                ),
            inline:
                true
        },
        {
            name:
                'Female Ranking',
            value:
                formatRows(
                    topBy(
                        femaleUsers,
                        'ranking',
                        hasCareerActivity
                    ),
                    'ranking'
                ),
            inline:
                true
        }
    );

    return embed;

}

async function buildScenesEmbed(
    interaction
) {

    const users =
        await allUsers();

    const {
        maleUsers,
        femaleUsers
    } =
        await getGenderGroups(
            interaction,
            users
        );

    const embed =
        baseEmbed(
            interaction,
            'scenes'
        );

    const hasScenes =
        (user) =>
            Number(
                user.scenes_completed
            ) > 0;

    embed.addFields(
        {
            name:
                'Male Scenes',
            value:
                formatRows(
                    topBy(
                        maleUsers,
                        'scenes_completed',
                        hasScenes
                    ),
                    'scenes_completed',
                    ' scenes'
                ),
            inline:
                true
        },
        {
            name:
                'Female Scenes',
            value:
                formatRows(
                    topBy(
                        femaleUsers,
                        'scenes_completed',
                        hasScenes
                    ),
                    'scenes_completed',
                    ' scenes'
                ),
            inline:
                true
        }
    );

    return embed;

}

async function buildCoinsEmbed(
    interaction
) {

    const users =
        await allUsers();

    const embed =
        baseEmbed(
            interaction,
            'coins'
        );

    embed.addFields({
        name:
            'Richest Members',
        value:
            formatRows(
                topBy(
                    users,
                    'coins',
                    (user) =>
                        Number(
                            user.coins
                        ) > 0
                ),
                'coins',
                ' coins'
            )
    });

    return embed;

}

async function buildSpanksEmbed(
    interaction
) {

    const users =
        await allUsers();

    const embed =
        baseEmbed(
            interaction,
            'spanks'
        );

    embed.addFields(
        {
            name:
                'Top Spankers',
            value:
                formatRows(
                    topBy(
                        users,
                        'spanks_given',
                        (user) =>
                            Number(
                                user.spanks_given
                            ) > 0
                    ),
                    'spanks_given',
                    ' given'
                ),
            inline:
                true
        },
        {
            name:
                'Most Spanked',
            value:
                formatRows(
                    topBy(
                        users,
                        'spanks_taken',
                        (user) =>
                            Number(
                                user.spanks_taken
                            ) > 0
                    ),
                    'spanks_taken',
                    ' taken'
                ),
            inline:
                true
        }
    );

    return embed;

}

async function buildKissesEmbed(
    interaction
) {

    const users =
        await allUsers();

    const embed =
        baseEmbed(
            interaction,
            'kisses'
        );

    embed.addFields(
        {
            name:
                'Top Kiss Givers',
            value:
                formatRows(
                    topBy(
                        users,
                        'kisses_given',
                        (user) =>
                            Number(
                                user.kisses_given
                            ) > 0
                    ),
                    'kisses_given',
                    ' given'
                ),
            inline:
                true
        },
        {
            name:
                'Most Kissed',
            value:
                formatRows(
                    topBy(
                        users,
                        'kisses_taken',
                        (user) =>
                            Number(
                                user.kisses_taken
                            ) > 0
                    ),
                    'kisses_taken',
                    ' taken'
                ),
            inline:
                true
        }
    );

    return embed;

}

async function buildAchievementsEmbed(
    interaction
) {

    const users =
        await achievementUsers();

    const embed =
        baseEmbed(
            interaction,
            'achievements'
        );

    embed.addFields({
        name:
            'Achievement Points',
        value:
            formatRows(
                topBy(
                    users,
                    'achievement_points',
                    (user) =>
                        Number(
                            user.achievement_points
                        ) > 0
                ),
                'achievement_points',
                ' pts'
            )
    });

    return embed;

}

const builders = {
    ranking:
        buildRankingEmbed,
    scenes:
        buildScenesEmbed,
    coins:
        buildCoinsEmbed,
    spanks:
        buildSpanksEmbed,
    kisses:
        buildKissesEmbed,
    achievements:
        buildAchievementsEmbed
};

module.exports = {
    builders
};
