const {
    PermissionsBitField,
    SlashCommandBuilder
} = require('discord.js');

const {
    autocomplete,
    executeInspect
} = require('../../features/gif-admin/inspect');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'gifadmin'
            )
            .setDescription(
                'Internal GIF maintenance tools'
            )
            .setDefaultMemberPermissions(
                PermissionsBitField.Flags.Administrator
            )
            .addSubcommand(
                (subcommand) =>
                    subcommand
                        .setName(
                            'inspect'
                        )
                        .setDescription(
                            'Inspect and maintain stored GIFs'
                        )
                        .addStringOption(
                            (option) =>
                                option
                                    .setName(
                                        'pool'
                                    )
                                    .setDescription(
                                        'GIF pool'
                                    )
                                    .setRequired(
                                        true
                                    )
                                    .addChoices(
                                        {
                                            name:
                                                '2-Person Scene',
                                            value:
                                                'scene2'
                                        },
                                        {
                                            name:
                                                '3-Person Scene',
                                            value:
                                                'scene3'
                                        },
                                        {
                                            name:
                                                'Interaction',
                                            value:
                                                'interaction'
                                        }
                                    )
                        )
                        .addStringOption(
                            (option) =>
                                option
                                    .setName(
                                        'category'
                                    )
                                    .setDescription(
                                        'Category'
                                    )
                                    .setRequired(
                                        true
                                    )
                                    .setAutocomplete(
                                        true
                                    )
                        )
                        .addIntegerOption(
                            (option) =>
                                option
                                    .setName(
                                        'position'
                                    )
                                    .setDescription(
                                        '1-based GIF position'
                                    )
                                    .setRequired(
                                        true
                                    )
                                    .setMinValue(
                                        1
                                    )
                        )
                        .addStringOption(
                            (option) =>
                                option
                                    .setName(
                                        'subcategory'
                                    )
                                    .setDescription(
                                        'Subcategory, required for scene pools and horny interactions'
                                    )
                                    .setAutocomplete(
                                        true
                                    )
                        )
            ),

    autocomplete,

    async execute(
        interaction
    ) {

        const subcommand =
            interaction.options.getSubcommand();

        if (
            subcommand === 'inspect'
        )
            await executeInspect(
                interaction
            );

    }

};
