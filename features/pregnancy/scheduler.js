const {
    CHANNELS
} = require('../../data/constants');

const {
    getPregnancyMilestones,
    getNextPregnancyCheckTimestamp,
    getPreviousPregnancyDate,
    processPregnancyChecks,
    processScheduledPregnancies
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
    logBotEvent,
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

async function logPregnancyResults(
    client,
    results
) {

    for (
        const result of results
    ) {

        await logBotEvent(
            client,
            {
                color:
                    result.success
                        ? '#57F287'
                        : '#FEE75C',
                title:
                    result.success
                        ? '🤰 Pregnancy Roll Succeeded'
                        : '🎲 Pregnancy Roll Failed',
                description:
                    `Daily pregnancy roll for **${result.date}**.`,
                fields: [
                    {
                        name:
                            '🤰 Carrier',
                        value:
                            `<@${result.carrierId}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            '🧬 Selected Partner',
                        value:
                            `<@${result.fatherId}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            '🌸 Carrier Fertility',
                        value:
                            `**${result.carrierFertility}%**`,
                        inline:
                            true
                    },
                    {
                        name:
                            '🧬 Partner Fertility',
                        value:
                            `**${result.partnerFertility}%**`,
                        inline:
                            true
                    },
                    {
                        name:
                            '💊 Pill Bonuses',
                        value:
                            `Carrier: **+${result.carrierPillBonus}%**\nPartner: **+${result.partnerPillBonus}%**`,
                        inline:
                            true
                    },
                    {
                        name:
                            '🎯 Final Chance',
                        value:
                            `**${result.chance}%**`,
                        inline:
                            true
                    },
                    {
                        name:
                            '🎲 Random Roll',
                        value:
                            `**${result.roll}** / 100\nSuccess requires a value at or below **${result.chance}**.`,
                        inline:
                            true
                    },
                    {
                        name:
                            '📌 Result',
                        value:
                            result.success
                                ? '**Pregnant**'
                                : '**Not pregnant**',
                        inline:
                            true
                    }
                ],
                footerText:
                    'MPC Maid Pregnancy Log'
            }
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

        const date =
            getPreviousPregnancyDate();

        const scheduledResults =
            await processScheduledPregnancies(
                date
            );

        await logPregnancyResults(
            client,
            scheduledResults
        );

        await announcePregnancyResults(
            client,
            scheduledResults
        );

        const results =
            await processPregnancyChecks(
                date
            );

        await logPregnancyResults(
            client,
            results
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
    logPregnancyResults,
    runPregnancyTick,
    startPregnancyScheduler
};
