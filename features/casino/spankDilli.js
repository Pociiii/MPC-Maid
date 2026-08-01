const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const db =
    require('../../database/database');

const {
    createEmbed,
    getDisplayName
} = require('../../utils/embeds');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    addCoins,
    getOrCreateUser,
    spendCoins
} = require('../../utils/users');

const {
    maidFeedFlavor,
    pickOne
} = require('../../utils/flavorText');

const {
    incrementAchievementProgress,
    syncUserAchievementCounters
} = require('../achievements/achievements');

const {
    logError,
    logWarning
} = require('../../utils/inboxLogger');

const emojis =
    require('../../utils/emojis');

const COST =
    5;

const PRIZE_ADD =
    4;

const GIF_DURATION_MS =
    10000;

const spankDilliGifUrl =
    'https://cdn.discordapp.com/attachments/1519544070983258203/1519544182119862302/spank_dilli.webp?ex=6a3df14c&is=6a3c9fcc&hm=728ee19cd7e167b8f997af99b57c9fc2601c7499c954ddf84bf7a458d8f95598&';

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
                        ? reject(
                            error
                        )
                        : resolve(
                            row
                        )
            )
    );

}

function dbRun(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.run(
                sql,
                params,
                function onRun(
                    error
                ) {
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            this
                        );
                }
            )
    );

}

async function getState() {

    await dbRun(
        `INSERT OR IGNORE INTO spank_dilli_state (
            id,
            total_spanks,
            current_prize,
            last_win_amount
        ) VALUES (
            1,
            0,
            0,
            0
        )`
    );

    return dbGet(
        'SELECT * FROM spank_dilli_state WHERE id = 1'
    );

}

function getWinChance(
    prize
) {

    return Math.min(
        20,
        1 + Math.floor(
            Number(
                prize
            ) / 250
        )
    );

}

function getButtonRow() {

    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(
                    'spank_dilli'
                )
                .setLabel(
                    'Spank Dilli'
                )
                .setEmoji(
                    emojis.spank_given
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
        );

}

async function getPanelOwner(
    source
) {

    const guild =
        source.guild;

    if (
        !guild
    )
        return null;

    return guild.members.cache.get(
        guild.ownerId
    ) ??
        await guild.members.fetch(
            guild.ownerId
        ).catch(
            () => null
        );

}

function buildPanelEmbed(
    state,
    owner = null
) {

    const prize =
        Number(
            state.current_prize
        );

    const lastSpanker =
        state.last_spanker_id
            ? `<@${state.last_spanker_id}>`
            : 'Nobody yet';

    const lastWinner =
        state.last_winner_id
            ? `<@${state.last_winner_id}> won **${state.last_win_amount} coins**`
            : 'No winner yet';

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            authorName:
                owner?.displayName,
            authorIcon:
                owner?.user.displayAvatarURL(),
            title:
                'Spank Dilli',
            description:
                'Click the button, play the spank, and see if Dilli pays out.',
            footerText:
                'MPC Maid - Spank Dilli',
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                `${emojis.spank_given} Stats`,
            value:
`- Total spanks: **${Number(state.total_spanks).toLocaleString()}**
- Current prize: **${prize.toLocaleString()} coins**
- Win chance: **${getWinChance(prize)}%**`,
            inline:
                false
        },
        {
            name:
                '\uD83D\uDCCC Last',
            value:
`- Last spank from: ${lastSpanker}
- Last winner: ${lastWinner}`,
            inline:
                false
        },
        {
            name:
                `${emojis.coin} Rules`,
            value:
`- Cost: **${COST} coins**
- Adds **${PRIZE_ADD} coins** to the prize
- Plays a spank GIF for **10 sec**
- Each spank rolls for the current prize`,
            inline:
                false
        }
    );

    return embed;

}

async function updatePanel(
    interaction
) {

    return updatePanelMessage(
        interaction.message,
        interaction
    );

}

