const {
    SlashCommandBuilder
} = require('discord.js');

const {
    COLORS
} = require('../../data/constants');

const {
    createUserEmbed
} = require('../../utils/embeds');

const {
    formatBoosterInventoryLine,
    getUserBoosters
} = require('../../utils/boosters');
const { showGiftInventory } = require('../../features/gifts/giftSystem');

function formatBoosters(
    boosters
) {

    if (
        boosters.length === 0
    )
        return 'Your booster inventory is empty. Use `/shop boosters` to buy boosters.';

        return boosters
        .map(
            formatBoosterInventoryLine
        )
        .join(
            '\n'
        );

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'inventory'
            )
            .setDescription('View your inventories')
            .addSubcommand((subcommand) => subcommand.setName('boosters').setDescription('View scene boosters'))
            .addSubcommand((subcommand) => subcommand.setName('gifts').setDescription('View gifts you can send')),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        if (interaction.options.getSubcommand() === 'gifts') {
            await showGiftInventory(interaction);
            return;
        }

        const boosters =
            await getUserBoosters(
                interaction.user.id
            );

        const embed =
            createUserEmbed(
                interaction,
                {
                color:
                    COLORS.DEFAULT,
                command:
                    '/inventory boosters',
                title:
                    'Inventory',
                description:
                    formatBoosters(
                        boosters
                    )
                }
            );

        await interaction.editReply({
            embeds: [
                embed
            ]
        });

    }

};
