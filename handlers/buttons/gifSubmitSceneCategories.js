const {
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

const {
    getSceneGroup,
    getSceneGroupKey
} = require('../../data/sceneSubmitGroups');

module.exports = {

    customId:
        'gifsubmit_scenes',

    async execute(
        interaction
    ) {

        const groupKey =
            getSceneGroupKey(
                interaction.customId.split(
                    ':'
                )[1]
            );

        const sceneGroup =
            getSceneGroup(
                groupKey
            );

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    `gif_scene_select:${groupKey}`
                )
                .setPlaceholder(
                    `Select ${sceneGroup.label} category`
                )
                .addOptions(
                    ...Object.entries(
                        sceneGroup.categories
                    )
                        .map(
                            ([value, label]) => ({
                                label,
                                value
                            })
                        )
                );

        const row =
            new ActionRowBuilder()
                .addComponents(
                    menu
                );

        await interaction.reply({
            content:
                `Select the ${sceneGroup.label} category:`,
            components: [
                row
            ],
            flags:
                64
        });

    }

};
