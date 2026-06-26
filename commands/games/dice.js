const {
    SlashCommandBuilder
} = require('discord.js');

const {
    COOLDOWNS,
    getRandomColor
} = require('../../data/constants');

const {
    createUserEmbed
} = require('../../utils/embeds');

const {
    handleCooldown
} = require('../../utils/cooldowns');

const {
    addCoins,
    getOrCreateUser,
    removeCoins
} = require('../../utils/users');

const {
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const emojis =
    require('../../utils/emojis');

const MAX_BET =
    50;

function rollDie() {

    return Math.floor(
        Math.random() * 6
    ) + 1;

}

function formatRoll(
    first,
    second
) {

    return `${first} + ${second} = **${first + second}**`;

}

function getResult(
    playerTotal,
    botTotal,
    bet
) {

    if (
        playerTotal > botTotal
    ) {

        return {
            title:
                'Dice Win',
            color:
                '#57F287',
            coins:
                bet,
            text:
                `You won **${bet} coins**.`
        };

    }

    if (
        playerTotal < botTotal
    ) {

        return {
            title:
                'Dice Loss',
            color:
                '#ED4245',
            coins:
                -bet,
            text:
                `You lost **${bet} coins**.`
        };

    }

    return {
        title:
            'Dice Tie',
        color:
            getRandomColor(),
        coins:
            0,
        text:
            'Tie game. Your bet was returned.'
    };

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'dice'
            )
            .setDescription(
                'Bet coins and roll 2d6 against the bot'
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
            await handleCooldown(
                interaction,
                'dice',
                COOLDOWNS.DICE
            )
        )
            return;

        const playerDie1 =
            rollDie();

        const playerDie2 =
            rollDie();

        const botDie1 =
            rollDie();

        const botDie2 =
            rollDie();

        const playerTotal =
            playerDie1 + playerDie2;

        const botTotal =
            botDie1 + botDie2;

        const result =
            getResult(
                playerTotal,
                botTotal,
                bet
            );

        if (
            result.coins > 0
        ) {

            await addCoins(
                interaction.user.id,
                result.coins
            );

        }
        else if (
            result.coins < 0
        ) {

            await removeCoins(
                interaction.user.id,
                Math.abs(
                    result.coins
                )
            );

        }

        const newBalance =
            user.coins + result.coins;

        const embed =
            createUserEmbed(
                interaction,
                {
                color:
                    result.color,
                command:
                    '/dice',
                title:
                    result.title,
                description:
                    result.text
                }
            );

        embed.addFields(
            {
                name:
                    '\uD83C\uDFAF Your Roll',
                value:
                    formatRoll(
                        playerDie1,
                        playerDie2
                    ),
                inline:
                    true
            },
            {
                name:
                    '\uD83E\uDD16 Bot Roll',
                value:
                    formatRoll(
                        botDie1,
                        botDie2
                    ),
                inline:
                    true
            },
            {
                name:
                    `${emojis.coin} Bet`,
                value:
                    `**${bet} coins**`,
                inline:
                    true
            },
            {
                name:
                    `${emojis.coin} Balance`,
                value:
                    `**${newBalance} coins**`,
                inline:
                    true
            }
        );

        await interaction.reply({
            embeds: [
                embed
            ]
        });

        await trackDailyQuest(
            interaction.client,
            interaction.user.id,
            'dice'
        );

    }

};
