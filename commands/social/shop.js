const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildShopReply
} = require('../../features/shop/boosterShop');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'shop'
            )
            .setDescription(
                'Buy boosters with coins'
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        await interaction.editReply(
            await buildShopReply(
                interaction
            )
        );

    }

};
