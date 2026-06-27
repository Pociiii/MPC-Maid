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
    spendCoins
} = require('../../utils/users');

const {
    syncUserAchievementCounters
} = require('../achievements/achievements');

const emojis =
    require('../../utils/emojis');

const MAX_BET =
    50;

const STREETS =
    4;

const sessionTimeoutMs =
    5 * 60 * 1000;

const sessions =
    new Map();

const userSessions =
    new Map();

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
    'K',
    'A'
];

const rankValues = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14
};

const handNames = [
    'High Card',
    'One Pair',
    'Two Pair',
    'Three of a Kind',
    'Straight',
    'Flush',
    'Full House',
    'Four of a Kind',
    'Straight Flush'
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

function formatCard(
    card
) {

    return `${suitEmojis[card.suit] ?? card.suit} **${card.rank}**`;

}

function formatCards(
    cards
) {

    if (
        cards.length === 0
    )
        return 'No cards yet.';

    return cards
        .map(
            formatCard
        )
        .join(
            ' '
        );

}

function hiddenCards(
    count
) {

    return Array.from(
        {
            length:
                count
        },
        () =>
            '\uD83C\uDCA0 **Hidden**'
    ).join(
        ' '
    );

}

function compareScores(
    first,
    second
) {

    const length =
        Math.max(
            first.length,
            second.length
        );

    for (
        let index = 0;
        index < length;
        index += 1
    ) {

        const firstValue =
            first[index] ?? 0;

        const secondValue =
            second[index] ?? 0;

        if (
            firstValue !== secondValue
        )
            return firstValue - secondValue;

    }

    return 0;

}

function straightHigh(
    values
) {

    const unique =
        [...new Set(
            values
        )];

    if (
        unique.includes(
            14
        )
    )
        unique.push(
            1
        );

    for (
        let high = 14;
        high >= 5;
        high -= 1
    ) {

        const cards =
            [
                high,
                high - 1,
                high - 2,
                high - 3,
                high - 4
            ];

        if (
            cards.every(
                (value) =>
                    unique.includes(
                        value
                    )
            )
        )
            return high;

    }

    return null;

}

function evaluateFive(
    cards
) {

    const values =
        cards
            .map(
                (card) =>
                    rankValues[card.rank]
            )
            .sort(
                (first, second) =>
                    second - first
            );

    const countsByValue =
        new Map();

    values.forEach(
        (value) =>
            countsByValue.set(
                value,
                (
                    countsByValue.get(
                        value
                    ) ?? 0
                ) + 1
            )
    );

    const counts =
        [...countsByValue.entries()]
            .sort(
                ([firstValue, firstCount], [secondValue, secondCount]) =>
                    secondCount - firstCount ||
                    secondValue - firstValue
            );

    const isFlush =
        cards.every(
            (card) =>
                card.suit === cards[0].suit
        );

    const highStraight =
        straightHigh(
            values
        );

    const fours =
        counts.find(
            ([, count]) =>
                count === 4
        );

    const threes =
        counts
            .filter(
                ([, count]) =>
                    count === 3
            )
            .map(
                ([value]) =>
                    value
            );

    const pairs =
        counts
            .filter(
                ([, count]) =>
                    count === 2
            )
            .map(
                ([value]) =>
                    value
            );

    if (
        isFlush &&
        highStraight
    )
        return {
            name:
                handNames[8],
            score:
                [
                    8,
                    highStraight
                ]
        };

    if (
        fours
    )
        return {
            name:
                handNames[7],
            score:
                [
                    7,
                    fours[0],
                    values.find(
                        (value) =>
                            value !== fours[0]
                    )
                ]
        };

    if (
        threes.length > 0 &&
        pairs.length > 0
    )
        return {
            name:
                handNames[6],
            score:
                [
                    6,
                    threes[0],
                    pairs[0]
                ]
        };

    if (
        isFlush
    )
        return {
            name:
                handNames[5],
            score:
                [
                    5,
                    ...values
                ]
        };

    if (
        highStraight
    )
        return {
            name:
                handNames[4],
            score:
                [
                    4,
                    highStraight
                ]
        };

    if (
        threes.length > 0
    )
        return {
            name:
                handNames[3],
            score:
                [
                    3,
                    threes[0],
                    ...values.filter(
                        (value) =>
                            value !== threes[0]
                    )
                ]
        };

    if (
        pairs.length >= 2
    )
        return {
            name:
                handNames[2],
            score:
                [
                    2,
                    pairs[0],
                    pairs[1],
                    values.find(
                        (value) =>
                            value !== pairs[0] &&
                            value !== pairs[1]
                    )
                ]
        };

    if (
        pairs.length === 1
    )
        return {
            name:
                handNames[1],
            score:
                [
                    1,
                    pairs[0],
                    ...values.filter(
                        (value) =>
                            value !== pairs[0]
                    )
                ]
        };

    return {
        name:
            handNames[0],
        score:
            [
                0,
                ...values
            ]
    };

}

function bestHand(
    cards
) {

    let best =
        null;

    for (
        let first = 0;
        first < cards.length - 4;
        first += 1
    ) {

        for (
            let second = first + 1;
            second < cards.length - 3;
            second += 1
        ) {

            for (
                let third = second + 1;
                third < cards.length - 2;
                third += 1
            ) {

                for (
                    let fourth = third + 1;
                    fourth < cards.length - 1;
                    fourth += 1
                ) {

                    for (
                        let fifth = fourth + 1;
                        fifth < cards.length;
                        fifth += 1
                    ) {

                        const handCards =
                            [
                                cards[first],
                                cards[second],
                                cards[third],
                                cards[fourth],
                                cards[fifth]
                            ];

                        const result =
                            evaluateFive(
                                handCards
                            );

                        if (
                            !best ||
                            compareScores(
                                result.score,
                                best.score
                            ) > 0
                        )
                            best = {
                                ...result,
                                cards:
                                    handCards
                            };

                    }

                }

            }

        }

    }

    return best;

}

function getStageLabel(
    session
) {

    if (
        session.done
    )
        return 'Finished';

    if (
        session.stage === 'preflop'
    )
        return 'Pre-Flop';

    if (
        session.stage === 'flop'
    )
        return 'Flop';

    if (
        session.stage === 'turn'
    )
        return 'Turn';

    return 'River';

}

function getAdvanceLabel(
    session
) {

    if (
        session.stage === 'preflop'
    )
        return 'Deal Flop';

    if (
        session.stage === 'flop'
    )
        return 'Deal Turn';

    if (
        session.stage === 'turn'
    )
        return 'Deal River';

    return 'Showdown';

}

function getPublicPlayerCards(
    session
) {

    if (
        session.done
    )
        return formatCards(
            session.playerHand
        );

    return 'Hidden. Press **Peek** to view them privately.';

}

function getPublicDealerCards(
    session
) {

    if (
        session.done
    )
        return formatCards(
            session.dealerHand
        );

    return hiddenCards(
        2
    );

}

function getNetText(
    session
) {

    const net =
        session.payout - session.committed;

    if (
        net > 0
    )
        return `+${net} coins`;

    return `${net} coins`;

}

function getResultText(
    session
) {

    if (
        !session.done
    )
        return `Base bet **${session.baseBet} coins**. Each street costs another **${session.baseBet} coins** if you keep playing.`;

    if (
        session.outcome === 'fold'
    )
        return `You folded and got **${session.payout} coins** back. Net: **${getNetText(
            session
        )}**.`;

    if (
        session.outcome === 'timeout'
    )
        return 'This hand timed out and your locked stake was returned.';

    if (
        session.outcome === 'push'
    )
        return `Push. Both sides made **${session.playerBest.name}** and your stake was returned.`;

    if (
        session.outcome === 'win'
    )
        return `Your **${session.playerBest.name}** beat dealer's **${session.dealerBest.name}**. Net: **${getNetText(
            session
        )}**.`;

    return `Dealer's **${session.dealerBest.name}** beat your **${session.playerBest.name}**. Net: **${getNetText(
        session
    )}**.`;

}

function buildRows(
    session,
    disabled = false
) {

    const done =
        disabled ||
        session.done;

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `holdem_peek:${session.id}`
                    )
                    .setLabel(
                        'Peek'
                    )
                    .setEmoji(
                        '\uD83D\uDC40'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
                    .setDisabled(
                        done
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `holdem_advance:${session.id}`
                    )
                    .setLabel(
                        done
                            ? 'Finished'
                            : getAdvanceLabel(
                                session
                            )
                    )
                    .setEmoji(
                        '\uD83C\uDCCF'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    )
                    .setDisabled(
                        done
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `holdem_fold:${session.id}`
                    )
                    .setLabel(
                        'Fold'
                    )
                    .setEmoji(
                        '\u274C'
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    )
                    .setDisabled(
                        done
                    )
            )
    ];

}

