const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const db =
    require('../../database/database');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const ROLES =
    require('../../data/roles.json');

const {
    createEmbed
} = require('../../utils/embeds');

const emojis =
    require('../../utils/emojis');

const {
    logError,
    logWarning
} = require('../../utils/inboxLogger');

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

function buildMemberCardPanelMessage() {

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                `${emojis.mpc_logo} MPC Member Card`,
            description:
`Generate your official **MPC** membership card.

The card style is picked from your MPC role.

Card priority:
- <@&${ROLES.MPC_CREW}> gets the crew card.
- <@&${ROLES.STILETTO_GANG}> and <@&${ROLES.TAILORED_FEW}> get their gang card.
- <@&${ROLES.MIDNIGHT_CIRCLE}> gets the Midnight Circle card.
- No card role means the regular member card.

Pick your roles first if you want at least the Midnight Circle card.

Remember to change your nick to your in-game name first.`,
            timestamp:
                true
        });

    const row =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        'membercard'
                    )
                    .setLabel(
                        'Get Card'
                    )
                    .setEmoji(
                        emojis.mpc_logo
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    )
            );

    return {
        embeds: [
            embed
        ],
        components: [
            row
        ]
    };

}

async function getMemberCardChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.MEMBER_CARD
    ) ??
        await client.channels.fetch(
            CHANNELS.MEMBER_CARD
        ).catch(
            () => null
        );

}

async function findExistingMemberCardPanel(
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
                    embed.title?.includes(
                        'MPC Member Card'
                    )
            )
    ) ?? null;

}

async function ensurePersistentMemberCardPanel(
    client
) {

    const channel =
        await getMemberCardChannel(
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
                    'Member Card Channel Missing',
                description:
                    `Could not use <#${CHANNELS.MEMBER_CARD}> for the member card panel.`
            }
        );

        return null;

    }

    await dbRun(
        `INSERT OR IGNORE INTO member_card_panel_settings (
            id,
            channel_id,
            updated_at
        ) VALUES (1, ?, ?)`,
        [
            CHANNELS.MEMBER_CARD,
            Date.now()
        ]
    );

    const settings =
        await dbGet(
            'SELECT * FROM member_card_panel_settings WHERE id = 1'
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
            await findExistingMemberCardPanel(
                channel,
                client
            );

    if (
        message
    )
        await message.edit(
            buildMemberCardPanelMessage()
        );
    else
        message =
            await channel.send(
                buildMemberCardPanelMessage()
            );

    await dbRun(
        `UPDATE member_card_panel_settings
         SET channel_id = ?, message_id = ?, updated_at = ?
         WHERE id = 1`,
        [
            CHANNELS.MEMBER_CARD,
            message.id,
            Date.now()
        ]
    );

    return message;

}

async function startMemberCardPanel(
    client
) {

    try {

        return await ensurePersistentMemberCardPanel(
            client
        );

    }
    catch (error) {

        void logError(
            client,
            {
                title:
                    'Member Card Panel Startup Failed',
                error,
                fields: [
                    {
                        name:
                            '📍 Channel',
                        value:
                            `<#${CHANNELS.MEMBER_CARD}>`,
                        inline:
                            true
                    }
                ]
            }
        );

        return null;

    }

}

module.exports = {
    buildMemberCardPanelMessage,
    ensurePersistentMemberCardPanel,
    startMemberCardPanel
};
