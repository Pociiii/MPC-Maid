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
    addCoins
} = require('../../utils/users');

const {
    syncUserAchievementCounters
} = require('../achievements/achievements');

const emojis =
    require('../../utils/emojis');

const sessions =
    new Map();

const userSessions =
    new Map();

const sessionTimeoutMs =
    5 * 60 * 1000;

const suits = [
    '\u2660',
    '\u2665',
    '\u2666',
    '\u2663'
];

const suitEmojis = {
    '\u2660':
        '\u2660\uFE0F',
    '\u2665':
        '\u2665\uFE0F',
    '\u2666':
        '\u2666\uFE0F',
    '\u2663':
        '\u2663\uFE0F'
};

const ranks = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K'
];

function createDeck() {

    return suits.flatMap(
        (suit) =>
            ranks.map(
                (rank) => ({
                    rank,
                    suit
                })
            )
    );

}

function shuffle(
    deck
) {

    const cards =
        [...deck];

    for (
        let index = cards.length - 1;
        index > 0;
        index -= 1
    ) {

        const swapIndex =
            Math.floor(
                Math.random() * (index + 1)
            );

        [
            cards[index],
            cards[swapIndex]
        ] =
            [
                cards[swapIndex],
                cards[index]
            ];

    }

    return cards;

}

function draw(
    session
) {

    return session.deck.pop();

}

function cardValue(
    card
) {

    if (
        card.rank === 'A'
    )
        return 11;

    if (
        ['J', 'Q', 'K'].includes(
            card.rank
        )
    )
        return 10;

    return Number(
        card.rank
    );

}

function handValue(
    hand
) {

    let total =
        hand.reduce(
            (sum, card) =>
                sum + cardValue(
                    card
                ),
            0
        );

    let aces =
        hand.filter(
            (card) =>
                card.rank === 'A'
        ).length;

    while (
        total > 21 &&
        aces > 0
    ) {

        total -= 10;
        aces -= 1;

    }

    return total;

}

function isBlackjack(
    hand
) {

    return hand.length === 2 &&
        handValue(
            hand
        ) === 21;

}

function formatCard(
    card
) {

    return `${suitEmojis[card.suit] ?? card.suit} **${card.rank}**`;

}

function formatHand(
    hand,
    hideFirst = false
) {

    if (
        hideFirst
    )
        return [
            '\uD83C\uDCA0 **Hidden**',
            ...hand.slice(
                1
            ).map(
                formatCard
            )
        ].join(
            ' '
        );

    return hand
        .map(
            formatCard
        )
        .join(
            ' '
        );

}

function buildRows(
    session,
    disabled = false
) {

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `blackjack_hit:${session.id}`
                    )
                    .setLabel(
                        'Hit'
                    )
                    .setEmoji(
                        '\uD83C\uDCCF'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    )
                    .setDisabled(
                        disabled
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `blackjack_stand:${session.id}`
                    )
                    .setLabel(
                        'Stand'
                    )
                    .setEmoji(
                        '\u270B'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
                    .setDisabled(
                        disabled
                    )
            )
    ];

}

function getResultText(
    session
) {

    if (
        !session.done
    )
        return 'Hit or stand? Watch the dealer and do not bust.';

    if (
        session.outcome === 'blackjack'
    )
        return `Blackjack. You won **${session.payout - session.bet} coins**.`;

    if (
        session.outcome === 'win'
    )
        return `You won **${session.payout - session.bet} coins**.`;

    if (
        session.outcome === 'push'
    )
        return 'Push. Your bet was returned.';

    return `You lost **${session.bet} coins**.`;

}

function buildEmbed(
    interaction,
    session
) {

    const playerTotal =
        handValue(
            session.playerHand
        );

    const dealerTotal =
        handValue(
            session.dealerHand
        );

    const embed =
        createUserEmbed(
            interaction,
            {
                color:
                    session.done
                        ? session.outcome === 'loss'
                            ? COLORS.ERROR
                            : COLORS.SUCCESS
                        : getRandomColor(),
                command:
                    '/blackjack',
                title:
                    session.done
                        ? 'Blackjack Result'
                        : 'Blackjack',
                description:
                    getResultText(
                        session
                    )
            }
        );

    embed.addFields(
        {
            name:
                '\uD83C\uDCCF Your Hand',
            value:
                `${formatHand(
                    session.playerHand
                )}\nTotal: **${playerTotal}**`,
            inline:
                true
        },
        {
            name:
                '\uD83C\uDCA0 Dealer Hand',
            value:
                `${formatHand(
                    session.dealerHand,
                    !session.done
                )}\nTotal: **${
                    session.done
                        ? dealerTotal
                        : '?'
                }**`,
            inline:
                true
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
                '\uD83C\uDCA0 Deck',
            value:
                '**1 standard deck**',
            inline:
                true
        }
    );

    if (
        session.done
    )
        embed.addFields({
            name:
                `${emojis.coin} Payout`,
            value:
                `**${session.payout} coins**`,
            inline:
                true
        });

    return embed;

}

