const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

module.exports = {

    data:
        new SlashCommandBuilder()

            .setName('membercardpanel')

            .setDescription(
                'Post member card panel'
            ),

    async execute(interaction) {

        const embed =
            createEmbed({

                color:
                    getRandomColor(),

                title:
                    '🎫 MPC Member Card',

                description:

`Generate your official Midnight Pleasure Club membership card.

Rembember to change your nick to your in-game nick first.`,

                timestamp:
                    true

            });

        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            'membercard'
                        )

                        .setLabel(
                            'Get Card'
                        )

                        .setEmoji('🎫')

                        .setStyle(
                            ButtonStyle.Primary
                        )

                );

        await interaction.reply({

            embeds: [embed],

            components: [row]

        });

    }

};