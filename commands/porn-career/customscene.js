const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

const {
    createUserEmbed
} = require('../../utils/embeds');

const {
    COOLDOWNS
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

    return [
        new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(
                        `customscene_cast:${userId}`
                    )
                    .setPlaceholder(
                        'Choose cast'
                    )
                    .addOptions(
                        castOptions.map(
                            (option) => ({
                                label:
                                    option.label,
                                value:
                                    option.value,
                                emoji:
                                    '\uD83C\uDFAD'
                            })
                        )
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
            createUserEmbed(
                interaction,
                {
                    command:
                        '/customscene',
                    title:
                        'Custom Scene',
                    description:
                        'Choose the cast for your custom scene.'
                }
            );

        await interaction.reply({
            embeds: [
                embed
            ],
            components:
                buildCastRows(
                    interaction.user.id
                ),
            flags:
                64
        });

    }

};
