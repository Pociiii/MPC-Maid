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
        .setName('wiggle')
        .setDescription('Random wiggle'),

    async execute(interaction) {
        
        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.WIGGLE
            )
        )
            return;


        const result = getRandomGif('wiggle');
        const embed = createEmbed({
            color: getRandomColor(),
            authorName: interaction.user.displayName,
            authorIcon: interaction.user.displayAvatarURL(),
            title: 'Wiggle',
            image: result.url,
            footerText: `GIF #${result.index}/${result.total}`,
            timestamp: true
        });

        await interaction.reply({
            embeds: [embed]
        });

    }

};