const ROLES =
    require('../../data/roles.json');

const {
    achievementUsers,
    allUsers,
    filterByRole,
    rankBy,
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
                `${index + 1}. <@${user.id}> - **${Number(
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
            `+ **${hiddenCount} more**`
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

function formatPositionLine(
    label,
    rankInfo,
    suffix = '',
    detail = null
) {

    if (
        !rankInfo
    )
        return `${label}: Not ranked yet`;

    const value =
        Number.isFinite(
            rankInfo.value
        )
            ? rankInfo.value
            : 0;

    const detailText =
        detail
            ? ` (${detail})`
            : '';

    return `${label}: **#${rankInfo.rank}** - **${value.toLocaleString()}${suffix}**${detailText}`;

}

function addPositionField(
    embed,
    lines
) {

    embed.addFields({
        name:
            '\uD83D\uDCCD Your Position',
        value:
            lines.join(
                '\n'
            ),
        inline:
            false
    });

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
                    `\uD83C\uDFC6 ${rank.title}`,
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

    const requesterRank =
        rankBy(
            users,
            'ranking',
            interaction.user.id
        );

    addPositionField(
        embed,
        [
            formatPositionLine(
                '\uD83C\uDFC6 Overall Ranking',
                requesterRank,
                ' rank score',
                requesterRank
                    ? getRankTitle(
                        Number(
                            requesterRank.value
                        )
                    )
                    : null
            )
        ]
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
                '\u2642\uFE0F Male Scenes',
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
                '\u2640\uFE0F Female Scenes',
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

    addPositionField(
        embed,
        [
            formatPositionLine(
                '\u2642\uFE0F Male Scenes',
                rankBy(
                    maleUsers,
                    'scenes_completed',
                    interaction.user.id,
                    hasScenes
                ),
                ' scenes'
            ),
            formatPositionLine(
                '\u2640\uFE0F Female Scenes',
                rankBy(
                    femaleUsers,
                    'scenes_completed',
                    interaction.user.id,
                    hasScenes
                ),
                ' scenes'
            )
        ]
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

    const hasCoins =
        (user) =>
            Number(
                user.coins
            ) > 0;

    embed.addFields({
        name:
            '\uD83D\uDCB0 Richest Members',
        value:
            formatRows(
                topBy(
                    users,
                    'coins',
                    hasCoins
                ),
                'coins',
                ' coins'
            )
    });

    addPositionField(
        embed,
        [
            formatPositionLine(
                '\uD83D\uDCB0 Richest Members',
                rankBy(
                    users,
                    'coins',
                    interaction.user.id,
                    hasCoins
                ),
                ' coins'
            )
        ]
    );

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

    const hasSpanksGiven =
        (user) =>
            Number(
                user.spanks_given
            ) > 0;

    const hasSpanksTaken =
        (user) =>
            Number(
                user.spanks_taken
            ) > 0;

    embed.addFields(
        {
            name:
                '\uD83D\uDC4B Top Spankers',
            value:
                formatRows(
                    topBy(
                        users,
                        'spanks_given',
                        hasSpanksGiven
                    ),
                    'spanks_given',
                    ' given'
                ),
            inline:
                true
        },
        {
            name:
                '\uD83D\uDE33 Most Spanked',
            value:
                formatRows(
                    topBy(
                        users,
                        'spanks_taken',
                        hasSpanksTaken
                    ),
                    'spanks_taken',
                    ' taken'
                ),
            inline:
                true
        }
    );

    addPositionField(
        embed,
        [
            formatPositionLine(
                '\uD83D\uDC4B Top Spankers',
                rankBy(
                    users,
                    'spanks_given',
                    interaction.user.id,
                    hasSpanksGiven
                ),
                ' given'
            ),
            formatPositionLine(
                '\uD83D\uDE33 Most Spanked',
                rankBy(
                    users,
                    'spanks_taken',
                    interaction.user.id,
                    hasSpanksTaken
                ),
                ' taken'
            )
        ]
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

    const hasKissesGiven =
        (user) =>
            Number(
                user.kisses_given
            ) > 0;

    const hasKissesTaken =
        (user) =>
            Number(
                user.kisses_taken
            ) > 0;

    embed.addFields(
        {
            name:
                '\uD83D\uDC8B Top Kiss Givers',
            value:
                formatRows(
                    topBy(
                        users,
                        'kisses_given',
                        hasKissesGiven
                    ),
                    'kisses_given',
                    ' given'
                ),
            inline:
                true
        },
        {
            name:
                '\uD83D\uDC8C Most Kissed',
            value:
                formatRows(
                    topBy(
                        users,
                        'kisses_taken',
                        hasKissesTaken
                    ),
                    'kisses_taken',
                    ' taken'
                ),
            inline:
                true
        }
    );

    addPositionField(
        embed,
        [
            formatPositionLine(
                '\uD83D\uDC8B Top Kiss Givers',
                rankBy(
                    users,
                    'kisses_given',
                    interaction.user.id,
                    hasKissesGiven
                ),
                ' given'
            ),
            formatPositionLine(
                '\uD83D\uDC8C Most Kissed',
                rankBy(
                    users,
                    'kisses_taken',
                    interaction.user.id,
                    hasKissesTaken
                ),
                ' taken'
            )
        ]
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

    const hasAchievementPoints =
        (user) =>
            Number(
                user.achievement_points
            ) > 0;

    embed.addFields({
        name:
            '\uD83C\uDFC5 Achievement Points',
        value:
            formatRows(
                topBy(
                    users,
                    'achievement_points',
                    hasAchievementPoints
                ),
                'achievement_points',
                ' pts'
            )
    });

    addPositionField(
        embed,
        [
            formatPositionLine(
                '\uD83C\uDFC5 Achievement Points',
                rankBy(
                    users,
                    'achievement_points',
                    interaction.user.id,
                    hasAchievementPoints
                ),
                ' pts'
            )
        ]
    );

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
                '\u2642\uFE0F Male Helpers',
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
                '\u2640\uFE0F Female Helpers',
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

    addPositionField(
        embed,
        [
            formatPositionLine(
                '\u2642\uFE0F Male Helpers',
                rankBy(
                    maleUsers,
                    'horny_helps',
                    interaction.user.id,
                    hasHelps
                ),
                ' helps'
            ),
            formatPositionLine(
                '\u2640\uFE0F Female Helpers',
                rankBy(
                    femaleUsers,
                    'horny_helps',
                    interaction.user.id,
                    hasHelps
                ),
                ' helps'
            )
        ]
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
