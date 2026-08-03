const {
    SlashCommandBuilder
} = require('discord.js');

const {
    buildShopReply
} = require('../../features/shop/boosterShop');
const { buildGiftShopReply } = require('../../features/gifts/giftSystem');
const { buildFertilityShopReply } = require('../../features/shop/fertilityShop');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'shop'
            )
            .setDescription(
                'Buy boosters, gifts, or fertility pills with coins'
            )
            .addSubcommand((subcommand) => subcommand.setName('boosters').setDescription('Buy scene boosters'))
            .addSubcommand((subcommand) => subcommand.setName('gifts').setDescription('Browse your daily gift shop'))
            .addSubcommand((subcommand) => subcommand.setName('fertility').setDescription('Activate a fertility pill')),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        const builders = {
            boosters: buildShopReply,
            fertility: buildFertilityShopReply,
            gifts: buildGiftShopReply
        };

        await interaction.editReply(
            await builders[interaction.options.getSubcommand()](interaction)
        );

    }

};
