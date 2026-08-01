const {
    randomInt
} = require('node:crypto');

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const db =
    require('../../database/database');

const {
    CHANNELS,
    ECONOMY,
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getCoinIncomeDate
} = require('../../utils/coinIncome');

const {
    commandFooter
} = require('../../utils/version');

const {
    logBotEvent,
    logError,
    logWarning
} = require('../../utils/inboxLogger');

const DRAW_TIME_ZONE =
    'Europe/Rome';

const CHECK_INTERVAL_MS =
    60 * 1000;

const UPDATE_DEBOUNCE_MS =
    1500;

let transactionTail =
    Promise.resolve();

let schedulerTimer =
    null;

let schedulerRunning =
    false;

let pendingPanelUpdate =
    null;

function dbRun(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.run(
                sql,
                params,
                function onRun(error) {
                    error
                        ? reject(error)
                        : resolve({
                            changes: this.changes,
                            lastID: this.lastID
                        });
                }
            )
    );

}

function dbGet(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.get(
                sql,
                params,
                (error, row) =>
                    error
                        ? reject(error)
                        : resolve(row)
            )
    );

}

function dbAll(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.all(
                sql,
                params,
                (error, rows) =>
                    error
                        ? reject(error)
                        : resolve(rows)
            )
    );

}

function withImmediateTransaction(
    work
) {

    const execute = async () => {

        await dbRun(
            'BEGIN IMMEDIATE'
        );

        try {

            const result =
                await work();

            await dbRun(
                'COMMIT'
            );

            return result;

        }
        catch (error) {

            await dbRun(
                'ROLLBACK'
            ).catch(
                () => null
            );

            throw error;

        }

    };

    const queued =
        transactionTail.then(
            execute,
            execute
        );

    transactionTail =
        queued.catch(
            () => null
        );

    return queued;

}

function getRomeParts(
    date
) {

    const parts =
        new Intl.DateTimeFormat(
            'en-US',
            {
                timeZone: DRAW_TIME_ZONE,
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23'
            }
        ).formatToParts(
            date
        );

    return Object.fromEntries(
        parts.map(
            (part) => [
                part.type,
                part.value
            ]
        )
    );

}

function getNextLotteryDrawDate(
    from = new Date()
) {

    const firstMinute =
        Math.floor(
            from.getTime() / 60000
        ) * 60000 + 60000;

    for (
        let offset = 0;
        offset <= 8 * 24 * 60;
        offset += 1
    ) {

        const candidate =
            new Date(
                firstMinute + offset * 60000
            );

        const parts =
            getRomeParts(
                candidate
            );

        if (
            parts.weekday === 'Sun' &&
            parts.hour === '21' &&
            parts.minute === '00'
        )
            return candidate;

    }

    throw new Error(
        'Could not calculate the next Europe/Rome lottery draw.'
    );

}

function calculateJackpot(
    lottery
) {

    return Number(
        lottery.base_prize
    ) + Math.floor(
        Number(
            lottery.total_ticket_revenue
        ) * Number(
            lottery.jackpot_percentage
        ) / 100
    );

}

function formatCoins(
    amount
) {

    return Number(
        amount ?? 0
    ).toLocaleString(
        'en-US'
    );

}

function formatTicketNumber(
    number
) {

    return `#${String(
        number
    ).padStart(
        4,
        '0'
    )}`;

}

async function createNextLottery(
    now = Date.now()
) {

    const drawsAt =
        getNextLotteryDrawDate(
            new Date(now)
        ).getTime();

    const inserted =
        await dbRun(
            `INSERT INTO lotteries (
                status,
                ticket_price,
                max_tickets_per_user,
                base_prize,
                jackpot_percentage,
                opens_at,
                draws_at,
                created_at
            ) VALUES ('OPEN', ?, ?, ?, ?, ?, ?, ?)`,
            [
                ECONOMY.LOTTERY_TICKET_PRICE,
                ECONOMY.LOTTERY_MAX_TICKETS_PER_USER,
                ECONOMY.LOTTERY_BASE_PRIZE,
                ECONOMY.LOTTERY_JACKPOT_PERCENTAGE,
                now,
                drawsAt,
                now
            ]
        );

    return dbGet(
        'SELECT * FROM lotteries WHERE id = ?',
        [
            inserted.lastID
        ]
    );

}

