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

async function getRumorsChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.RUMORS
    ) ||
        await client.channels.fetch(
            CHANNELS.RUMORS
        ).catch(
            () => null
        );

}

async function fetchUserTarget(
    client,
    userId
) {

    return await client.users.fetch(
        userId
    ).catch(
        () => ({
            id:
                userId,
            displayName:
                'MPC Member',
            displayAvatarURL:
                () => undefined
        })
    );

}

async function announcePregnancyResults(
    client,
    results
) {

    const channel =
        await getRumorsChannel(
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
            await fetchUserTarget(
                client,
                result.carrierId
            );

        await channel.send({
            content:
                `<@${result.carrierId}> is pregnant!`,
            embeds: [
                buildPregnancyConfirmedEmbed(
                    result.pregnancy,
                    carrier
                )
            ]
        });

    }

}

async function announceMilestones(
    client
) {

    const channel =
        await getRumorsChannel(
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
            await fetchUserTarget(
                client,
                pregnancy.carrier_id
            );

        await channel.send({
            content:
                `<@${pregnancy.carrier_id}> had a gender reveal!`,
            embeds: [
                buildGenderRevealEmbed(
                    pregnancy,
                    carrier
                )
            ]
        });

    }

    for (
        const pregnancy of births
    ) {

        const carrier =
            await fetchUserTarget(
                client,
                pregnancy.carrier_id
            );

        await channel.send({
            content:
                `<@${pregnancy.carrier_id}> gave birth!`,
            embeds: [
                buildBirthEmbed(
                    pregnancy,
                    carrier
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
