const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    COLORS,
    getRandomColor
} = require('../../data/constants');

const {
    createUserEmbed
} = require('../../utils/embeds');

const {
    addCoins,
    getOrCreateUser,
    removeCoins
} = require('../../utils/users');

const {
    trackDailyQuest
} = require('../daily-quests/dailyQuests');

const emojis =
    require('../../utils/emojis');

const MAX_BET =
    25;

const sessionTimeoutMs =
    5 * 60 * 1000;

const sessions =
    new Map();

const userSessions =
    new Map();

const SLOT_SYMBOLS = {
    cherry:
        '\uD83C\uDF52',
    lemon:
        '\uD83C\uDF4B',
    grapes:
        '\uD83C\uDF47',
    kiss:
        '\uD83D\uDC8B',
    diamond:
        '\uD83D\uDC8E',
    crown:
        '\uD83D\uDC51'
};

const symbols = [
    {
        icon:
            SLOT_SYMBOLS.cherry,
        weight:
            30
    },
    {
        icon:
            SLOT_SYMBOLS.lemon,
        weight:
            25
    },
    {
        icon:
            SLOT_SYMBOLS.grapes,
        weight:
            20
    },
    {
        icon:
            SLOT_SYMBOLS.kiss,
        weight:
            14
    },
    {
        icon:
            SLOT_SYMBOLS.diamond,
        weight:
            8
    },
    {
        icon:
            SLOT_SYMBOLS.crown,
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
        Math.random() *
        totalWeight;

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

function getPairSymbol(
    reels
) {

    return reels.find(
        (symbol, index) =>
            reels.indexOf(
                symbol
            ) !== index
    );

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
            reels[0] === SLOT_SYMBOLS.crown
        )
            return 10;

        if (
            reels[0] === SLOT_SYMBOLS.diamond
        )
            return 7;

        if (
            reels[0] === SLOT_SYMBOLS.kiss
        )
            return 5;

        return 3;

    }

    if (
        unique.size === 2
    ) {

        const pair =
            getPairSymbol(
                reels
            );

        if (
            [
                SLOT_SYMBOLS.crown,
                SLOT_SYMBOLS.diamond,
                SLOT_SYMBOLS.kiss
            ].includes(
                pair
            )
        )
            return 2;

        return 1;

    }

    return 0;

}

function createSlotSession(
    userId,
    bet
) {

    const oldSessionId =
        userSessions.get(
            userId
        );

    if (
        oldSessionId
    )
        clearSessionById(
            oldSessionId
        );

    const session = {
        bet,
        closed:
            false,
        id:
            `${userId}-${Date.now()}`,
        lastMultiplier:
            0,
        lastPayout:
            0,
        lastProfit:
            0,
        lastReels:
            [],
        spins:
            0,
        totalProfit:
            0,
        userId
    };

    sessions.set(
        session.id,
        session
    );

    userSessions.set(
        userId,
        session.id
    );

    refreshSessionTimeout(
        session
    );

    return session;

}

function clearSessionById(
    sessionId
) {

    const session =
        sessions.get(
            sessionId
        );

    if (
        !session
    )
        return;

    if (
        session.timeout
    )
        clearTimeout(
            session.timeout
        );

    sessions.delete(
        sessionId
    );

    if (
        userSessions.get(
            session.userId
        ) === sessionId
    )
        userSessions.delete(
            session.userId
        );

}

function refreshSessionTimeout(
    session
) {

    if (
        session.timeout
    )
        clearTimeout(
            session.timeout
        );

    session.timeout =
        setTimeout(
            () =>
                clearSessionById(
                    session.id
                ),
            sessionTimeoutMs
        );

}

async function spinSession(
    client,
    session
) {

    const user =
        await getOrCreateUser(
            session.userId
        );

    if (
        user.coins < session.bet
    )
        return {
            ok:
                false,
            user
        };

    const reels = [
        spinReel(),
        spinReel(),
        spinReel()
    ];

    const multiplier =
        getMultiplier(
            reels
        );

    const payout =
        Math.floor(
            session.bet *
            multiplier
        );

    await removeCoins(
        session.userId,
        session.bet
    );

    if (
        payout > 0
    )
        await addCoins(
            session.userId,
            payout
        );

    const profit =
        payout -
        session.bet;

    session.lastReels =
        reels;
    session.lastMultiplier =
        multiplier;
    session.lastPayout =
        payout;
    session.lastProfit =
        profit;
    session.spins += 1;
    session.totalProfit +=
        profit;

    refreshSessionTimeout(
        session
    );

    await trackDailyQuest(
        client,
        session.userId,
        'slots'
    );

    return {
        ok:
            true,
        user:
            await getOrCreateUser(
                session.userId
            )
    };

}

