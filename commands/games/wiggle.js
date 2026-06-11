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
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');



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
            authorName: interaction.member.displayName,
            authorIcon: interaction.member.displayAvatarURL(),
            title: 'Wiggle',
            description: `<@${interaction.user.id}> wiggles teasingly.`,
            image: result.url,
            footerText: `GIF #${result.index}/${result.total}`,
            timestamp: true
        });

        const row = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        `spank:${interaction.user.id}`
                    )
                    .setLabel('Spank')
                    .setEmoji('1486644512032948314')
                    .setStyle(
                        ButtonStyle.Secondary
                    )

            );
            
        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

    }

};