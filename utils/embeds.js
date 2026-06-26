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
        getDisplayName(
            interaction.user
        );

}

function getDisplayName(
    target
) {

    return target?.displayName ??
        target?.user?.displayName ??
        target?.globalName ??
        target?.user?.globalName ??
        target?.username ??
        target?.user?.username ??
        'MPC Member';

}

function getDisplayAvatar(
    target
) {

    return target?.displayAvatarURL?.() ??
        target?.user?.displayAvatarURL?.();

}

async function fetchDisplayTarget(
    client,
    userId,
    guildId = process.env.GUILD_ID
) {

    const fallback = {
        id:
            userId,
        displayName:
            'MPC Member',
        displayAvatarURL:
            () => undefined
    };

    const guild =
        guildId
            ? client.guilds.cache.get(
                guildId
            ) ??
            await client.guilds.fetch(
                guildId
            ).catch(
                () => null
            )
            : null;

    const member =
        guild
            ? await guild.members.fetch(
                userId
            ).catch(
                () => null
            )
            : null;

    if (
        member
    )
        return member;

    return await client.users.fetch(
        userId
    ).catch(
        () => fallback
    );

}

function createUserEmbed(
    interaction,
    {
        color = getRandomColor(),
        command,
        description,
        footerDetail,
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
            getDisplayAvatar(
                interaction.user
            ),
        thumbnail:
            thumbnail ??
            getDisplayAvatar(
                interaction.user
            ),
        title,
        description,
        image,
        footerText:
            command
                ? commandFooter(
                    command,
                    footerDetail
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
        footerDetail,
        image,
        target,
        title
    }
) {

    return createEmbed({
        color,
        authorName:
            getDisplayName(
                target
            ),
        authorIcon:
            getDisplayAvatar(
                target
            ),
        thumbnail:
            getDisplayAvatar(
                target
            ),
        title,
        description,
        image,
        footerText:
            command
                ? commandFooter(
                    command,
                    footerDetail
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
        footerDetail,
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
                    command,
                    footerDetail
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
    createUserEmbed,
    fetchDisplayTarget,
    getDisplayAvatar,
    getDisplayName
};
