const { SlashCommandBuilder } = require('discord.js');

const {
    getBalance
} = require('../../utils/users');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),

    async execute(interaction) {

        const balance = await getBalance(
            interaction.user.id
        );

        await interaction.reply(
            `💰 You have ${balance} coins.`
        );
    }
};