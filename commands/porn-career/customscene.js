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

const {
    getSceneCategoryLabel
} = require('../../data/sceneSubmitGroups');

const castOptions = [
    {
        label: getSceneCategoryLabel('mf', 'wm_wf'),
        value: 'wm_wf'
    },
    {
        label: getSceneCategoryLabel('mf', 'wm_bf'),
        value: 'wm_bf'
    },
    {
        label: getSceneCategoryLabel('mf', 'bm_wf'),
        value: 'bm_wf'
    },
    {
        label: getSceneCategoryLabel('mf', 'bm_bf'),
        value: 'bm_bf'
    },
    {
        label: getSceneCategoryLabel('mf', 'wf_wf'),
        value: 'wf_wf'
    },
    {
        label: getSceneCategoryLabel('mf', 'wf_bf'),
        value: 'wf_bf'
    },
    {
        label: getSceneCategoryLabel('mf', 'bf_bf'),
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
                    .setEmoji(
                        '🎭'
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
                thumbnail:
                    interaction.user.displayAvatarURL(),
                description:
                    'Choose the cast for your custom scene.',
                footerText:
                    '/customscene',
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