async function updatePanelMessage(
    message,
    source = message
) {

    const state =
        await getState();

    const owner =
        await getPanelOwner(
            source
        );

    await message.edit({
        embeds: [
            buildPanelEmbed(
                state,
                owner
            )
        ],
        components: [
            getButtonRow()
        ]
    }).catch(
        () => null
    );

}

async function getSpankDilliChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.SPANK_DILLI
    ) ??
        await client.channels.fetch(
            CHANNELS.SPANK_DILLI
        ).catch(
            () => null
        );

}

async function buildPanelMessage(
    source
) {

    const state =
        await getState();

    const owner =
        await getPanelOwner(
            source
        );

    return {
        embeds: [
            buildPanelEmbed(
                state,
                owner
            )
        ],
        components: [
            getButtonRow()
        ]
    };

}

async function findExistingPanel(
    channel,
    client
) {

    const messages =
        await channel.messages.fetch({
            limit:
                100
        }).catch(
            () => null
        );

    return messages?.find(
        (message) =>
            message.author?.id === client.user.id &&
            message.embeds?.some(
                (embed) =>
                    embed.title === 'Spank Dilli'
            ) &&
            message.components?.some(
                (row) =>
                    row.components?.some(
                        (component) =>
                            component.customId === 'spank_dilli'
                    )
            )
    ) ?? null;

}

async function ensurePersistentSpankDilliPanel(
    client
) {

    const channel =
        await getSpankDilliChannel(
            client
        );

    if (
        !channel?.messages?.fetch ||
        !channel?.send
    ) {

        void logWarning(
            client,
            {
                title:
                    'Spank Dilli Channel Missing',
                description:
                    `Could not use <#${CHANNELS.SPANK_DILLI}> for the Spank Dilli panel.`
            }
        );

        return null;

    }

    await dbRun(
        `INSERT OR IGNORE INTO spank_dilli_panel_settings (
            id,
            channel_id,
            updated_at
        ) VALUES (1, ?, ?)`,
        [
            CHANNELS.SPANK_DILLI,
            Date.now()
        ]
    );

    const settings =
        await dbGet(
            'SELECT * FROM spank_dilli_panel_settings WHERE id = 1'
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
        !message
    )
        message =
            await findExistingPanel(
                channel,
                client
            );

    const payload =
        await buildPanelMessage(
            channel
        );

    if (
        message
    )
        await message.edit(
            payload
        );
    else
        message =
            await channel.send(
                payload
            );

    await dbRun(
        `UPDATE spank_dilli_panel_settings
         SET channel_id = ?, message_id = ?, updated_at = ?
         WHERE id = 1`,
        [
            CHANNELS.SPANK_DILLI,
            message.id,
            Date.now()
        ]
    );

    return message;

}

async function startSpankDilliPanel(
    client
) {

    try {

        return await ensurePersistentSpankDilliPanel(
            client
        );

    }
    catch (error) {

        void logError(
            client,
            {
                title:
                    'Spank Dilli Panel Startup Failed',
                error,
                fields: [
                    {
                        name:
                            '📍 Channel',
                        value:
                            `<#${CHANNELS.SPANK_DILLI}>`,
                        inline:
                            true
                    }
                ]
            }
        );

        return null;

    }

}

function wait(
    ms
) {

    return new Promise(
        (resolve) =>
            setTimeout(
                resolve,
                ms
            )
    );

}

async function deleteMessageAfter(
    message,
    delayMs
) {

    await wait(
        delayMs
    );

    await message.delete()
        .catch(
            () => null
        );

}