function buildEmbed(
    interaction,
    session
) {

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
                    '/holdem',
                title:
                    session.done
                        ? 'Texas Hold\'em Result'
                        : 'Texas Hold\'em',
                description:
                    getResultText(
                        session
                    )
            }
        );

    embed.addFields(
        {
            name:
                '\uD83C\uDFB2 Stage',
            value:
                getStageLabel(
                    session
                ),
            inline:
                true
        },
        {
            name:
                `${emojis.coin} Max Risk`,
            value:
                `**${session.maxRisk} coins**`,
            inline:
                true
        },
        {
            name:
                `${emojis.coin} Committed`,
            value:
                `**${session.committed} coins**`,
            inline:
                true
        },
        {
            name:
                '\uD83C\uDFAF Board',
            value:
                formatCards(
                    session.board
                ),
            inline:
                false
        },
        {
            name:
                '\uD83D\uDC64 Your Cards',
            value:
                getPublicPlayerCards(
                    session
                ),
            inline:
                true
        },
        {
            name:
                '\uD83C\uDCA0 Dealer Cards',
            value:
                getPublicDealerCards(
                    session
                ),
            inline:
                true
        }
    );

    if (
        session.done
    )
        embed.addFields(
            {
                name:
                    '\uD83D\uDD0E Showdown',
                value:
                    `You: **${session.playerBest?.name ?? 'Folded'}**\nDealer: **${session.dealerBest?.name ?? 'Hidden'}**`,
                inline:
                    true
            },
            {
                name:
                    `${emojis.coin} Payout`,
                value:
                    `**${session.payout} coins**`,
                inline:
                    true
            }
        );
    else
        embed.addFields({
            name:
                `${emojis.coin} Next Street`,
            value:
                session.stage === 'river'
                    ? '**No extra bet**'
                    : `**${session.baseBet} coins**`,
            inline:
                true
        });

    return embed;

}