async function getActiveLottery() {

    return dbGet(
        `SELECT *
         FROM lotteries
         WHERE status IN ('OPEN', 'DRAWING')
         ORDER BY id DESC
         LIMIT 1`
    );

}

async function ensureActiveLottery() {

    return withImmediateTransaction(
        async () => {

            const active =
                await getActiveLottery();

            if (
                active
            )
                return active;

            return createNextLottery();

        }
    );

}

async function getLotterySummary() {

    const lottery =
        await ensureActiveLottery();

    const counts =
        await dbGet(
            `SELECT COUNT(*) AS total_tickets,
                    COUNT(DISTINCT user_id) AS participants
             FROM lottery_tickets
             WHERE lottery_id = ?`,
            [
                lottery.id
            ]
        );

    const previous =
        await dbGet(
            `SELECT winner_id, final_prize
             FROM lotteries
             WHERE status IN ('CLOSED', 'NO WINNER')
             AND id < ?
             ORDER BY id DESC
             LIMIT 1`,
            [
                lottery.id
            ]
        );

    return {
        ...lottery,
        totalTickets:
            Number(counts?.total_tickets ?? 0),
        participantCount:
            Number(counts?.participants ?? 0),
        jackpot:
            calculateJackpot(lottery),
        lastWinnerId:
            previous?.winner_id ?? null,
        lastPrize:
            Number(previous?.final_prize ?? 0)
    };

}

async function getUserLotterySummary(
    userId
) {

    const summary =
        await getLotterySummary();

    await dbRun(
        'INSERT OR IGNORE INTO users (id) VALUES (?)',
        [
            userId
        ]
    );

    const [
        user,
        tickets
    ] = await Promise.all([
        dbGet(
            'SELECT coins FROM users WHERE id = ?',
            [
                userId
            ]
        ),
        dbGet(
            `SELECT COUNT(*) AS count
             FROM lottery_tickets
             WHERE lottery_id = ? AND user_id = ?`,
            [
                summary.id,
                userId
            ]
        )
    ]);

    return {
        ...summary,
        balance:
            Number(user?.coins ?? 0),
        userTickets:
            Number(tickets?.count ?? 0)
    };

}

function formatChance(
    userTickets,
    totalTickets
) {

    if (
        totalTickets <= 0
    )
        return '0.00%';

    const chance =
        userTickets / totalTickets * 100;

    if (
        chance < 1
    )
        return `${chance.toFixed(2)}%`;

    if (
        chance <= 10
    )
        return `${chance.toFixed(2).replace(/0$/, '')}%`;

    return `${chance.toFixed(1)}%`;

}

function buildPublicComponents() {

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        'lottery_open_shop'
                    )
                    .setLabel(
                        'Buy Tickets'
                    )
                    .setEmoji(
                        '🎟️'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        'lottery_rules'
                    )
                    .setLabel(
                        'How It Works'
                    )
                    .setEmoji(
                        '📖'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
            )
    ];

}

function buildShopComponents(
    summary
) {

    const disabled =
        summary.status !== 'OPEN' ||
        summary.userTickets >= summary.max_tickets_per_user;

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lottery_buy_1')
                    .setLabel('Buy 1')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('lottery_buy_5')
                    .setLabel('Buy 5')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('lottery_buy_max')
                    .setLabel('Buy Maximum')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(disabled)
            ),
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lottery_view_tickets')
                    .setLabel('My Ticket Numbers')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('lottery_refresh')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Secondary)
            )
    ];

}

function buildPublicEmbed(
    summary
) {

    const drawUnix =
        Math.floor(
            summary.draws_at / 1000
        );

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                '🎟️ MPC Weekly Lottery',
            description:
                'Buy tickets for a chance to take home the weekly jackpot.',
            footerText:
                'MPC Maid • Weekly Lottery',
            timestamp:
                true
        });

    embed.addFields(
        {
            name: '💰 Current Jackpot',
            value: `**${formatCoins(summary.jackpot)} coins**`,
            inline: true
        },
        {
            name: '🎫 Tickets Sold',
            value: formatCoins(summary.totalTickets),
            inline: true
        },
        {
            name: '👥 Participants',
            value: `${formatCoins(summary.participantCount)} members`,
            inline: true
        },
        {
            name: '🪙 Ticket Price',
            value: `${formatCoins(summary.ticket_price)} coins`,
            inline: true
        },
        {
            name: '🎟️ Maximum Tickets',
            value: `${summary.max_tickets_per_user} per member`,
            inline: true
        },
        {
            name: '🟢 Status',
            value: `**${summary.status}**`,
            inline: true
        },
        {
            name: '📅 Next Draw',
            value: `<t:${drawUnix}:F>\n<t:${drawUnix}:R>`,
            inline: false
        },
        {
            name: '🏆 Last Winner',
            value: summary.lastWinnerId
                ? `<@${summary.lastWinnerId}>`
                : 'No previous winner',
            inline: true
        },
        {
            name: '💸 Last Prize',
            value: summary.lastPrize
                ? `${formatCoins(summary.lastPrize)} coins`
                : 'None yet',
            inline: true
        }
    );

    return embed;

}