async function announceWinner(
    interaction,
    prize
) {

    const channel =
        interaction.client.channels.cache.get(
            CHANNELS.MAID_FEED
        ) ??
        await interaction.client.channels.fetch(
            CHANNELS.MAID_FEED
        ).catch(
            () => null
        );

    if (
        !channel?.send
    )
        return;

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            authorName:
                getDisplayName(
                    interaction.member ??
                    interaction.user
                ),
            authorIcon:
                interaction.user.displayAvatarURL(),
            thumbnail:
                interaction.user.displayAvatarURL(),
            title:
                `${emojis.spank_given} Spank Dilli Winner`,
            description:
                `<@${interaction.user.id}> won the Spank Dilli prize!\n${pickOne(
                    maidFeedFlavor.spankDilli
                )}`,
            footerText:
                'MPC Maid - Spank Dilli',
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                `${emojis.coin} Prize`,
            value:
                `**${Number(
                    prize
                ).toLocaleString()} coins**`,
            inline:
                true
        },
        {
            name:
                '\uD83D\uDCCD Where',
            value:
                interaction.channelId
                    ? `<#${interaction.channelId}>`
                    : 'Spank Dilli',
            inline:
                true
        }
    );

    await channel.send({
        content:
            `<@${interaction.user.id}>`,
        embeds: [
            embed
        ],
        allowedMentions: {
            users: [
                interaction.user.id
            ]
        }
    }).catch(
        () => null
    );

}

async function handleSpankDilli(
    interaction
) {

    const user =
        await getOrCreateUser(
            interaction.user.id
        );

    if (
        user.coins < COST
    ) {

        await interaction.reply({
            content:
                `You need ${emojis.coin} **${COST} coins** to spank Dilli. You have **${user.coins}**.`,
            flags:
                64
        });

        return;

    }

    const spent =
        await spendCoins(
            interaction.user.id,
            COST
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
                `You need ${emojis.coin} **${COST} coins** to spank Dilli. You have **${currentUser.coins}**.`,
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    await incrementAchievementProgress(
        interaction.client,
        interaction.user.id,
        'spank_dilli_spanks'
    );

    const previousState =
        await getState();

    const prizeAfterSpank =
        Number(
            previousState.current_prize
        ) + PRIZE_ADD;

    const winChance =
        getWinChance(
            prizeAfterSpank
        );

    const won =
        Math.random() * 100 < winChance;

    if (
        won
    ) {

        await addCoins(
            interaction.user.id,
            prizeAfterSpank,
            {
                source:
                    'spank_dilli'
            }
        );

        await syncUserAchievementCounters(
            interaction.client,
            interaction.user.id,
            [
                'wallet_coins'
            ]
        );

    }

    await dbRun(
        `UPDATE spank_dilli_state
         SET total_spanks = total_spanks + 1,
             current_prize = ?,
             last_spanker_id = ?,
             last_winner_id = CASE WHEN ? THEN ? ELSE last_winner_id END,
             last_win_amount = CASE WHEN ? THEN ? ELSE last_win_amount END,
             last_win_at = CASE WHEN ? THEN ? ELSE last_win_at END
         WHERE id = 1`,
        [
            won
                ? 0
                : prizeAfterSpank,
            interaction.user.id,
            won
                ? 1
                : 0,
            interaction.user.id,
            won
                ? 1
                : 0,
            prizeAfterSpank,
            won
                ? 1
                : 0,
            new Date()
                .toISOString()
        ]
    );

    await updatePanel(
        interaction
    );

    const message =
        await interaction.channel.send({
            content:
                `${emojis.spank_given} Spank from <@${interaction.user.id}>`,
            embeds: [
                createEmbed({
                    color:
                        getRandomColor(),
                    image:
                        spankDilliGifUrl
                })
            ]
        }).catch(
            () => null
        );

    if (
        won
    ) {

        await announceWinner(
            interaction,
            prizeAfterSpank
        );

    }

    if (
        message
    )
        void deleteMessageAfter(
            message,
            GIF_DURATION_MS
        );

}

module.exports = {
    buildPanelMessage,
    buildPanelEmbed,
    ensurePersistentSpankDilliPanel,
    getButtonRow,
    getPanelOwner,
    getState,
    handleSpankDilli,
    startSpankDilliPanel
};
