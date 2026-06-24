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
    75;

const symbols = [
    {
        icon:
            '🍒',
        weight:
            30
    },
    {
        icon:
            '🍋',
        weight:
            25
    },
    {
        icon:
            '🍇',
        weight:
            20
    },
    {
        icon:
            '💋',
        weight:
            14
    },
    {
        icon:
            '💎',
        weight:
            8
    },
    {
        icon:
            '👑',
        weight:
            3
    }
];

function spinReel() {

    const totalWeight =
        symbols.reduce(
            (sum, symbol) =>
                sum + symbol.weight,
            0
        );

    let roll =
        Math.random() * totalWeight;

    for (
        const symbol of symbols
    ) {

        roll -=
            symbol.weight;

        if (
            roll <= 0
        )
            return symbol.icon;

    }

    return symbols[0].icon;

}

function getMultiplier(
    reels
) {

    const unique =
        new Set(
            reels
        );

    if (
        unique.size === 1
    ) {

        if (
            reels[0] === '👑'
        )
            return 8;

        if (
            reels[0] === '💎'
        )
            return 5;

        if (
            reels[0] === '💋'
        )
            return 4;

        return 3;

    }

    if (
        unique.size === 2
    )
        return 1;

    return 0;

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'slots'
            )
            .setDescription(
                'Bet coins and spin the slot machine'
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
                'slots',
                COOLDOWNS.SLOTS
            )
        )
            return;

        const reels =
            [
                spinReel(),
                spinReel(),
                spinReel()
            ];

        const multiplier =
            getMultiplier(
                reels
            );

        const payout =
            bet * multiplier;

        await removeCoins(
            interaction.user.id,
            bet
        );

        if (
            payout > 0
        )
            await addCoins(
                interaction.user.id,
                payout
            );

        const profit =
            payout - bet;

        const embed =
            createUserEmbed(
                interaction,
                {
                    color:
                        profit > 0
                            ? '#57F287'
                            : profit === 0
                                ? getRandomColor()
                                : '#ED4245',
                    command:
                        '/slots',
                    title:
                        profit > 0
                            ? 'Slots Win'
                            : profit === 0
                                ? 'Slots Push'
                                : 'Slots Loss',
                    description:
                        profit > 0
                            ? `You won **${profit} coins**.`
                            : profit === 0
                                ? 'You got your bet back.'
                                : `You lost **${bet} coins**.`
                }
            );

        embed.addFields(
            {
                name:
                    'Reels',
                value:
                    `**${reels.join(
                        ' | '
                    )}**`,
                inline:
                    false
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
                    `${emojis.coin} Payout`,
                value:
                    `**${payout} coins**`,
                inline:
                    true
            },
            {
                name:
                    'Multiplier',
                value:
                    `**x${multiplier}**`,
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
            'slots'
        );

    }

};
