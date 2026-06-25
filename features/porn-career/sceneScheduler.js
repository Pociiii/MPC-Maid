const {
    CHANNELS
} = require('../../data/constants');

const {
    clearSceneBusy
} = require('../../utils/pornScenes');

const {
    logError,
    logWarning
} = require('../../utils/inboxLogger');

const {
    trackDailyQuest
} = require('../daily-quests/dailyQuests');

const {
    incrementAchievementProgress,
    setAchievementProgress
} = require('../achievements/achievements');

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
    requesterAuthor,
    sceneColor
) {

    await applyRewards(
        requesterId,
        targetId,
        result
    );

    const highestCombinedStat =
        Math.max(
            result.combinedPerformance,
            result.combinedStamina,
            result.combinedFame
        );

    const sortedCombinedStats =
        [
            result.combinedPerformance,
            result.combinedStamina,
            result.combinedFame
        ].sort(
            (first, second) =>
                second - first
        );

    const secondHighestCombinedStat =
        sortedCombinedStats[1];

    const lowestCombinedStat =
        sortedCombinedStats[2];

    await Promise.all([
        trackDailyQuest(
            channel.client,
            requesterId,
            'porn_scene'
        ),
        trackDailyQuest(
            channel.client,
            targetId,
            'porn_scene'
        ),
        incrementAchievementProgress(
            channel.client,
            requesterId,
            'porn_scenes'
        ),
        incrementAchievementProgress(
            channel.client,
            targetId,
            'porn_scenes'
        ),
        setAchievementProgress(
            channel.client,
            requesterId,
            'scene_combined_stat',
            highestCombinedStat
        ),
        setAchievementProgress(
            channel.client,
            targetId,
            'scene_combined_stat',
            highestCombinedStat
        ),
        setAchievementProgress(
            channel.client,
            requesterId,
            'scene_combined_two_stats',
            secondHighestCombinedStat
        ),
        setAchievementProgress(
            channel.client,
            targetId,
            'scene_combined_two_stats',
            secondHighestCombinedStat
        ),
        setAchievementProgress(
            channel.client,
            requesterId,
            'scene_combined_three_stats',
            lowestCombinedStat
        ),
        setAchievementProgress(
            channel.client,
            targetId,
            'scene_combined_three_stats',
            lowestCombinedStat
        )
    ]);

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
                        requesterAuthor,
                        sceneColor
                    )
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
    requesterAuthor,
    sceneColor
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
                                        requesterAuthor,
                                        sceneColor
                                    )
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
                                requesterAuthor,
                                sceneColor
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
