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
        .setName('drop')
        .setDescription('Random titty drop'),

    async execute(interaction) {
        
        const remaining =
            checkCooldown(
                interaction.user.id,
                'drop',
                COOLDOWNS.DROP
            );

        if (remaining > 0) {

            const minutes =
                Math.floor(remaining / 60);

            const seconds =
                remaining % 60;

            return interaction.reply({
                content:
                    `⏳ You must wait ${minutes}m ${seconds}s before using /drop again.`,
                flags: 64
            });

        }


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