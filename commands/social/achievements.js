const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildAchievementsReply
} = require('../../features/achievements/viewer');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'achievements'
            )
            .setDescription(
                'View achievement progress'
            )
            .addUserOption(
                (option) =>
                    option
                        .setName(
                            'user'
                        )
                        .setDescription(
                            'The user to inspect'
                        )
                        .setRequired(
                            false
                        )
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        const target =
            interaction.options.getUser(
                'user'
            ) ??
            interaction.user;

        await interaction.editReply(
            await buildAchievementsReply(
                interaction,
                target
            )
        );

    }

};