function buildPrivatePayload(
    summary,
    notice = null
) {

    const drawUnix =
        Math.floor(
            summary.draws_at / 1000
        );

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                '🎟️ Your Lottery Tickets',
            description:
                notice ??
                'Your chance changes whenever other members buy tickets.',
            footerText:
                commandFooter('/lottery'),
            timestamp:
                true
        });

    embed.addFields(
        {
            name: '💰 Balance',
            value: `${formatCoins(summary.balance)} coins`,
            inline: true
        },
        {
            name: '🪙 Ticket Price',
            value: `${formatCoins(summary.ticket_price)} coins`,
            inline: true
        },
        {
            name: '🎫 Your Tickets',
            value: `${summary.userTickets} / ${summary.max_tickets_per_user}`,
            inline: true
        },
        {
            name: '📊 Current Chance',
            value: formatChance(
                summary.userTickets,
                summary.totalTickets
            ),
            inline: true
        },
        {
            name: '💎 Current Jackpot',
            value: `${formatCoins(summary.jackpot)} coins`,
            inline: true
        },
        {
            name: '🟢 Status',
            value: summary.status,
            inline: true
        },
        {
            name: '📅 Draw',
            value: `<t:${drawUnix}:F>\n<t:${drawUnix}:R>`,
            inline: false
        }
    );

    return {
        embeds: [
            embed
        ],
        components:
            buildShopComponents(summary)
    };

}

async function buyLotteryTickets(
    userId,
    requested
) {

    return withImmediateTransaction(
        async () => {

            const lottery =
                await getActiveLottery();

            if (
                !lottery
            )
                return {
                    ok: false,
                    reason: 'No active lottery exists.'
                };

            if (
                lottery.status !== 'OPEN'
            )
                return {
                    ok: false,
                    reason: lottery.status === 'DRAWING'
                        ? 'The lottery is currently drawing.'
                        : 'The lottery is closed.'
                };

            if (
                lottery.draws_at <= Date.now()
            )
                return {
                    ok: false,
                    reason: 'Ticket sales are locked while the draw is processed.'
                };

            await dbRun(
                'INSERT OR IGNORE INTO users (id) VALUES (?)',
                [
                    userId
                ]
            );

            const user =
                await dbGet(
                    'SELECT coins FROM users WHERE id = ?',
                    [
                        userId
                    ]
                );

            const owned =
                await dbGet(
                    `SELECT COUNT(*) AS count
                     FROM lottery_tickets
                     WHERE lottery_id = ? AND user_id = ?`,
                    [
                        lottery.id,
                        userId
                    ]
                );

            const currentTickets =
                Number(owned.count);

            const remaining =
                lottery.max_tickets_per_user - currentTickets;

            const affordable =
                Math.floor(
                    Number(user.coins) / lottery.ticket_price
                );

            const desired =
                requested === 'max'
                    ? Number.MAX_SAFE_INTEGER
                    : Math.max(
                        0,
                        Number(requested) || 0
                    );

            const quantity =
                Math.min(
                    desired,
                    remaining,
                    affordable
                );

            if (
                quantity <= 0
            ) {

                let reason =
                    'You cannot buy any tickets right now.';

                if (
                    remaining <= 0
                )
                    reason = 'You have reached the weekly ticket limit.';
                else if (
                    affordable <= 0
                )
                    reason = `You need at least ${formatCoins(lottery.ticket_price)} coins for a ticket.`;

                return {
                    ok: false,
                    reason
                };

            }

            const cost =
                quantity * lottery.ticket_price;

            const deduction =
                await dbRun(
                    `UPDATE users
                     SET coins = coins - ?
                     WHERE id = ? AND coins >= ?`,
                    [
                        cost,
                        userId,
                        cost
                    ]
                );

            if (
                deduction.changes !== 1
            )
                throw new Error(
                    'Lottery balance deduction was rejected.'
                );

            const highest =
                await dbGet(
                    `SELECT COALESCE(MAX(ticket_number), 0) AS number
                     FROM lottery_tickets
                     WHERE lottery_id = ?`,
                    [
                        lottery.id
                    ]
                );

            const purchasedAt =
                Date.now();

            const numbers = [];

            for (
                let index = 1;
                index <= quantity;
                index += 1
            ) {

                const number =
                    Number(highest.number) + index;

                await dbRun(
                    `INSERT INTO lottery_tickets (
                        lottery_id,
                        user_id,
                        ticket_number,
                        purchased_at
                    ) VALUES (?, ?, ?, ?)`,
                    [
                        lottery.id,
                        userId,
                        number,
                        purchasedAt
                    ]
                );

                numbers.push(
                    number
                );

            }

            await dbRun(
                `UPDATE lotteries
                 SET total_ticket_revenue = total_ticket_revenue + ?
                 WHERE id = ? AND status = 'OPEN'`,
                [
                    cost,
                    lottery.id
                ]
            );

            return {
                ok: true,
                lotteryId: lottery.id,
                quantity,
                cost,
                numbers,
                requested,
                totalOwned: currentTickets + quantity
            };

        }
    );

}

