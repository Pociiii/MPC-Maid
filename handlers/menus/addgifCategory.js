const {
    StringSelectMenuBuilder,
    ActionRowBuilder
} = require('discord.js');

module.exports = async (
    interaction
) => {

    const category =
        interaction.values[0];

    const phases = [
        'foreplay',
        'oral',
        'sex',
        'finale'
    ];

    const menu =
        new StringSelectMenuBuilder()

            .setCustomId(
                `addgif_phase:${category}`
            )

            .setPlaceholder(
                'Select phase'
            )

            .addOptions(
                phases.map(
                    phase => ({
                        label:
                            phase.charAt(0)
                            .toUpperCase()
                            +
                            phase.slice(1),

                        value:
                            phase
                    })
                )
            );

    const row =
        new ActionRowBuilder()
            .addComponents(menu);

    await interaction.update({

        content:
            `Category: ${category}`,

        components: [row]

    });

};