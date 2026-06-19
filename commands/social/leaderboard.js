const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildLeaderboard
} = require('../../features/leaderboard/leaderboard');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'leaderboard'
            )
            .setDescription(
                'View server leaderboards'
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply();

        await interaction.editReply(
            await buildLeaderboard(
                interaction,
                'ranking'
            )
        );

    }

};