async function getUserTicketNumbers(
    userId
) {

    const lottery =
        await ensureActiveLottery();

    return dbAll(
        `SELECT ticket_number
         FROM lottery_tickets
         WHERE lottery_id = ? AND user_id = ?
         ORDER BY ticket_number`,
        [
            lottery.id,
            userId
        ]
    );

}

async function getLotteryChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.LOTTERY
    ) ??
        await client.channels.fetch(
            CHANNELS.LOTTERY
        ).catch(
            () => null
        );

}

async function ensurePersistentLotteryMessage(
    client
) {

    const channel =
        await getLotteryChannel(
            client
        );

    if (
        !channel?.messages?.fetch ||
        !channel?.send
    ) {

        void logWarning(
            client,
            {
                title: 'Lottery Channel Missing',
                description: `Could not use <#${CHANNELS.LOTTERY}> for the lottery panel.`
            }
        );

        return null;

    }

    await dbRun(
        `INSERT OR IGNORE INTO lottery_settings (
            id,
            channel_id,
            updated_at
        ) VALUES (1, ?, ?)`,
        [
            CHANNELS.LOTTERY,
            Date.now()
        ]
    );

    const settings =
        await dbGet(
            'SELECT * FROM lottery_settings WHERE id = 1'
        );

    let message =
        settings?.message_id
            ? await channel.messages.fetch(
                settings.message_id
            ).catch(
                () => null
            )
            : null;

    if (
        message
    )
        return message;

    const summary =
        await getLotterySummary();

    message =
        await channel.send({
            embeds: [
                buildPublicEmbed(summary)
            ],
            components:
                buildPublicComponents()
        });

    await dbRun(
        `UPDATE lottery_settings
         SET channel_id = ?, message_id = ?, updated_at = ?
         WHERE id = 1`,
        [
            CHANNELS.LOTTERY,
            message.id,
            Date.now()
        ]
    );

    return message;

}

async function updatePersistentLotteryMessage(
    client
) {

    const message =
        await ensurePersistentLotteryMessage(
            client
        );

    if (
        !message?.edit
    )
        return false;

    const summary =
        await getLotterySummary();

    await message.edit({
        embeds: [
            buildPublicEmbed(summary)
        ],
        components:
            buildPublicComponents()
    });

    return true;

}

function queuePersistentLotteryUpdate(
    client
) {

    if (
        pendingPanelUpdate
    )
        clearTimeout(
            pendingPanelUpdate
        );

    pendingPanelUpdate =
        setTimeout(
            () => {

                pendingPanelUpdate =
                    null;

                void updatePersistentLotteryMessage(
                    client
                ).catch(
                    (error) =>
                        logError(
                            client,
                            {
                                title: 'Lottery Panel Update Failed',
                                error
                            }
                        )
                );

            },
            UPDATE_DEBOUNCE_MS
        );

}

