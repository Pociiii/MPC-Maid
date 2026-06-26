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

const ranks =
    require('../../data/ranks.json');

const {
    getRankTitle
} = require('../../utils/ranks');

const rankingRowsPerRank =
    5;

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

function formatRankingRows(
    users
) {

    if (
        users.length === 0
    )
        return 'No entries yet.';

    const visibleUsers =
        users
        .slice(
            0,
            rankingRowsPerRank
        );

    const rows =
        visibleUsers
        .map(
            (user, index) =>
                `- ${index + 1}. <@${user.id}> - **${Number(
                    user.ranking
                ).toLocaleString()}**`
        );

    const hiddenCount =
        users.length -
        visibleUsers.length;

    if (
        hiddenCount > 0
    )
        rows.push(
            `- + **${hiddenCount} more**`
        );

    return rows.join(
        '\n'
    );

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
        (await allUsers())
            .filter(
                hasCareerActivity
            )
            .sort(
                (a, b) =>
                    Number(
                        b.ranking
                    ) -
                    Number(
                        a.ranking
                    )
            );

    const embed =
        baseEmbed(
            interaction,
            'ranking'
        );

    embed.addFields(
        ...ranks.map(
            (rank) => ({
                name:
                    rank.title,
                value:
                    formatRankingRows(
                        users.filter(
                            (user) =>
                                getRankTitle(
                                    Number(
                                        user.ranking
                                    )
                                ) === rank.title
                        )
                    ),
                inline:
                    true
            })
        )
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

async function buildHelpsEmbed(
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
            'helps'
        );

    const hasHelps =
        (user) =>
            Number(
                user.horny_helps
            ) > 0;

    embed.addFields(
        {
            name:
                'Male Helpers',
            value:
                formatRows(
                    topBy(
                        maleUsers,
                        'horny_helps',
                        hasHelps
                    ),
                    'horny_helps',
                    ' helps'
                ),
            inline:
                true
        },
        {
            name:
                'Female Helpers',
            value:
                formatRows(
                    topBy(
                        femaleUsers,
                        'horny_helps',
                        hasHelps
                    ),
                    'horny_helps',
                    ' helps'
                ),
            inline:
                true
        }
    );

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
    helps:
        buildHelpsEmbed,
    achievements:
        buildAchievementsEmbed
};

module.exports = {
    builders
};
