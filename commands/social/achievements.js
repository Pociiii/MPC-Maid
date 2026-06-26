const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildAchievementsReply
} = require('../../features/achievements/viewer');

const {
    fetchDisplayTarget
} = require('../../utils/embeds');

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

        const targetUser =
            interaction.options.getUser(
                'user'
            ) ??
            interaction.user;

        const target =
            await fetchDisplayTarget(
                interaction.client,
                targetUser.id
            );

        await interaction.editReply(
            await buildAchievementsReply(
                interaction,
                target
            )
        );

    }

};
