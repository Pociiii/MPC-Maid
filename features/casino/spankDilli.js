const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const db =
    require('../../database/database');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    addCoins,
    getOrCreateUser,
    removeCoins
} = require('../../utils/users');

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

const queue = [];

let playing =
    false;

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
                'Click the button, join the queue, and see if Dilli pays out.',
            footerText:
                '/spankdilli',
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                `${emojis.spank_given} Stats`,
            value:
`Total spanks: **${Number(state.total_spanks).toLocaleString()}**
Queue: **${queue.length}**
Current prize: **${prize.toLocaleString()} coins**
Win chance: **${getWinChance(prize)}%**`,
            inline:
                false
        },
        {
            name:
                'Last',
            value:
`Last spank from: ${lastSpanker}
Last winner: ${lastWinner}`,
            inline:
                false
        },
        {
            name:
                `${emojis.coin} Rules`,
            value:
`Cost: **${COST} coins**
Adds **${PRIZE_ADD} coins** to the prize
Plays a spank GIF for **10 sec**
Each spank rolls for the current prize`,
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
                interaction.member?.displayName ??
                interaction.user.displayName,
            authorIcon:
                interaction.user.displayAvatarURL(),
            thumbnail:
                interaction.user.displayAvatarURL(),
            title:
                `${emojis.spank_given} Spank Dilli Winner`,
            description:
                `<@${interaction.user.id}> won the Spank Dilli prize!`,
            footerText:
                '/spankdilli',
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
                'Where',
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
            `<@${interaction.user.id}> won Spank Dilli!`,
        embeds: [
            embed
        ]
    }).catch(
        () => null
    );

}

async function processQueue() {

    if (
        playing
    )
        return;

    playing =
        true;

    while (
        queue.length > 0
    ) {

        const item =
            queue.shift();

        await updatePanelMessage(
            item.panelMessage,
            item.source
        );

        const message =
            await item.channel.send({
                content:
                    `${emojis.spank_given} Spank from <@${item.userId}>`,
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
            message
        ) {

            await wait(
                GIF_DURATION_MS
            );

            await message.delete()
                .catch(
                    () => null
                );

        }

        await updatePanelMessage(
            item.panelMessage,
            item.source
        );

    }

    playing =
        false;

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

    await interaction.deferUpdate();

    await removeCoins(
        interaction.user.id,
        COST
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
            prizeAfterSpank
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

    queue.push({
        channel:
            interaction.channel,
        panelMessage:
            interaction.message,
        source:
            interaction,
        userId:
            interaction.user.id
    });

    await updatePanel(
        interaction
    );

    if (
        won
    ) {

        await interaction.followUp({
            content:
                `<@${interaction.user.id}> won the Spank Dilli prize: **${prizeAfterSpank} coins**!`
        });

        void announceWinner(
            interaction,
            prizeAfterSpank
        );

    }

    void processQueue();

}

module.exports = {
    buildPanelEmbed,
    getButtonRow,
    getPanelOwner,
    getState,
    handleSpankDilli
};
