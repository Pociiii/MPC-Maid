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
    COOLDOWNS,
    getRandomColor
} = require('../../data/constants');

const {
    handleCooldown
} = require('../../utils/cooldowns');

const castOptions = [
    {
        label: 'WM / WF',
        value: 'wm_wf'
    },
    {
        label: 'WM / BF',
        value: 'wm_bf'
    },
    {
        label: 'BM / WF',
        value: 'bm_wf'
    },
    {
        label: 'BM / BF',
        value: 'bm_bf'
    },
    {
        label: 'WF / WF',
        value: 'wf_wf'
    },
    {
        label: 'WF / BF',
        value: 'wf_bf'
    },
    {
        label: 'BF / BF',
        value: 'bf_bf'
    }
];

function buildCastRows(
    userId
) {

    const buttons =
        castOptions.map(
            (option) =>
                new ButtonBuilder()
                    .setCustomId(
                        `customscene_cast:${userId}:${option.value}`
                    )
                    .setLabel(
                        option.label
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
        );

    return [
        new ActionRowBuilder()
            .addComponents(
                buttons.slice(
                    0,
                    4
                )
            ),
        new ActionRowBuilder()
            .addComponents(
                buttons.slice(
                    4
                )
            )
    ];

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'customscene'
            )
            .setDescription(
                'Build a custom scene from existing GIF parts'
            ),

    async execute(
        interaction
    ) {

        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.CUSTOM_SCENE
            )
        )
            return;

        const embed =
            createEmbed({
                color:
                    getRandomColor(),
                title:
                    'Custom Scene',
                description:
                    'Choose the cast for your custom scene.',
                timestamp:
                    true
            });

        await interaction.reply({
            embeds: [embed],
            components:
                buildCastRows(
                    interaction.user.id
                ),
            flags: 64
        });

    }

};
