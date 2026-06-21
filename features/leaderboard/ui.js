const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

const {
    views
} = require('./config');

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

module.exports = {
    baseEmbed,
    buildRows,
    formatRows
};
