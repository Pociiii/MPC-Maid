const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

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
    applyRewards,
    buildSceneRewardBonuses,
    getRequesterSceneXp,
    getTargetSceneXp
} = require('./sceneRewards');

const {
    recordActivityMoment
} = require('../activity/activityMoments');

function buildSexPartComponents(
    requesterId,
    targetId,
    sceneCategory,
    phase
) {

    if (
        phase !== 'sex'
    )
        return [];

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `pornscene_spank:${requesterId}:${targetId}:${sceneCategory}`
                    )
                    .setLabel(
                        'Spank'
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    )
            )
    ];

}

async function finishScene(
    channel,
    requesterId,
    targetId,
    sceneCategory,
    result,
    sceneLinks,
    requesterAuthor,
    sceneColor
) {

    const rewardBonuses =
        await buildSceneRewardBonuses(
            channel.client,
            requesterId,
            targetId
        );

    await applyRewards(
        channel.client,
        requesterId,
        targetId,
        result,
        rewardBonuses
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

    const momentsChannel =
        channel.client.channels.cache.get(
            CHANNELS.MOMENTS
        ) ??
        await channel.client.channels.fetch(
            CHANNELS.MOMENTS
        ).catch(
            () => null
        );

    if (
        momentsChannel
    ) {

        try {

            await momentsChannel.send({
                embeds: [
                    buildFinalEmbed(
                        requesterId,
                        targetId,
                        sceneCategory,
                        result,
                        sceneLinks,
                        requesterAuthor,
                        sceneColor,
                        rewardBonuses
                    )
                ]
            });

        }
        catch (error) {

            await logError(
                channel.client,
                {
                    title:
                        'Porn Scene Final Moment Failed',
                    error,
                    fields: [
                        {
                            name:
                                '\uD83C\uDFAC Scene',
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
                    'Porn Scene Final Moment Missing',
                description:
                    `Could not post final result because moments channel <#${CHANNELS.MOMENTS}> was unavailable.`,
                fields: [
                    {
                        name:
                            '\uD83C\uDFAC Scene',
                        value:
                            `${requesterId} + ${targetId}`,
                        inline:
                            true
                    }
                ]
            }
        );

    }

    await Promise.all([
        recordActivityMoment(
            channel.client,
            requesterId,
            'scene',
            {
                coins:
                    result.coins,
                criticalScene:
                    result.criticalScene,
                outcome:
                    result.outcome,
                partnerId:
                    targetId,
                ranking:
                    result.rankingChange,
                xp:
                    getRequesterSceneXp(
                        result,
                        rewardBonuses
                    )
            }
        ),
        recordActivityMoment(
            channel.client,
            targetId,
            'scene',
            {
                coins:
                    result.coins,
                criticalScene:
                    result.criticalScene,
                outcome:
                    result.outcome,
                partnerId:
                    requesterId,
                ranking:
                    result.rankingChange,
                xp:
                    getTargetSceneXp(
                        result,
                        rewardBonuses
                    )
            }
        )
    ]);

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
                                        sceneColor,
                                        result,
                                        index
                                    )
                                ],
                                components:
                                    buildSexPartComponents(
                                        requesterId,
                                        targetId,
                                        sceneCategory,
                                        phase
                                    )
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
                                sceneCategory,
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
                                            '\uD83C\uDF9E\uFE0F Part',
                                        value:
                                            `${index + 1}/${phases.length}`,
                                        inline:
                                            true
                                    },
                                    {
                                        name:
                                            '\uD83C\uDFAD Phase',
                                        value:
                                            phase,
                                        inline:
                                            true
                                    },
                                    {
                                        name:
                                            '\uD83D\uDCCD Channel',
                                        value:
                                            `<#${channel.id}>`,
                                        inline:
                                            true
                                    },
                                    {
                                        name:
                                            '\uD83D\uDC65 Users',
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
