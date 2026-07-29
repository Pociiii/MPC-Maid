const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildMyStudio
} = require('../../features/player-studios/studios');

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName('mystudio')
            .setDescription('View, buy, or reopen your player studio'),

    async execute(interaction) {
        await interaction.deferReply({
            flags: 64
        });

        await interaction.editReply(
            await buildMyStudio(interaction)
        );
    }
};
