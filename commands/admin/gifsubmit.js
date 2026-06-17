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

            .setName('gifsubmit')

            .setDescription(
                'Post GIF submission panel'
            ),

    async execute(interaction) {

        const embed =
            createEmbed({

                color:
                    getRandomColor(),

                title:
                    'GIF Submission',

                description:

`Submit GIFs to improve MPC Maid.

🎬 **Scenes**: GiFs used by the /porn-scene command.

🎮 **Interactions**: GIFs used by commands like Wiggle, Flex, Horny, Drop and more.`,

                timestamp:
                    true

            });

        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            'gifsubmit_scenes'
                        )

                        .setLabel(
                            'Scenes'
                        )

                        .setEmoji('🎬')

                        .setStyle(
                            ButtonStyle.Primary
                        ),

                    new ButtonBuilder()

                        .setCustomId(
                            'gifsubmit_interactions'
                        )

                        .setLabel(
                            'Interactions'
                        )

                        .setEmoji('🎮')

                        .setStyle(
                            ButtonStyle.Success
                        )

                );

        await interaction.reply({

            embeds: [embed],

            components: [row]

        });

    }

};