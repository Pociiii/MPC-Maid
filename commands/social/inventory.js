const {
    SlashCommandBuilder
} = require('discord.js');

const {
    COLORS
} = require('../../data/constants');

const {
    createEmbed
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
        return 'Your booster inventory is empty. The shop command will fill this later.';

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
            createEmbed({
                color:
                    COLORS.DEFAULT,
                authorName:
                    interaction.member.displayName,
                authorIcon:
                    interaction.user.displayAvatarURL(),
                title:
                    'Inventory',
                description:
                    formatBoosters(
                        boosters
                    ),
                footerText:
                    '/inventory',
                timestamp:
                    true
            });

        await interaction.editReply({
            embeds: [
                embed
            ]
        });

    }

};
