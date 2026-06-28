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
    buildEmbed,
    buildRows,
    createSession,
    getActiveSession,
    paySession,
    registerSession
} = require('../../features/casino/blackjack');

const {
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const emojis =
    require('../../utils/emojis');

const MAX_BET =
    100;

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'blackjack'
            )
            .setDescription(
                'Bet coins and play blackjack against the dealer'
            )
            .addIntegerOption(
                (option) =>
                    option
                        .setName(
                            'bet'
                        )
                        .setDescription(
                            `Coins to bet, max ${MAX_BET}`
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
                    'Finish your current blackjack hand first.',
                flags:
                    64
            });

            return;

        }

        if (
            await handleCooldown(
                interaction,
                'blackjack',
                COOLDOWNS.BLACKJACK
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

            const currentUser =
                await getOrCreateUser(
                    interaction.user.id
                );

            await interaction.reply({
                content:
                    `You only have ${emojis.coin} **${currentUser.coins} coins**. Lower the bet and try again.`,
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

        if (
            !session.done
        )
            registerSession(
                session
            );
        else
            await paySession(
                session,
                interaction.client
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
                    session,
                    session.done
                )
        });

        await trackDailyQuest(
            interaction.client,
            interaction.user.id,
            'blackjack'
        );

    }

};
