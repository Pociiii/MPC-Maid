const {
    CHANNELS
} = require('../../data/constants');

const {
    clearSceneBusy
} = require('../../utils/pornScenes');

const {
    adpLogoPath
} = require('../../utils/adpLogo');

const {
    logError,
    logWarning
} = require('../../utils/inboxLogger');

const {
    buildPhaseOrder,
    getIntervalMs
} = require('./sceneMath');

const {
    buildFinalEmbed,
    buildPartEmbed
} = require('./sceneEmbeds');

const {
    applyRewards
} = require('./sceneRewards');

async function finishScene(
    channel,
    requesterId,
    targetId,
    result,
    sceneLinks,
    requesterAuthor
) {

    await applyRewards(
        requesterId,
        targetId,
        result
    );

    const rumorsChannel =
        channel.client.channels.cache.get(
            CHANNELS.RUMORS
        ) ??
        await channel.client.channels.fetch(
            CHANNELS.RUMORS
        ).catch(
            () => null
        );

    if (
        rumorsChannel
    ) {

        try {

            await rumorsChannel.send({
                embeds: [
                    buildFinalEmbed(
                        requesterId,
                        targetId,
                        result,
                        sceneLinks,
                        requesterAuthor
                    )
                ],
                files: [
                    adpLogoPath
                ]
            });

        }
        catch (error) {

            await logError(
                channel.client,
                {
                    title:
                        'Porn Scene Final Rumor Failed',
                    error,
                    fields: [
                        {
                            name:
                                'Scene',
                            value:
                                `<@${requesterId}> + <@${targetId}>`,
                            inline:
                                true
                        }
                    ]
                }
            );

        }

    }
    else {

        await logWarning(
            channel.client,
            {
                title:
                    'Porn Scene Final Rumor Missing',
                description:
                    `Could not post final result because rumors channel <#${CHANNELS.RUMORS}> was unavailable.`,
                fields: [
                    {
                        name:
                            'Scene',
                        value:
                            `${requesterId} + ${targetId}`,
                        inline:
                            true
                    }
                ]
            }
        );

    }

    clearSceneBusy(
        requesterId,
        targetId
    );

}

function scheduleScene(
    channel,
    requesterId,
    targetId,
    sceneCategory,
    result,
    sceneTitle,
    requesterAuthor
) {

    const phases =
        buildPhaseOrder(
            result.totalParts
        );

    const intervalMs =
        getIntervalMs(
            result.totalParts
        );

    const sceneLinks = [];

    phases.forEach(
        (phase, index) => {

            setTimeout(
                async () => {

                    try {

                        const message =
                            await channel.send({
                                embeds: [
                                    buildPartEmbed(
                                        requesterId,
                                        targetId,
                                        sceneCategory,
                                        phase,
                                        sceneTitle,
                                        requesterAuthor
                                    )
                                ],
                                files: [
                                    adpLogoPath
                                ]
                            });

                        sceneLinks[index] =
                            message.url;

                        if (
                            index === phases.length - 1
                        ) {

                            await finishScene(
                                channel,
                                requesterId,
                                targetId,
                                result,
                                sceneLinks,
                                requesterAuthor
                            );

                        }

                    }
                    catch (error) {

                        console.error(
                            'PORN SCENE ERROR'
                        );
                        console.error(
                            error
                        );

                        await logError(
                            channel.client,
                            {
                                title:
                                    'Porn Scene Part Failed',
                                error,
                                fields: [
                                    {
                                        name:
                                            'Part',
                                        value:
                                            `${index + 1}/${phases.length}`,
                                        inline:
                                            true
                                    },
                                    {
                                        name:
                                            'Phase',
                                        value:
                                            phase,
                                        inline:
                                            true
                                    },
                                    {
                                        name:
                                            'Channel',
                                        value:
                                            `<#${channel.id}>`,
                                        inline:
                                            true
                                    },
                                    {
                                        name:
                                            'Users',
                                        value:
                                            `<@${requesterId}> + <@${targetId}>`,
                                        inline:
                                            false
                                    }
                                ]
                            }
                        );

                        clearSceneBusy(
                            requesterId,
                            targetId
                        );

                    }

                },
                index * intervalMs
            );

        }
    );

}

module.exports = {
    scheduleScene
};
