const {
    CHANNELS
} = require('../../data/constants');

const {
    getPregnancyMilestones,
    getNextPregnancyCheckTimestamp,
    getPreviousPregnancyDate,
    processPregnancyChecks
} = require('../../database/pregnancy');

const {
    buildBirthEmbed,
    buildGenderRevealEmbed,
    buildPregnancyConfirmedEmbed
} = require('./pregnancyEmbeds');

const {
    logError
} = require('../../utils/inboxLogger');

const dayIntervalMs =
    24 * 60 * 60 * 1000;

async function getMomentsChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.MOMENTS
    ) ||
        await client.channels.fetch(
            CHANNELS.MOMENTS
        ).catch(
            () => null
        );

}

async function announcePregnancyResults(
    client,
    results
) {

    const channel =
        await getMomentsChannel(
            client
        );

    if (
        !channel?.send
    )
        return;

    for (
        const result of results
    ) {

        if (
            !result.success ||
            !result.pregnancy
        )
            continue;

        await channel.send({
            embeds: [
                buildPregnancyConfirmedEmbed(
                    result.pregnancy
                )
            ]
        });

    }

}

async function announceMilestones(
    client
) {

    const channel =
        await getMomentsChannel(
            client
        );

    if (
        !channel?.send
    )
        return;

    const {
        births,
        reveals
    } =
        await getPregnancyMilestones();

    for (
        const pregnancy of reveals
    ) {

        await channel.send({
            embeds: [
                buildGenderRevealEmbed(
                    pregnancy
                )
            ]
        });

    }

    for (
        const pregnancy of births
    ) {

        await channel.send({
            embeds: [
                buildBirthEmbed(
                    pregnancy
                )
            ]
        });

    }

}

async function runPregnancyTick(
    client
) {

    try {

        const results =
            await processPregnancyChecks(
                getPreviousPregnancyDate()
            );

        await announcePregnancyResults(
            client,
            results
        );

        await announceMilestones(
            client
        );

    }
    catch (error) {

        console.error(
            'PREGNANCY SCHEDULER ERROR'
        );
        console.error(
            error
        );

        await logError(
            client,
            {
                title:
                    'Pregnancy Scheduler Error',
                error
            }
        );

    }

}

function startPregnancyScheduler(
    client
) {

    // Startup catch-up: database guards still allow only one roll per carrier/date.
    runPregnancyTick(
        client
    );

    const nextCheckMs =
        getNextPregnancyCheckTimestamp() * 1000;

    const delayMs =
        Math.max(
            1000,
            nextCheckMs - Date.now()
        );

    setTimeout(
        () => {

            runPregnancyTick(
                client
            );

            setInterval(
                () =>
                    runPregnancyTick(
                        client
                    ),
                dayIntervalMs
            );

        },
        delayMs
    );

}

module.exports = {
    runPregnancyTick,
    startPregnancyScheduler
};
