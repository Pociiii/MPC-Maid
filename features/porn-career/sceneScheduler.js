const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    CHANNELS
} = require('../../data/constants');

const {
    clearSceneBusy,
    setSceneBusy
} = require('../../utils/pornScenes');

const {
    applyPornSceneRewardsOnce,
    checkpointScenePart,
    createActiveScene,
    getActiveScene,
    getRestorableScenes,
    markSceneCompleted
} = require('../../database/activeScenes');

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
    buildSceneRewardBonuses,
    getRequesterSceneXp,
    getTargetSceneXp,
    syncSceneRewardCounters
} = require('./sceneRewards');

const {
    recordActivityMoment
} = require('../activity/activityMoments');

const {
    getStudioScene
} = require('../../database/studios');

const {
    addStudioField,
    attachScene,
    finishStudioProduction,
    sendMirror
} = require('../player-studios/studios');

const sceneTimers =
    new Map();

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
    sceneId,
    requesterId,
    targetId,
    sceneCategory,
    result,
    sceneLinks,
    requesterAuthor,
    sceneColor
) {

    const activeScene =
        await getActiveScene(
            sceneId
        );

    const studioScene =
        await getStudioScene(
            sceneId
        );

    let studioFinished =
        false;

    const rewardBonuses =
        await buildSceneRewardBonuses(
            channel.client,
            requesterId,
            targetId
        );

    const requesterXp =
        getRequesterSceneXp(
            result,
            rewardBonuses
        );

    const targetXp =
        getTargetSceneXp(
            result,
            rewardBonuses
        );

    const rewardsApplied =
        await applyPornSceneRewardsOnce(
        sceneId,
        requesterId,
        targetId,
        result,
        requesterXp,
        targetXp
    );

    if (
        rewardsApplied
    )
        await syncSceneRewardCounters(
            channel.client,
            requesterId,
            targetId
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

    if (
        rewardsApplied
    )
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

            const finalEmbed =
                buildFinalEmbed(
                    requesterId,
                    targetId,
                    result,
                    sceneLinks,
                    requesterAuthor,
                    sceneColor,
                    rewardBonuses
                );

            if (
                studioScene
            )
                addStudioField(
                    finalEmbed,
                    studioScene,
                    channel.guild?.id ??
                        process.env.GUILD_ID
                );

            await momentsChannel.send({
                content:
                    `<@${requesterId}> <@${targetId}>`,
                allowedMentions: {
                    users: [
                        requesterId,
                        targetId
                    ]
                },
                embeds: [
                    finalEmbed
                ]
            });

            if (
                activeScene &&
                studioScene
            ) {
                await finishStudioProduction(
                    channel.client,
                    activeScene,
                    finalEmbed
                );
                studioFinished =
                    true;
            }

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

    if (
        activeScene &&
        studioScene &&
        !studioFinished
    ) {

        const finalEmbed =
            buildFinalEmbed(
                requesterId,
                targetId,
                result,
                sceneLinks,
                requesterAuthor,
                sceneColor,
                rewardBonuses
            );

        addStudioField(
            finalEmbed,
            studioScene,
            channel.guild?.id ??
                process.env.GUILD_ID
        );

        await finishStudioProduction(
            channel.client,
            activeScene,
            finalEmbed
        );

    }

    if (
        rewardsApplied
    )
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

    await markSceneCompleted(
        sceneId
    );

    clearSceneBusy(
        requesterId,
        targetId
    );

}

function schedulePornSceneRecord(
    client,
    scene,
    overrideDelay = null
) {

    const existingTimer =
        sceneTimers.get(
            scene.id
        );

    if (
        existingTimer
    )
        clearTimeout(
            existingTimer
        );

    const delay =
        overrideDelay ??
        Math.max(
            0,
            scene.next_part_at - Date.now()
        );

    const timer =
        setTimeout(
            () =>
                void postNextPornScenePart(
                    client,
                    scene.id
                ),
            delay
        );

    if (
        typeof timer.unref === 'function'
    )
        timer.unref();

    sceneTimers.set(
        scene.id,
        timer
    );

}

async function postNextPornScenePart(
    client,
    sceneId
) {

    sceneTimers.delete(
        sceneId
    );

    const scene =
        await getActiveScene(
            sceneId
        );

    if (
        !scene ||
        scene.status === 'completed' ||
        scene.status === 'failed'
    )
        return;

    const channel =
        client.channels.cache.get(
            scene.channel_id
        ) ??
        await client.channels.fetch(
            scene.channel_id
        ).catch(
            () => null
        );

    if (
        !channel?.send
    ) {

        schedulePornSceneRecord(
            client,
            scene,
            60 * 1000
        );

        return;

    }

    if (
        scene.status === 'finalizing'
    ) {

        try {

            await finishScene(
                channel,
                scene.id,
                scene.owner_id,
                scene.target_id,
                scene.category,
                scene.result,
                scene.sceneLinks,
                scene.author,
                scene.color
            );

        }
        catch (error) {

            await logError(
                client,
                {
                    title: 'Porn Scene Finale Recovery Failed',
                    error,
                    fields: [
                        {
                            name: '\uD83C\uDFAC Scene',
                            value: String(scene.id),
                            inline: true
                        }
                    ]
                }
            );

            schedulePornSceneRecord(
                client,
                scene,
                60 * 1000
            );

        }

        return;

    }

    const index =
        scene.next_part_index;

    const phase =
        scene.parts[index];

    if (
        !phase
    )
        return;

    try {

        const partEmbed =
            buildPartEmbed(
                scene.owner_id,
                scene.target_id,
                scene.category,
                phase,
                scene.title,
                scene.author,
                scene.color,
                scene.result,
                index
            );

        const studioScene =
            await getStudioScene(
                scene.id
            );

        if (
            studioScene
        )
            addStudioField(
                partEmbed,
                studioScene,
                channel.guild?.id ??
                    process.env.GUILD_ID
            );

        const message =
            await channel.send({
                embeds: [
                    partEmbed
                ],
                components:
                    buildSexPartComponents(
                        scene.owner_id,
                        scene.target_id,
                        scene.category,
                        phase
                    )
            });

        if (
            studioScene
        )
            await sendMirror(
                client,
                studioScene,
                `part:${index}`,
                partEmbed
            );

        const sceneLinks =
            [
                ...scene.sceneLinks
            ];

        sceneLinks[index] =
            message.url;

        const finalPart =
            index === scene.parts.length - 1;

        const nextPartAt =
            finalPart
                ? Date.now()
                : Date.now() + scene.interval_ms;

        const checkpointed =
            await checkpointScenePart(
                scene.id,
                index,
                sceneLinks,
                nextPartAt,
                finalPart
            );

        if (
            !checkpointed
        )
            return;

        const updated =
            await getActiveScene(
                scene.id
            );

        if (
            finalPart
        )
            await finishScene(
                channel,
                updated.id,
                updated.owner_id,
                updated.target_id,
                updated.category,
                updated.result,
                updated.sceneLinks,
                updated.author,
                updated.color
            );
        else
            schedulePornSceneRecord(
                client,
                updated
            );

    }
    catch (error) {

        await logError(
            client,
            {
                title: 'Porn Scene Part Failed',
                error,
                fields: [
                    {
                        name: '\uD83C\uDF9E\uFE0F Part',
                        value: `${index + 1}/${scene.parts.length}`,
                        inline: true
                    },
                    {
                        name: '\uD83D\uDC65 Users',
                        value: `<@${scene.owner_id}> + <@${scene.target_id}>`,
                        inline: false
                    }
                ]
            }
        );

        schedulePornSceneRecord(
            client,
            scene,
            60 * 1000
        );

    }

}

async function scheduleScene(
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

    const scene =
        await createActiveScene({
            sceneType: 'porn',
            channelId: channel.id,
            ownerId: requesterId,
            targetId,
            category: sceneCategory,
            parts: phases,
            result,
            title: sceneTitle,
            author: requesterAuthor,
            color: sceneColor,
            intervalMs,
            nextPartAt: Date.now()
        });

    const studioScene =
        await attachScene(
            scene
        );

    return {
        scene,
        studioScene
    };

}

async function restorePornScenes(
    client,
    scenes = null
) {

    const activeScenes =
        scenes ??
        await getRestorableScenes();

    const pornScenes =
        activeScenes.filter(
            (scene) =>
                scene.scene_type === 'porn'
        );

    for (
        const scene of pornScenes
    ) {

        setSceneBusy(
            scene.owner_id,
            scene.target_id,
            {
                channelId: scene.channel_id,
                startedAt: scene.created_at
            }
        );

        schedulePornSceneRecord(
            client,
            scene
        );

    }

    return pornScenes.length;

}

module.exports = {
    restorePornScenes,
    scheduleScene,
    startScheduledScene:
        schedulePornSceneRecord
};
