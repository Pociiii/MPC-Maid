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

const STARTUP_DROP_DELAY =
    15 * 1000;

let autoDropTimer =
    null;

let startupDropTimer =
    null;

async function sendAutoDrop(
    client
) {

    try {

        const channel =
            await client.channels.fetch(
                CHANNELS.TITTY_DROP
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
                        `Titty Drop channel <#${CHANNELS.TITTY_DROP}> was not available or was not text based.`
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
                            '\uD83D\uDCCD Channel',
                        value:
                            `<#${CHANNELS.TITTY_DROP}>`,
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

    startupDropTimer =
        setTimeout(
            () => {

                startupDropTimer =
                    null;

                void sendAutoDrop(
                    client
                );

            },
            STARTUP_DROP_DELAY
        );

    void logBotEvent(
        client,
        {
            title:
                'Auto Drop Started',
            description:
                `Automatic drops will post in <#${CHANNELS.TITTY_DROP}> after startup and then every hour.`
        }
    );

}

module.exports = {
    startShowcaseAutoDrop
};
