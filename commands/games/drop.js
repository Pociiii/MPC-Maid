const { SlashCommandBuilder } = require('discord.js');

const { createEmbed } = require('../../utils/embeds');
const { getRandomGif } = require('../../utils/gifs');
const {
    COOLDOWNS,
    getRandomColor
} = require('../../data/constants');
const {
    handleCooldown
} = require('../../utils/cooldowns');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('drop')
        .setDescription('Random titty drop'),

    async execute(interaction) {
        
        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.DROP
            )
        )
            return;


        const result = getRandomGif('titty_drop');
        const embed = createEmbed({
            color: getRandomColor(),
            authorName: interaction.member.displayName,
            authorIcon: interaction.member.displayAvatarURL(),
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