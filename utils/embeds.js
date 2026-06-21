const {
    EmbedBuilder
} = require('discord.js');

const {
    getRandomColor
} = require('../data/constants');

const {
    commandFooter
} = require('./version');

function createEmbed(options = {}) {

    const embed = new EmbedBuilder();

    if (options.color)
        embed.setColor(options.color);

    if (options.title)
        embed.setTitle(options.title);

    if (options.description)
        embed.setDescription(options.description);

    if (options.authorName) {

        embed.setAuthor({
            name: options.authorName,
            iconURL: options.authorIcon
        });

    }

    if (options.thumbnail)
        embed.setThumbnail(options.thumbnail);

    if (options.image)
        embed.setImage(options.image);

    if (options.footerText) {

        embed.setFooter({
            text: options.footerText,
            iconURL: options.footerIcon
        });

    }

    if (options.timestamp)
        embed.setTimestamp();

    return embed;
}

function createReply(embed, ephemeral = false) {

    return {
        embeds: [embed],
        flags: ephemeral ? 64 : 0
    };
}

function getUserDisplayName(
    interaction
) {

    return interaction.member?.displayName ??
        interaction.user.displayName;

}

function getUserAvatar(
    user
) {

    return user.displayAvatarURL();

}

function createUserEmbed(
    interaction,
    {
        color = getRandomColor(),
        command,
        description,
        image,
        thumbnail,
        title
    }
) {

    return createEmbed({
        color,
        authorName:
            getUserDisplayName(
                interaction
            ),
        authorIcon:
            getUserAvatar(
                interaction.user
            ),
        thumbnail:
            thumbnail ??
            getUserAvatar(
                interaction.user
            ),
        title,
        description,
        image,
        footerText:
            command
                ? commandFooter(
                    command
                )
                : undefined,
        timestamp:
            true
    });

}

function createTargetUserEmbed(
    {
        color = getRandomColor(),
        command,
        description,
        image,
        target,
        title
    }
) {

    return createEmbed({
        color,
        authorName:
            target.displayName,
        authorIcon:
            getUserAvatar(
                target
            ),
        thumbnail:
            getUserAvatar(
                target
            ),
        title,
        description,
        image,
        footerText:
            command
                ? commandFooter(
                    command
                )
                : undefined,
        timestamp:
            true
    });

}

function createBotEmbed(
    interaction,
    {
        color = getRandomColor(),
        command,
        description,
        image,
        thumbnail,
        title
    }
) {

    return createEmbed({
        color,
        authorName:
            interaction.client.user.username,
        authorIcon:
            interaction.client.user.displayAvatarURL(),
        thumbnail,
        title,
        description,
        image,
        footerText:
            command
                ? commandFooter(
                    command
                )
                : undefined,
        timestamp:
            true
    });

}

module.exports = {
    createBotEmbed,
    createEmbed,
    createReply,
    createTargetUserEmbed,
    createUserEmbed
};
