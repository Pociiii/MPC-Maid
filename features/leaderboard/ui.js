const {
    ActionRowBuilder,
    StringSelectMenuBuilder
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
                `- ${index + 1}. <@${user.id}> - **${Number(user[stat]).toLocaleString()}${suffix}**`
        )
        .join(
            '\n'
        );

}

function buildRows(
    activeView
) {

    return [
        new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(
                        'leaderboard_select'
                    )
                    .setPlaceholder(
                        'Choose leaderboard'
                    )
                    .addOptions(
                        Object.entries(
                            views
                        )
                            .map(
                                ([view, data]) => ({
                                    default:
                                        view === activeView,
                                    emoji:
                                        data.emoji,
                                    label:
                                        data.label,
                                    value:
                                        view
                                })
                            )
                    )
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