async function announceDraw(
    client,
    result
) {

    const channel =
        client.channels.cache.get(
            CHANNELS.MAID_FEED
        ) ??
        await client.channels.fetch(
            CHANNELS.MAID_FEED
        ).catch(
            () => null
        );

    if (
        !channel?.send
    )
        throw new Error(
            'The Maid Feed channel is unavailable.'
        );

    if (
        !result.winnerId
    ) {

        await channel.send({
            embeds: [
                createEmbed({
                    color: getRandomColor(),
                    title: '🎰 Weekly Lottery',
                    description: 'No tickets were sold this week. A new lottery is now open.',
                    footerText: 'MPC Maid • Weekly Lottery',
                    timestamp: true
                })
            ]
        });

        return;

    }

    const embed =
        createEmbed({
            color: getRandomColor(),
            title: '🎰 Weekly Lottery Winner',
            description: `Congratulations, <@${result.winnerId}>!\n\nYour ticket **${formatTicketNumber(result.winningTicket)}** was selected.`,
            footerText: 'A new weekly lottery is now open.',
            timestamp: true
        });

    embed.addFields(
        {
            name: '💰 Prize',
            value: `**${formatCoins(result.prize)} MPC Coins**`,
            inline: true
        },
        {
            name: '🎫 Tickets Sold',
            value: formatCoins(result.totalTickets),
            inline: true
        },
        {
            name: '👥 Participants',
            value: formatCoins(result.participantCount),
            inline: true
        }
    );

    await channel.send({
        content: `<@${result.winnerId}>`,
        embeds: [
            embed
        ],
        allowedMentions: {
            users: [
                result.winnerId
            ]
        }
    });

}

async function drawCurrentLottery(
    client,
    {
        force = false
    } = {}
) {

    const candidate =
        await getActiveLottery();

    if (
        !candidate ||
        candidate.status !== 'OPEN'
    )
        return {
            ok: false,
            reason: 'No open lottery is available to draw.'
        };

    const result =
        await withImmediateTransaction(
            async () => {

                const lottery =
                    await dbGet(
                        'SELECT * FROM lotteries WHERE id = ?',
                        [
                            candidate.id
                        ]
                    );

                if (
                    !lottery ||
                    lottery.status !== 'OPEN'
                )
                    return {
                        ok: false,
                        reason: 'No open lottery is available to draw.'
                    };

                if (
                    !force &&
                    lottery.draws_at > Date.now()
                )
                    return {
                        ok: false,
                        reason: 'The current lottery is not due yet.'
                    };

                const locked =
                    await dbRun(
                        `UPDATE lotteries
                         SET status = 'DRAWING'
                         WHERE id = ? AND status = 'OPEN'`,
                        [
                            lottery.id
                        ]
                    );

                if (
                    locked.changes !== 1
                )
                    return {
                        ok: false,
                        reason: 'This lottery is already being drawn.'
                    };

                const tickets =
                    await dbAll(
                        `SELECT id, user_id, ticket_number
                         FROM lottery_tickets
                         WHERE lottery_id = ?
                         ORDER BY id`,
                        [
                            lottery.id
                        ]
                    );

                const participant =
                    await dbGet(
                        `SELECT COUNT(DISTINCT user_id) AS count
                         FROM lottery_tickets
                         WHERE lottery_id = ?`,
                        [
                            lottery.id
                        ]
                    );

                const completedAt =
                    Date.now();

                let winner =
                    null;

                let prize =
                    0;

                if (
                    tickets.length
                ) {

                    winner =
                        tickets[
                            randomInt(
                                0,
                                tickets.length
                            )
                        ];

                    prize =
                        calculateJackpot(lottery);

                    await dbRun(
                        'INSERT OR IGNORE INTO users (id) VALUES (?)',
                        [
                            winner.user_id
                        ]
                    );

                    await dbRun(
                        'UPDATE users SET coins = coins + ? WHERE id = ?',
                        [
                            prize,
                            winner.user_id
                        ]
                    );

                    await dbRun(
                        `INSERT INTO user_coin_income (
                            user_id, income_date, source, amount, updated_at
                         ) VALUES (?, ?, 'lottery_prize', ?, ?)
                         ON CONFLICT(user_id, income_date, source)
                         DO UPDATE SET
                            amount = amount + excluded.amount,
                            updated_at = excluded.updated_at`,
                        [
                            winner.user_id,
                            getCoinIncomeDate(),
                            prize,
                            completedAt
                        ]
                    );

                }

                await dbRun(
                    `UPDATE lotteries
                     SET status = ?,
                         winner_id = ?,
                         winning_ticket_id = ?,
                         final_prize = ?,
                         completed_at = ?
                     WHERE id = ? AND status = 'DRAWING'`,
                    [
                        winner
                            ? 'CLOSED'
                            : 'NO WINNER',
                        winner?.user_id ?? null,
                        winner?.id ?? null,
                        prize,
                        completedAt,
                        lottery.id
                    ]
                );

                await createNextLottery(
                    completedAt
                );

                return {
                    ok: true,
                    lotteryId: lottery.id,
                    winnerId: winner?.user_id ?? null,
                    winningTicket: winner?.ticket_number ?? null,
                    prize,
                    totalTickets: tickets.length,
                    participantCount: Number(participant?.count ?? 0)
                };

            }
        );

    if (
        !result.ok
    )
        return result;

    void logBotEvent(
        client,
        {
            title: result.winnerId
                ? 'Lottery Winner Selected'
                : 'Lottery Completed Without Tickets',
            fields: [
                {
                    name: '🎟️ Lottery',
                    value: String(result.lotteryId),
                    inline: true
                },
                {
                    name: '🏆 Winner',
                    value: result.winnerId
                        ? `<@${result.winnerId}>`
                        : 'No winner',
                    inline: true
                },
                {
                    name: '💰 Prize',
                    value: `${formatCoins(result.prize)} coins`,
                    inline: true
                }
            ]
        }
    );

    try {

        await announceDraw(
            client,
            result
        );

    }
    catch (error) {

        void logError(
            client,
            {
                title: 'Lottery Announcement Failed',
                error,
                fields: [
                    {
                        name: '🎟️ Lottery',
                        value: String(result.lotteryId),
                        inline: true
                    }
                ]
            }
        );

    }

    await updatePersistentLotteryMessage(
        client
    ).catch(
        (error) =>
            logError(
                client,
                {
                    title: 'Lottery Panel Update Failed After Draw',
                    error
                }
            )
    );

    return result;

}

