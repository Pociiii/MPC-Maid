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
            .setName(
                'gifsubmit'
            )
            .setDescription(
                'Post GIF submission panel'
            ),

    async execute(
        interaction
    ) {

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                title:
                    'GIF Submission',
                description:
`Submit GIFs to improve MPC Maid.

Scene buttons are split by cast type:
- **Scene MF**: current 2-person scenes
- **Scene MFM**: 2 males + 1 female
- **Scene FMF**: 1 male + 2 females
- **Scene FFF**: 3 females

**Interactions** are used by Wiggle, Flex, Horny, Drop, and similar commands.`,
                timestamp:
                    true
            });

        const sceneRow =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            'gifsubmit_scenes:mf'
                        )
                        .setLabel(
                            'Scene MF'
                        )
                        .setStyle(
                            ButtonStyle.Primary
                        ),
                    new ButtonBuilder()
                        .setCustomId(
                            'gifsubmit_scenes:mfm'
                        )
                        .setLabel(
                            'Scene MFM'
                        )
                        .setStyle(
                            ButtonStyle.Primary
                        ),
                    new ButtonBuilder()
                        .setCustomId(
                            'gifsubmit_scenes:fmf'
                        )
                        .setLabel(
                            'Scene FMF'
                        )
                        .setStyle(
                            ButtonStyle.Primary
                        ),
                    new ButtonBuilder()
                        .setCustomId(
                            'gifsubmit_scenes:fff'
                        )
                        .setLabel(
                            'Scene FFF'
                        )
                        .setStyle(
                            ButtonStyle.Primary
                        )
                );

        const utilityRow =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            'gifsubmit_interactions'
                        )
                        .setLabel(
                            'Interactions'
                        )
                        .setStyle(
                            ButtonStyle.Success
                        ),
                    new ButtonBuilder()
                        .setCustomId(
                            'gifsubmit_info'
                        )
                        .setLabel(
                            'GIF Info'
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        )
                );

        await interaction.reply({
            embeds: [
                embed
            ],
            components: [
                sceneRow,
                utilityRow
            ]
        });

    }

};
