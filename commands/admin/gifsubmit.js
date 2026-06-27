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
    CHANNELS,
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

        await interaction.deferReply({
            flags:
                64
        });

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
- **Scene FF**: 2 female scenes
- **Scene MFM**: 2 males + 1 female
- **Scene FMF**: 1 male + 2 females
- **Scene FFF**: 3 females

**Interactions** are used by Wiggle, Flex, Horny, Drop, Drink, Firework, and similar commands.

**Scene Titles** lets members suggest names for future porn scene posts.`,
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
                        .setEmoji(
                            '🎬'
                        )
                        .setStyle(
                            ButtonStyle.Primary
                        ),
                    new ButtonBuilder()
                        .setCustomId(
                            'gifsubmit_scenes:ff'
                        )
                        .setLabel(
                            'Scene FF'
                        )
                        .setEmoji(
                            '🎬'
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
                        .setEmoji(
                            '🎬'
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
                        .setEmoji(
                            '🎬'
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
                        .setEmoji(
                            '🎬'
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
                        .setEmoji(
                            '✨'
                        )
                        .setStyle(
                            ButtonStyle.Success
                        ),
                    new ButtonBuilder()
                        .setCustomId(
                            'gifsubmit_titles'
                        )
                        .setLabel(
                            'Scene Titles'
                        )
                        .setStyle(
                            ButtonStyle.Primary
                        ),
                    new ButtonBuilder()
                        .setCustomId(
                            'gifsubmit_info'
                        )
                        .setLabel(
                            'GIF Info'
                        )
                        .setEmoji(
                            'ℹ️'
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        )
                );

        const channel =
            interaction.client.channels.cache.get(
                CHANNELS.GIFS
            ) ??
            await interaction.client.channels.fetch(
                CHANNELS.GIFS
            ).catch(
                () => null
            );

        if (
            !channel?.send
        ) {

            await interaction.editReply({
                content:
                    'I could not find the GIF submission channel.'
            });

            return;

        }

        const message =
            await channel.send({
            embeds: [
                embed
            ],
            components: [
                sceneRow,
                utilityRow
            ]
        });

        await interaction.editReply({
            content:
                `GIF submission panel posted in <#${CHANNELS.GIFS}>: ${message.url}`
        });

    }

};
