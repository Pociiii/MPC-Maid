const {
    CHANNELS
} = require('../data/constants');

const {
    buildDropPost
} = require('../utils/dropPost');

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
        )
            return;

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

}

module.exports = {
    startShowcaseAutoDrop
};
