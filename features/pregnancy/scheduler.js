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
    buildPregnancyAnnouncementPayload
} = require('./pregnancyAnnouncements');

const {
    logError
} = require('../../utils/inboxLogger');

const {
    fetchDisplayTarget
} = require('../../utils/embeds');

const dayIntervalMs =
    24 * 60 * 60 * 1000;

async function getMomentsChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.PILLOW_TALK
    ) ||
        await client.channels.fetch(
            CHANNELS.PILLOW_TALK
        ).catch(
            () => null
        );

}

async function getCarrierTarget(
    client,
    pregnancy
) {

    if (
        !pregnancy?.carrier_id
    )
        return null;

    return fetchDisplayTarget(
        client,
        pregnancy.carrier_id
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

        const carrier =
            await getCarrierTarget(
                client,
                result.pregnancy
            );

        await channel.send(
            buildPregnancyAnnouncementPayload(
                result.pregnancy,
                buildPregnancyConfirmedEmbed(
                    result.pregnancy,
                    carrier
                )
            )
        );

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

        const carrier =
            await getCarrierTarget(
                client,
                pregnancy
            );

        await channel.send(
            buildPregnancyAnnouncementPayload(
                pregnancy,
                buildGenderRevealEmbed(
                    pregnancy,
                    carrier
                )
            )
        );

    }

    for (
        const pregnancy of births
    ) {

        const carrier =
            await getCarrierTarget(
                client,
                pregnancy
            );

        await channel.send(
            buildPregnancyAnnouncementPayload(
                pregnancy,
                buildBirthEmbed(
                    pregnancy,
                    carrier
                )
            )
        );

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
