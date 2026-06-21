const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildDailyReply
} = require('../../features/daily-quests/dailyQuests');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'daily'
            )
            .setDescription(
                'Show your personal daily quests'
            ),

    async execute(
        interaction
    ) {

        await interaction.reply(
            await buildDailyReply(
                interaction
            )
        );

    }

};