function settle(
    session,
    outcome
) {

    session.done =
        true;

    session.outcome =
        outcome;

    if (
        outcome === 'blackjack'
    )
        session.payout =
            Math.floor(
                session.bet * 2.5
            );
    else if (
        outcome === 'win'
    )
        session.payout =
            session.bet * 2;
    else if (
        outcome === 'push'
    )
        session.payout =
            session.bet;
    else
        session.payout =
            0;

}

function finishDealer(
    session
) {

    while (
        handValue(
            session.dealerHand
        ) < 17
    )
        session.dealerHand.push(
            draw(
                session
            )
        );

    const playerTotal =
        handValue(
            session.playerHand
        );

    const dealerTotal =
        handValue(
            session.dealerHand
        );

    if (
        dealerTotal > 21 ||
        playerTotal > dealerTotal
    )
        settle(
            session,
            'win'
        );
    else if (
        playerTotal === dealerTotal
    )
        settle(
            session,
            'push'
        );
    else
        settle(
            session,
            'loss'
        );

}

function clearSession(
    session
) {

    if (
        session.timeout
    )
        clearTimeout(
            session.timeout
        );

    sessions.delete(
        session.id
    );

    userSessions.delete(
        session.userId
    );

}

async function paySession(
    session,
    client = null
) {

    if (
        session.paid
    )
        return;

    session.paid =
        true;

    if (
        session.payout > 0
    ) {

        await addCoins(
            session.userId,
            session.payout
        );

        if (
            client
        )
            await syncUserAchievementCounters(
                client,
                session.userId,
                [
                    'wallet_coins'
                ]
            );

    }

}

function createSession(
    userId,
    bet
) {

    const session = {
        bet,
        dealerHand: [],
        deck:
            shuffle(
                createDeck()
            ),
        done:
            false,
        id:
            `${userId}-${Date.now()}`,
        paid:
            false,
        payout:
            0,
        playerHand: [],
        userId
    };

    session.playerHand.push(
        draw(
            session
        ),
        draw(
            session
        )
    );

    session.dealerHand.push(
        draw(
            session
        ),
        draw(
            session
        )
    );

    if (
        isBlackjack(
            session.playerHand
        )
    )
        settle(
            session,
            isBlackjack(
                session.dealerHand
            )
                ? 'push'
                : 'blackjack'
        );

    return session;

}

function registerSession(
    session
) {

    sessions.set(
        session.id,
        session
    );

    userSessions.set(
        session.userId,
        session.id
    );

    session.timeout =
        setTimeout(
            async () => {

                if (
                    !sessions.has(
                        session.id
                    )
                )
                    return;

                settle(
                    session,
                    'push'
                );

                await paySession(
                    session
                );

                clearSession(
                    session
                );

            },
            sessionTimeoutMs
        );

}

function getActiveSession(
    userId
) {

    const sessionId =
        userSessions.get(
            userId
        );

    return sessionId
        ? sessions.get(
            sessionId
        )
        : null;

}

async function handleBlackjackAction(
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
                'This blackjack game is no longer active.',
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
                'This blackjack hand belongs to someone else.',
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    if (
        action === 'hit'
    ) {

        session.playerHand.push(
            draw(
                session
            )
        );

        if (
            handValue(
                session.playerHand
            ) > 21
        )
            settle(
                session,
                'loss'
            );

    }
    else {

        finishDealer(
            session
        );

    }

    if (
        session.done
    )
        await paySession(
            session,
            interaction.client
        );

    await interaction.editReply({
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

    if (
        session.done
    )
        clearSession(
            session
        );

}

module.exports = {
    buildEmbed,
    buildRows,
    createSession,
    getActiveSession,
    handleBlackjackAction,
    paySession,
    registerSession
};
