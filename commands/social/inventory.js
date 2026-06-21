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

function formatBoosters(
    boosters
) {

    if (
        boosters.length === 0
    )
        return 'Your booster inventory is empty. Use `/shop` to buy boosters.';

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
            .setDescription(
                'View your booster inventory'
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

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
                    '/inventory',
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
