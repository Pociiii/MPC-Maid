const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const db =
    require('../../database/database');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

const ROLES =
    require('../../data/roles.json');

const limit = 10;

const views = {
    ranking: {
        label:
            'Ranking',
        title:
            'Ranking Leaderboard'
    },
    scenes: {
        label:
            'Scenes',
        title:
            'Scenes Leaderboard'
    },
    coins: {
        label:
            'Coins',
        title:
            'Coins Leaderboard'
    },
    spanks: {
        label:
            'Spanks',
        title:
            'Spanks Leaderboard'
    },
    kisses: {
        label:
            'Kisses',
        title:
            'Kisses Leaderboard'
    }
};

function allUsers() {

    return new Promise(
        (resolve, reject) => {

            db.all(
                'SELECT * FROM users',
                [],
                (error, rows) => {

                    if (
                        error
                    )
                        reject(
                            error
                        );
                    else
                        resolve(
                            rows
                        );

                }
            );

        }
    );

}

function topBy(
    users,
    stat
) {

    return users
        .filter(
            (user) =>
                Number(
                    user[stat]
                ) > 0
        )
        .sort(
            (a, b) =>
                Number(
                    b[stat]
                ) -
                Number(
                    a[stat]
                )
        )
        .slice(
            0,
            limit
        );

}

async function filterByRole(
    interaction,
    users,
    roleId
) {

    const members =
        await interaction.guild.members.fetch();

    return users.filter(
        (user) => {

            const member =
                members.get(
                    user.id
                );

            return Boolean(
                member &&
                member.roles.cache.has(
                    roleId
                )
            );

        }
    );

}

function formatRows(
    users,
    stat,
    suffix = ''
) {

    if (
        users.length === 0
    )
        return 'No entries yet.';

    return users
        .map(
            (user, index) =>
                `${index + 1}. <@${user.id}> - **${Number(user[stat]).toLocaleString()}${suffix}**`
        )
        .join(
            '\n'
        );

}

function buildRows(
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
                            `leaderboard_${view}`
                        )
                        .setLabel(
                            data.label
                        )
                        .setStyle(
                            view === activeView
                                ? ButtonStyle.Primary
                                : ButtonStyle.Secondary
                        )
            );

    return [
        new ActionRowBuilder()
            .addComponents(
                buttons
            )
    ];

}

function baseEmbed(
    interaction,
    view
) {

    return createEmbed({
        color:
            getRandomColor(),
        authorName:
            interaction.client.user.username,
        authorIcon:
            interaction.client.user.displayAvatarURL(),
        title:
            views[view].title,
        footerText:
            '/leaderboard',
        timestamp:
            true
    });

}

async function buildRankingEmbed(
    interaction
) {

    const users =
        await allUsers();

    const maleUsers =
        await filterByRole(
            interaction,
            users,
            ROLES.MALE
        );

    const femaleUsers =
        await filterByRole(
            interaction,
            users,
            ROLES.FEMALE
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
                        'ranking'
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
                        'ranking'
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

    const maleUsers =
        await filterByRole(
            interaction,
            users,
            ROLES.MALE
        );

    const femaleUsers =
        await filterByRole(
            interaction,
            users,
            ROLES.FEMALE
        );

    const embed =
        baseEmbed(
            interaction,
            'scenes'
        );

    embed.addFields(
        {
            name:
                'Male Scenes',
            value:
                formatRows(
                    topBy(
                        maleUsers,
                        'scenes_completed'
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
                        'scenes_completed'
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
                    'coins'
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
                        'spanks_given'
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
                        'spanks_taken'
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
                        'kisses_given'
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
                        'kisses_taken'
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

async function buildLeaderboard(
    interaction,
    view = 'ranking'
) {

    const safeView =
        views[view]
            ? view
            : 'ranking';

    let embed;

    if (
        safeView === 'ranking'
    )
        embed =
            await buildRankingEmbed(
                interaction
            );
    else if (
        safeView === 'scenes'
    )
        embed =
            await buildScenesEmbed(
                interaction
            );
    else if (
        safeView === 'coins'
    )
        embed =
            await buildCoinsEmbed(
                interaction
            );
    else if (
        safeView === 'spanks'
    )
        embed =
            await buildSpanksEmbed(
                interaction
            );
    else
        embed =
            await buildKissesEmbed(
                interaction
            );

    return {
        embeds: [
            embed
        ],
        components:
            buildRows(
                safeView
            )
    };

}

module.exports = {
    buildLeaderboard
};
