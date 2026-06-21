const {
    COLORS,
    CHANNELS,
    getRandomColor
} = require('../data/constants');

const {
    createEmbed
} = require('./embeds');

const DEFAULT_LIMIT =
    900;

function trimText(
    value,
    limit = DEFAULT_LIMIT
) {

    const text =
        String(
            value ?? 'None'
        );

    if (
        text.length <= limit
    )
        return text;

    return `${text.slice(
        0,
        limit - 3
    )}...`;

}

function normalizeFields(
    fields = []
) {

    return fields
        .filter(
            Boolean
        )
        .map(
            (field) => ({
                name:
                    trimText(
                        field.name,
                        256
                    ),
                value:
                    trimText(
                        field.value,
                        1024
                    ),
                inline:
                    Boolean(
                        field.inline
                    )
            })
        );

}

function formatError(
    error
) {

    if (
        !error
    )
        return 'No error details.';

    return trimText(
        error.stack ||
        error.message ||
        error,
        1500
    );

}

async function getInboxThread(
    client,
    threadId
) {

    return client.channels.cache.get(
        threadId
    ) ||
        await client.channels.fetch(
            threadId
        ).catch(
            () => null
        );

}

function buildInboxEmbed(
    {
        color = getRandomColor(),
        description,
        fields,
        footerText = 'MPC Maid',
        title
    }
) {

    const embed =
        createEmbed({
            color,
            description:
                description
                    ? trimText(
                        description,
                        1800
                    )
                    : undefined,
            footerText,
            timestamp:
                true,
            title
        });

    const safeFields =
        normalizeFields(
            fields
        );

    if (
        safeFields.length
    ) {

        embed.addFields(
            safeFields
        );

    }

    return embed;

}

async function sendInboxLog(
    client,
    {
        description,
        fields,
        footerText,
        threadId = CHANNELS.INBOX_LOG,
        title,
        color
    }
) {

    const thread =
        await getInboxThread(
            client,
            threadId
        );

    if (
        !thread?.send
    )
        return false;

    const sent =
        await thread.send({
        embeds: [
            buildInboxEmbed({
                color,
                description,
                fields,
                footerText,
                title
            })
        ]
        }).catch(
            () => null
        );

    return Boolean(
        sent
    );

}

function logBotEvent(
    client,
    options = {}
) {

    return sendInboxLog(
        client,
        {
            color:
                COLORS.DEFAULT,
            footerText:
                'MPC Maid Log',
            ...options,
            threadId:
                options.threadId ?? CHANNELS.INBOX_LOG
        }
    );

}

function logWarning(
    client,
    options = {}
) {

    return sendInboxLog(
        client,
        {
            color:
                '#FEE75C',
            footerText:
                'MPC Maid Warning',
            ...options,
            threadId:
                options.threadId ?? CHANNELS.INBOX_LOG
        }
    );

}

function logError(
    client,
    {
        error,
        fields = [],
        ...options
    } = {}
) {

    return sendInboxLog(
        client,
        {
            color:
                COLORS.ERROR,
            footerText:
                'MPC Maid Error',
            ...options,
            fields: [
                ...fields,
                {
                    name:
                        'Error',
                    value:
                        formatError(
                            error
                        ),
                    inline:
                        false
                }
            ],
            threadId:
                options.threadId ?? CHANNELS.INBOX_LOG
        }
    );

}

function logFeedback(
    client,
    options = {}
) {

    return sendInboxLog(
        client,
        {
            color:
                COLORS.SUCCESS,
            footerText:
                'MPC Maid Feedback',
            ...options,
            threadId:
                options.threadId ?? CHANNELS.INBOX_FEEDBACK
        }
    );

}

function logDebug(
    client,
    options = {}
) {

    return sendInboxLog(
        client,
        {
            color:
                getRandomColor(),
            footerText:
                'MPC Maid Debug',
            ...options,
            threadId:
                options.threadId ?? CHANNELS.INBOX_FEEDBACK
        }
    );

}

module.exports = {
    buildInboxEmbed,
    formatError,
    getInboxThread,
    logBotEvent,
    logDebug,
    logError,
    logFeedback,
    logWarning,
    sendInboxLog,
    trimText
};