async function checkLotterySchedule(
    client
) {

    if (
        schedulerRunning
    )
        return;

    schedulerRunning =
        true;

    try {

        const lottery =
            await ensureActiveLottery();

        if (
            lottery.status === 'OPEN' &&
            lottery.draws_at <= Date.now()
        )
            await drawCurrentLottery(
                client
            );

    }
    catch (error) {

        void logError(
            client,
            {
                title: 'Lottery Scheduler Failed',
                error
            }
        );

    }
    finally {

        schedulerRunning =
            false;

    }

}

async function startLotteryScheduler(
    client
) {

    await db.ready;

    const startupLottery =
        await ensureActiveLottery();

    if (
        startupLottery.status === 'OPEN' &&
        startupLottery.draws_at <= Date.now()
    )
        void logBotEvent(
            client,
            {
                title: 'Overdue Lottery Recovered',
                description: `Lottery **#${startupLottery.id}** was overdue at startup and will be drawn now.`
            }
        );

    await checkLotterySchedule(
        client
    );

    await updatePersistentLotteryMessage(
        client
    );

    if (
        schedulerTimer
    )
        clearInterval(
            schedulerTimer
        );

    schedulerTimer =
        setInterval(
            () =>
                void checkLotterySchedule(
                    client
                ),
            CHECK_INTERVAL_MS
        );

}

async function showLotteryShop(
    interaction,
    edit = false,
    notice = null
) {

    const summary =
        await getUserLotterySummary(
            interaction.user.id
        );

    const payload =
        buildPrivatePayload(
            summary,
            notice
        );

    if (
        edit
    )
        await interaction.editReply(
            payload
        );
    else
        await interaction.reply({
            ...payload,
            flags: 64
        });

}

