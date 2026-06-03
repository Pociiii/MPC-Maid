const { SlashCommandBuilder } = require('discord.js');

const { createEmbed } = require('../../utils/embeds');
const { getRandomGif } = require('../../utils/gifs');
const {
    COOLDOWNS,
    getRandomColor
} = require('../../data/constants');
const {
    checkCooldown
} = require('../../utils/cooldowns');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('wiggle')
        .setDescription('Random wiggle'),

    async execute(interaction) {
        
        const remaining =
            checkCooldown(
                interaction.user.id,
                'wiggle',
                COOLDOWNS.WIGGLE
            );

        if (remaining > 0) {

            const minutes =
                Math.floor(remaining / 60);

            const seconds =
                remaining % 60;

            return interaction.reply({
                content:
                    `⏳ You must wait ${minutes}m ${seconds}s before using /wiggle again.`,
                flags: 64
            });

        }


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