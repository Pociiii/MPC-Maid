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
    boosterTiers,
    getUserBoosters
} = require('../../utils/boosters');

const statLabels = {
    performance: 'Performance',
    stamina: 'Stamina',
    fame: 'Fame'
};

function formatBoosters(
    boosters
) {

    if (
        boosters.length === 0
    )
        return 'Your booster inventory is empty. The shop command will fill this later.';

    return boosters
        .map(
            (booster) => {

                const tier =
                    boosterTiers[booster.tier];

                return `- **${statLabels[booster.stat]} T${booster.tier}** (+${tier.value}) x${booster.quantity}`;

            }
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
