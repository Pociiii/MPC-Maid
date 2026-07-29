const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildStudiosReply
} = require('../../features/player-studios/studios');

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName('studios')
            .setDescription('Browse open player studios'),

    async execute(interaction) {
        await interaction.deferReply();
        await interaction.editReply(
            await buildStudiosReply(interaction)
        );
    }
};
