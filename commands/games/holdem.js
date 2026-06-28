const {
    SlashCommandBuilder
} = require('discord.js');

const {
    COOLDOWNS
} = require('../../data/constants');

const {
    handleCooldown
} = require('../../utils/cooldowns');

const {
    getOrCreateUser,
    spendCoins
} = require('../../utils/users');

const {
    MAX_BET,
    buildEmbed,
    buildRows,
    createSession,
    getActiveSession,
    registerSession
} = require('../../features/casino/holdem');

const {
    incrementAchievementProgress
} = require('../../features/achievements/achievements');

const emojis =
    require('../../utils/emojis');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'holdem'
            )
            .setDescription(
                'Play Texas Hold\'em against the dealer'
            )
            .addIntegerOption(
                (option) =>
                    option
                        .setName(
                            'bet'
                        )
                        .setDescription(
                            `Base bet per street, max ${MAX_BET}`
                        )
                        .setMinValue(
                            1
                        )
                        .setMaxValue(
                            MAX_BET
                        )
                        .setRequired(
                            true
                        )
            ),

    async execute(
        interaction
    ) {

        const bet =
            interaction.options.getInteger(
                'bet'
            );

        const user =
            await getOrCreateUser(
                interaction.user.id
            );

        if (
            user.coins < bet
        ) {

            await interaction.reply({
                content:
                    `You only have ${emojis.coin} **${user.coins} coins**. Lower the bet and try again.`,
                flags:
                    64
            });

            return;

        }

        if (
            getActiveSession(
                interaction.user.id
            )
        ) {

            await interaction.reply({
                content:
                    'Finish your current Hold\'em hand first.',
                flags:
                    64
            });

            return;

        }

        if (
            await handleCooldown(
                interaction,
                'holdem',
                COOLDOWNS.HOLDEM
            )
        )
            return;

        const spent =
            await spendCoins(
                interaction.user.id,
                bet
            );

        if (
            !spent
        ) {

            await interaction.reply({
                content:
                    `You need ${emojis.coin} **${bet} coins** to start this Hold'em hand.`,
                flags:
                    64
            });

            return;

        }

        const session =
            createSession(
                interaction.user.id,
                bet
            );

        registerSession(
            session
        );

        await incrementAchievementProgress(
            interaction.client,
            interaction.user.id,
            'casino_plays'
        );

        await interaction.reply({
            embeds: [
                buildEmbed(
                    interaction,
                    session
                )
            ],
            components:
                buildRows(
                    session
                )
        });

    }

};
