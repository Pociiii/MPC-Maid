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
    getOrCreateUser,
    removeCoins,
    removeXP,
    setFame,
    setPerformance,
    setStamina
} = require('../../utils/users');

const {
    getStatUpgradeCoinCost,
    getStatUpgradeCost,
    isTrainableStat,
    maxTrainableStat
} = require('../../utils/statTraining');

const statLabels = {
    performance: 'Performance',
    stamina: 'Stamina',
    fame: 'Fame'
};

const statSetters = {
    performance: setPerformance,
    stamina: setStamina,
    fame: setFame
};

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'train'
            )
            .setDescription(
                'Spend XP and coins to improve one porn career stat'
            )
            .addStringOption(
                (option) =>
                    option
                        .setName(
                            'stat'
                        )
                        .setDescription(
                            'The stat you want to train'
                        )
                        .setRequired(
                            true
                        )
                        .addChoices(
                            {
                                name:
                                    'Performance',
                                value:
                                    'performance'
                            },
                            {
                                name:
                                    'Stamina',
                                value:
                                    'stamina'
                            },
                            {
                                name:
                                    'Fame',
                                value:
                                    'fame'
                            }
                        )
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                64
        });

        const stat =
            interaction.options.getString(
                'stat'
            );

        if (
            !isTrainableStat(
                stat
            )
        ) {

            await interaction.editReply(
                'That stat cannot be trained.'
            );

            return;

        }

        const user =
            await getOrCreateUser(
                interaction.user.id
            );

        const currentValue =
            Number(
                user[stat]
            );

        if (
            currentValue >= maxTrainableStat
        ) {

            await interaction.editReply(
                `${statLabels[stat]} is already at the current cap of ${maxTrainableStat}.`
            );

            return;

        }

        const xpCost =
            getStatUpgradeCost(
                currentValue
            );

        const coinCost =
            getStatUpgradeCoinCost(
                currentValue
            );

        if (
            user.xp < xpCost ||
            user.coins < coinCost
        ) {

            await interaction.editReply(
                `Training ${statLabels[stat]} from ${currentValue} to ${currentValue + 1} costs **${xpCost} XP** and **${coinCost} coins**.\nYou have **${user.xp} XP** and **${user.coins} coins**.`
            );

            return;

        }

        await Promise.all([
            removeXP(
                interaction.user.id,
                xpCost
            ),
            removeCoins(
                interaction.user.id,
                coinCost
            ),
            statSetters[stat](
                interaction.user.id,
                currentValue + 1
            )
        ]);

        const embed =
            createEmbed({
                color:
                    COLORS.SUCCESS,
                authorName:
                    interaction.member.displayName,
                authorIcon:
                    interaction.user.displayAvatarURL(),
                title:
                    'Training Complete',
                description:
`**${statLabels[stat]}** increased from **${currentValue}** to **${currentValue + 1}**.

Cost paid:
- XP: **${xpCost}**
- Coins: **${coinCost}**`,
                footerText:
                    '/train',
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
