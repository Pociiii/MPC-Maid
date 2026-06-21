const {
    CHANNELS
} = require('../data/constants');

const {
    buildDropPost
} = require('../utils/dropPost');

const {
    logBotEvent,
    logError,
    logWarning
} = require('../utils/inboxLogger');

const ONE_HOUR =
    60 * 60 * 1000;

let autoDropTimer =
    null;

async function sendAutoDrop(
    client
) {

    try {

        const channel =
            await client.channels.fetch(
                CHANNELS.SHOWCASE
            );

        if (
            !channel?.isTextBased()
        ) {

            await logWarning(
                client,
                {
                    title:
                        'Auto Drop Channel Missing',
                    description:
                        `Showcase channel <#${CHANNELS.SHOWCASE}> was not available or was not text based.`
                }
            );

            return;

        }

        await channel.send(
            buildDropPost()
        );

    }
    catch (error) {

        console.error(
            'AUTO DROP ERROR'
        );
        console.error(
            error
        );

        await logError(
            client,
            {
                title:
                    'Auto Drop Failed',
                error,
                fields: [
                    {
                        name:
                            'Channel',
                        value:
                            `<#${CHANNELS.SHOWCASE}>`,
                        inline:
                            true
                    }
                ]
            }
        );

    }

}

function startShowcaseAutoDrop(
    client
) {

    if (
        autoDropTimer
    )
        return;

    autoDropTimer =
        setInterval(
            () =>
                sendAutoDrop(
                    client
                ),
            ONE_HOUR
        );

    void logBotEvent(
        client,
        {
            title:
                'Auto Drop Started',
            description:
                `Automatic drops will post in <#${CHANNELS.SHOWCASE}> every hour.`
        }
    );

}

module.exports = {
    startShowcaseAutoDrop
};
