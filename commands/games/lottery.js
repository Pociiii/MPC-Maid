const {
    SlashCommandBuilder
} = require('discord.js');

const {
    showLotteryShop
} = require('../../features/lottery/lottery');

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName(
                'lottery'
            )
            .setDescription(
                'View and buy tickets for the weekly lottery'
            ),

    async execute(
        interaction
    ) {

        await showLotteryShop(
            interaction
        );

    }
};
