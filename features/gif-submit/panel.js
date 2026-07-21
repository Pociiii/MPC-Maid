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

const {
    createEmbed
} = require('../../utils/embeds');

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

function buildGifSubmissionPanelMessage() {

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                'GIF Submission',
            description:
`Submit GIFs to improve MPC Maid.

Scene buttons are split by cast type:
- **Scene MF**: current 2-person scenes
- **Scene FF**: 2 female scenes
- **Scene MFM**: 2 males + 1 female
- **Scene FMF**: 1 male + 2 females
- **Scene FFF**: 3 females

**Interactions** are used by Wiggle, Flex, Horny, Titty Drop, Drink, Firework, and similar commands.

**Scene Titles** lets members suggest names for future porn scene posts.`,
            footerText:
                'MPC Maid - GIF Submission',
            timestamp:
                true
        });

    const sceneRow =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        'gifsubmit_scenes:mf'
                    )
                    .setLabel(
                        'Scene MF'
                    )
                    .setEmoji(
                        '🎬'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        'gifsubmit_scenes:ff'
                    )
                    .setLabel(
                        'Scene FF'
                    )
                    .setEmoji(
                        '🎬'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        'gifsubmit_scenes:mfm'
                    )
                    .setLabel(
                        'Scene MFM'
                    )
                    .setEmoji(
                        '🎬'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        'gifsubmit_scenes:fmf'
                    )
                    .setLabel(
                        'Scene FMF'
                    )
                    .setEmoji(
                        '🎬'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        'gifsubmit_scenes:fff'
                    )
                    .setLabel(
                        'Scene FFF'
                    )
                    .setEmoji(
                        '🎬'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    )
            );

    const utilityRow =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        'gifsubmit_interactions'
                    )
                    .setLabel(
                        'Interactions'
                    )
                    .setEmoji(
                        '✨'
                    )
                    .setStyle(
                        ButtonStyle.Success
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        'gifsubmit_titles'
                    )
                    .setLabel(
                        'Scene Titles'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        'gifsubmit_info'
                    )
                    .setLabel(
                        'GIF Info'
                    )
                    .setEmoji(
                        'ℹ️'
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
            );

    return {
        embeds: [
            embed
        ],
        components: [
            sceneRow,
            utilityRow
        ]
    };

}

async function getGifSubmissionChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.GIFS
    ) ??
        await client.channels.fetch(
            CHANNELS.GIFS
        ).catch(
            () => null
        );

}

async function findExistingGifSubmissionPanel(
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
                    embed.title === 'GIF Submission'
            ) &&
            message.components?.some(
                (row) =>
                    row.components?.some(
                        (component) =>
                            component.customId === 'gifsubmit_scenes:mf'
                    )
            )
    ) ?? null;

}

async function ensurePersistentGifSubmissionPanel(
    client
) {

    const channel =
        await getGifSubmissionChannel(
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
                    'GIF Submission Channel Missing',
                description:
                    `Could not use <#${CHANNELS.GIFS}> for the GIF submission panel.`
            }
        );

        return null;

    }

    await dbRun(
        `INSERT OR IGNORE INTO gif_submission_panel_settings (
            id,
            channel_id,
            updated_at
        ) VALUES (1, ?, ?)`,
        [
            CHANNELS.GIFS,
            Date.now()
        ]
    );

    const settings =
        await dbGet(
            'SELECT * FROM gif_submission_panel_settings WHERE id = 1'
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
            await findExistingGifSubmissionPanel(
                channel,
                client
            );

    const payload =
        buildGifSubmissionPanelMessage();

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
        `UPDATE gif_submission_panel_settings
         SET channel_id = ?, message_id = ?, updated_at = ?
         WHERE id = 1`,
        [
            CHANNELS.GIFS,
            message.id,
            Date.now()
        ]
    );

    return message;

}

async function startGifSubmissionPanel(
    client
) {

    try {

        return await ensurePersistentGifSubmissionPanel(
            client
        );

    }
    catch (error) {

        void logError(
            client,
            {
                title:
                    'GIF Submission Panel Startup Failed',
                error,
                fields: [
                    {
                        name:
                            '📍 Channel',
                        value:
                            `<#${CHANNELS.GIFS}>`,
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
    buildGifSubmissionPanelMessage,
    ensurePersistentGifSubmissionPanel,
    startGifSubmissionPanel
};