function buildPrivateEmbed(
    interaction,
    session
) {

    const embed =
        createUserEmbed(
            interaction,
            {
                color:
                    getRandomColor(),
                command:
                    '/holdem',
                title:
                    'Your Hold\'em Cards',
                description:
                    `Current stage: **${getStageLabel(
                        session
                    )}**`
            }
        );

    embed.addFields(
        {
            name:
                '\uD83D\uDC64 Hole Cards',
            value:
                formatCards(
                    session.playerHand
                ),
            inline:
                false
        },
        {
            name:
                '\uD83C\uDFAF Board',
            value:
                formatCards(
                    session.board
                ),
            inline:
                false
        }
    );

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
        outcome === 'win'
    )
        session.payout =
            session.committed * 2;
    else if (
        outcome === 'push' ||
        outcome === 'timeout'
    )
        session.payout =
            session.committed;
    else
        session.payout =
            0;

}

function commitStreet(
    session
) {

    session.committed +=
        session.baseBet;

}

function finishShowdown(
    session
) {

    session.playerBest =
        bestHand(
            [
                ...session.playerHand,
                ...session.board
            ]
        );

    session.dealerBest =
        bestHand(
            [
                ...session.dealerHand,
                ...session.board
            ]
        );

    const comparison =
        compareScores(
            session.playerBest.score,
            session.dealerBest.score
        );

    if (
        comparison > 0
    )
        settle(
            session,
            'win'
        );
    else if (
        comparison === 0
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

function advanceSession(
    session
) {

    if (
        session.stage === 'river'
    ) {

        finishShowdown(
            session
        );

        return;

    }

    commitStreet(
        session
    );

    if (
        session.stage === 'preflop'
    ) {

        session.board.push(
            draw(
                session
            ),
            draw(
                session
            ),
            draw(
                session
            )
        );

        session.stage =
            'flop';

        return;

    }

    session.board.push(
        draw(
            session
        )
    );

    session.stage =
        session.stage === 'flop'
            ? 'turn'
            : 'river';

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
    baseBet
) {

    const session = {
        baseBet,
        board: [],
        committed:
            baseBet,
        dealerHand: [],
        deck:
            shuffle(
                createDeck()
            ),
        done:
            false,
        id:
            `${userId}-${Date.now()}`,
        maxRisk:
            baseBet * STREETS,
        paid:
            false,
        payout:
            0,
        playerBest:
            null,
        playerHand: [],
        dealerBest:
            null,
        stage:
            'preflop',
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
                    'timeout'
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

async function replyNoSession(
    interaction
) {

    await interaction.reply({
        content:
            'This Hold\'em hand is no longer active. Any locked coins were already returned if the hand timed out.',
        flags:
            64
    });

}

async function replyWrongPlayer(
    interaction
) {

    await interaction.reply({
        content:
            'This Hold\'em hand belongs to someone else.',
        flags:
            64
    });

}

async function handleHoldemAction(
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

        await replyNoSession(
            interaction
        );

        return;

    }

    if (
        interaction.user.id !== session.userId
    ) {

        await replyWrongPlayer(
            interaction
        );

        return;

    }

    if (
        action === 'peek'
    ) {

        await interaction.reply({
            embeds: [
                buildPrivateEmbed(
                    interaction,
                    session
                )
            ],
            flags:
                64
        });

        return;

    }

    if (
        action === 'advance' &&
        session.stage !== 'river'
    ) {

        const spent =
            await spendCoins(
                session.userId,
                session.baseBet
            );

        if (
            !spent
        ) {

            await interaction.reply({
                content:
                    `You need ${emojis.coin} **${session.baseBet} coins** to keep playing this Hold'em hand. Fold or add coins first.`,
                flags:
                    64
            });

            return;

        }

    }

    await interaction.deferUpdate();

    if (
        action === 'fold'
    )
        settle(
            session,
            'fold'
        );
    else
        advanceSession(
            session
        );

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
    MAX_BET,
    STREETS,
    advanceSession,
    bestHand,
    buildEmbed,
    buildRows,
    compareScores,
    createSession,
    getActiveSession,
    handleHoldemAction,
    paySession,
    registerSession
};