async function handleLotteryButton(
    interaction
) {

    const action =
        interaction.customId;

    if (
        action === 'lottery_open_shop'
    ) {

        await showLotteryShop(
            interaction
        );

        return;

    }

    if (
        action === 'lottery_rules'
    ) {

        const embed =
            createEmbed({
                color: getRandomColor(),
                title: '📖 How the Weekly Lottery Works',
                description: `• Each ticket costs **${formatCoins(ECONOMY.LOTTERY_TICKET_PRICE)} coins**.
• You can buy up to **${ECONOMY.LOTTERY_MAX_TICKETS_PER_USER} tickets** each week.
• Every ticket gives you one chance to win.
• **${ECONOMY.LOTTERY_JACKPOT_PERCENTAGE}%** of sales grows the jackpot; the rest leaves the economy.
• One ticket is selected every Sunday at **9:00 PM Europe/Rome**.
• Tickets cannot be refunded or transferred.
• A new lottery opens after every draw.`,
                footerText: commandFooter('/lottery'),
                timestamp: true
            });

        await interaction.reply({
            embeds: [
                embed
            ],
            flags: 64
        });

        return;

    }

    if (
        action === 'lottery_view_tickets'
    ) {

        const tickets =
            await getUserTicketNumbers(
                interaction.user.id
            );

        const description =
            tickets.length
                ? tickets.map(
                    (ticket) =>
                        formatTicketNumber(
                            ticket.ticket_number
                        )
                ).join(', ')
                : 'You do not own any tickets in the current lottery.';

        await interaction.reply({
            embeds: [
                createEmbed({
                    color: getRandomColor(),
                    title: '🎟️ Your Active Tickets',
                    description,
                    footerText: commandFooter('/lottery'),
                    timestamp: true
                })
            ],
            flags: 64
        });

        return;

    }

    await interaction.deferUpdate();

    if (
        action === 'lottery_refresh'
    ) {

        await showLotteryShop(
            interaction,
            true
        );

        return;

    }

    const requested =
        action === 'lottery_buy_1'
            ? 1
            : action === 'lottery_buy_5'
                ? 5
                : 'max';

    let purchase;

    try {

        purchase =
            await buyLotteryTickets(
                interaction.user.id,
                requested
            );

    }
    catch (error) {

        void logError(
            interaction.client,
            {
                title: 'Lottery Purchase Transaction Failed',
                error,
                fields: [
                    {
                        name: '👤 User',
                        value: interaction.user.id,
                        inline: true
                    }
                ]
            }
        );

        await showLotteryShop(
            interaction,
            true,
            '❌ The purchase could not be completed. Your coins were not charged.'
        );

        return;

    }

    const notice =
        purchase.ok
            ? `✅ You bought **${purchase.quantity} ticket${purchase.quantity === 1 ? '' : 's'}** for **${formatCoins(purchase.cost)} coins**.\n\nYou now own **${purchase.totalOwned} tickets**.${requested !== 'max' && purchase.quantity < requested ? ` Only ${purchase.quantity} could be purchased.` : ''}`
            : `❌ ${purchase.reason}`;

    await showLotteryShop(
        interaction,
        true,
        notice
    );

    if (
        purchase.ok
    ) {

        queuePersistentLotteryUpdate(
            interaction.client
        );

        void logBotEvent(
            interaction.client,
            {
                title: 'Lottery Tickets Purchased',
                threadId: CHANNELS.MAID_FEED,
                fields: [
                    {
                        name: '👤 User',
                        value: `<@${interaction.user.id}>`,
                        inline: true
                    },
                    {
                        name: '🎟️ Lottery',
                        value: String(purchase.lotteryId),
                        inline: true
                    },
                    {
                        name: '🎫 Tickets',
                        value: `${purchase.quantity} for ${formatCoins(purchase.cost)} coins`,
                        inline: true
                    }
                ]
            }
        );

    }

}

async function getAdminStatus() {

    const summary =
        await getLotterySummary();

    const settings =
        await dbGet(
            'SELECT * FROM lottery_settings WHERE id = 1'
        );

    return {
        summary,
        messageId:
            settings?.message_id ?? 'Not created',
        schedulerActive:
            Boolean(schedulerTimer)
    };

}

module.exports = {
    buildPrivatePayload,
    buyLotteryTickets,
    calculateJackpot,
    checkLotterySchedule,
    drawCurrentLottery,
    ensurePersistentLotteryMessage,
    formatTicketNumber,
    getActiveLottery,
    getAdminStatus,
    getLotterySummary,
    getNextLotteryDrawDate,
    getUserLotterySummary,
    getUserTicketNumbers,
    handleLotteryButton,
    showLotteryShop,
    startLotteryScheduler,
    updatePersistentLotteryMessage
};
