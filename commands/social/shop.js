const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildShopReply
} = require('../../features/shop/boosterShop');
const { buildGiftShopReply } = require('../../features/gifts/giftSystem');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'shop'
            )
            .setDescription(
                'Buy boosters or gifts with coins'
            )
            .addSubcommand((subcommand) => subcommand.setName('boosters').setDescription('Buy scene boosters'))
            .addSubcommand((subcommand) => subcommand.setName('gifts').setDescription('Browse your daily gift shop')),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        await interaction.editReply(await (interaction.options.getSubcommand() === 'gifts' ? buildGiftShopReply(interaction) : buildShopReply(interaction)));

    }

};