function getResultTitle(
    session
) {

    if (
        session.closed
    )
        return 'Slots Closed';

    if (
        session.lastProfit > 0
    )
        return 'Slots Win';

    if (
        session.lastProfit === 0
    )
        return 'Slots Push';

    return 'Slots Loss';

}

function getResultDescription(
    session,
    user,
    notice = null
) {

    if (
        notice
    )
        return notice;

    const result =
        session.lastProfit > 0
            ? `You won **${session.lastProfit} coins**.`
            : session.lastProfit === 0
                ? 'You got your bet back.'
                : `You lost **${session.bet} coins**.`;

    return `${result}\nBalance: **${user.coins} coins**`;

}

function buildSlotEmbed(
    interaction,
    session,
    user,
    notice = null
) {

    const embed =
        createUserEmbed(
            interaction,
            {
                color:
                    session.closed
                        ? getRandomColor()
                        : session.lastProfit > 0
                            ? COLORS.SUCCESS
                            : session.lastProfit === 0
                                ? getRandomColor()
                                : COLORS.ERROR,
                command:
                    '/slots',
                title:
                    getResultTitle(
                        session
                    ),
                description:
                    getResultDescription(
                        session,
                        user,
                        notice
                    )
            }
        );

    embed.addFields(
        {
            name:
                '\uD83C\uDFB0 Reels',
            value:
                session.lastReels.length
                    ? `**${session.lastReels.join(
                        ' | '
                    )}**`
                    : 'No spins yet.',
            inline:
                false
        },
        {
            name:
                `${emojis.coin} Bet`,
            value:
                `**${session.bet} coins**`,
            inline:
                true
        },
        {
            name:
                `${emojis.coin} Payout`,
            value:
                `**${session.lastPayout} coins**`,
            inline:
                true
        },
        {
            name:
                '\uD83D\uDCCA Session',
            value:
                `Spins: **${session.spins}**\nNet: **${session.totalProfit >= 0 ? '+' : ''}${session.totalProfit} coins**`,
            inline:
                true
        }
    );

    return embed;

}

function buildSlotRows(
    session,
    user,
    disabled = false
) {

    const canSpin =
        !disabled &&
        !session.closed &&
        user.coins >= session.bet;

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `slots_spin:${session.id}`
                    )
                    .setLabel(
                        'Spin Again'
                    )
                    .setEmoji(
                        '\uD83C\uDFB0'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    )
                    .setDisabled(
                        !canSpin
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `slots_leave:${session.id}`
                    )
                    .setLabel(
                        'Leave'
                    )
                    .setEmoji(
                        '\uD83D\uDEAA'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
                    .setDisabled(
                        disabled ||
                        session.closed
                    )
            )
    ];

}

async function handleSlotsAction(
    interaction,
    action,
    sessionId
) {

    const session =
        sessions.get(
            sessionId
        );

    if (
        !session
    ) {

        await interaction.reply({
            content:
                'This slot machine is no longer active.',
            flags:
                64
        });

        return;

    }

    if (
        interaction.user.id !== session.userId
    ) {

        await interaction.reply({
            content:
                'This slot machine belongs to someone else.',
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    if (
        action === 'leave'
    ) {

        session.closed =
            true;

        clearSessionById(
            session.id
        );

        const user =
            await getOrCreateUser(
                session.userId
            );

        await interaction.editReply({
            embeds: [
                buildSlotEmbed(
                    interaction,
                    session,
                    user,
                    'You left the slot machine.'
                )
            ],
            components:
                buildSlotRows(
                    session,
                    user,
                    true
                )
        });

        return;

    }

    const result =
        await spinSession(
            interaction.client,
            session
        );

    if (
        !result.ok
    ) {

        await interaction.editReply({
            embeds: [
                buildSlotEmbed(
                    interaction,
                    session,
                    result.user,
                    `You need **${session.bet} coins** to spin again.`
                )
            ],
            components:
                buildSlotRows(
                    session,
                    result.user
                )
        });

        return;

    }

    await interaction.editReply({
        embeds: [
            buildSlotEmbed(
                interaction,
                session,
                result.user
            )
        ],
        components:
            buildSlotRows(
                session,
                result.user
            )
    });

}

module.exports = {
    MAX_BET,
    buildSlotEmbed,
    buildSlotRows,
    createSlotSession,
    handleSlotsAction,
    spinSession
};
