const { SlashCommandBuilder } = require('discord.js');

const { createEmbed } = require('../../utils/embeds');
const { getRandomGif } = require('../../utils/gifs');
const {
    getRandomColor
} = require('../../data/constants');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('drop')
        .setDescription('Random titty drop'),

    async execute(interaction) {
        const result = getRandomGif('titty_drop');

        const embed = createEmbed({
            color: getRandomColor(),
            authorName: interaction.user.displayName,
            authorIcon: interaction.user.displayAvatarURL(),
            title: 'Titty Drop',
            image: result.url,
            footerText: `GIF #${result.index}/${result.total}`,
            timestamp: true
        });

        await interaction.reply({
            embeds: [embed]
        });

    }

};