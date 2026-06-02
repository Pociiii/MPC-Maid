const { EmbedBuilder } = require('discord.js');

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

module.exports = {
    createEmbed
};