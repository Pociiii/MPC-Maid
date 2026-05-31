const {
    SlashCommandBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll a dice'),

    async execute(interaction) {

        const player = Math.floor(Math.random() * 6) + 1;
        const bot = Math.floor(Math.random() * 6) + 1;

        await interaction.reply(
            `You rolled ${player}\nBot rolled ${bot}`
        );
    }
};