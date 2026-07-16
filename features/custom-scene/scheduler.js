const path =
    require('path');

const {
    createEmbed,
    getDisplayName
} = require('../../utils/embeds');

const {
    logError
} = require('../../utils/inboxLogger');

const {
    getSmartGifFromFile
} = require('../../utils/gifs');

const {
    getRandomSceneName
} = require('../porn-career/sceneEmbeds');

const {
    checkpointScenePart,
    createActiveScene,
    getActiveScene,
    getRestorableScenes,
    markSceneCompleted
} = require('../../database/activeScenes');

const {
    commandFooter
} = require('../../utils/version');

const {
    getRuntimeDataPath
} = require('../../utils/runtimeData');

const sceneDurationMs =
    30 * 60 * 1000;

const sceneRoot =
    getRuntimeDataPath(
        'scenes'
    );

const sceneTimers =
    new Map();

function getRandomSceneGif(
    cast,
    phase,
    userIds = []
) {

    const filePath =
        path.join(
            sceneRoot,
            cast,
            `${phase}.json`
        );

    return getSmartGifFromFile(
        filePath,
        userIds
    );

}

function buildSceneEmbed(
    scene,
    cast,
    part,
    index,
    totalParts,
    sceneTitle
) {

    const gif =
        getRandomSceneGif(
            cast,
            part,
            [
                scene.owner_id
            ]
        );

    return createEmbed({
        color:
            scene.color,
        authorName:
            scene.author.name,
        authorIcon:
            scene.author.icon,
        thumbnail:
            scene.author.thumbnail,
        footerText:
            commandFooter(
                '/customscene',
                `Part ${index + 1}/${totalParts} - GIF #${gif.index}/${gif.total}`
            ),
        title:
            sceneTitle,
        description:
            `Custom scene from <@${scene.owner_id}>`,
        image:
            gif.url,
        timestamp:
            true
    });

}

function getPartIntervalMs(
    totalParts
) {

    if (
        totalParts <= 1
    )
        return 0;

    return Math.floor(
        sceneDurationMs / (totalParts - 1)
    );

}

function scheduleCustomSceneRecord(
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
                void postNextCustomScenePart(
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

async function postNextCustomScenePart(
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
        scene.status !== 'running'
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

        scheduleCustomSceneRecord(
            client,
            scene,
            60 * 1000
        );

        return;

    }

    const index =
        scene.next_part_index;

    const part =
        scene.parts[index];

    if (
        !part
    )
        return;

    try {

        const message =
            await channel.send({
                embeds: [
                    buildSceneEmbed(
                        scene,
                        scene.category,
                        part,
                        index,
                        scene.parts.length,
                        scene.title
                    )
                ]
            });

        const sceneLinks =
            [
                ...scene.sceneLinks
            ];

        sceneLinks[index] =
            message.url;

        const finalPart =
            index === scene.parts.length - 1;

        const checkpointed =
            await checkpointScenePart(
                scene.id,
                index,
                sceneLinks,
                finalPart
                    ? Date.now()
                    : Date.now() + scene.interval_ms,
                finalPart
            );

        if (
            !checkpointed
        )
            return;

        if (
            finalPart
        )
            await markSceneCompleted(
                scene.id
            );
        else
            scheduleCustomSceneRecord(
                client,
                await getActiveScene(
                    scene.id
                )
            );

    }
    catch (error) {

        await logError(
            client,
            {
                title: 'Custom Scene Part Failed',
                error,
                fields: [
                    {
                        name: '\uD83C\uDF9E\uFE0F Part',
                        value: `${index + 1}/${scene.parts.length}`,
                        inline: true
                    },
                    {
                        name: '\uD83D\uDCC1 Category',
                        value: `${scene.category}/${part}`,
                        inline: true
                    },
                    {
                        name: '\uD83D\uDC64 User',
                        value: `<@${scene.owner_id}>`,
                        inline: true
                    }
                ]
            }
        );

        scheduleCustomSceneRecord(
            client,
            scene,
            60 * 1000
        );

    }

}

async function scheduleCustomScene(
    channel,
    interaction,
    cast,
    parts
) {

    const intervalMs =
        getPartIntervalMs(
            parts.length
        );

    const scene =
        await createActiveScene({
            sceneType: 'custom',
            channelId: channel.id,
            ownerId: interaction.user.id,
            category: cast,
            parts,
            title: getRandomSceneName(
                cast
            ),
            author: {
                name: getDisplayName(
                    interaction.member ??
                    interaction.user
                ),
                icon: interaction.user.displayAvatarURL(),
                thumbnail: interaction.user.displayAvatarURL()
            },
            intervalMs,
            nextPartAt: Date.now()
        });

    scheduleCustomSceneRecord(
        channel.client,
        scene
    );

    return scene;

}

async function restoreCustomScenes(
    client,
    scenes = null
) {

    const activeScenes =
        scenes ??
        await getRestorableScenes();

    const customScenes =
        activeScenes.filter(
            (scene) =>
                scene.scene_type === 'custom'
        );

    for (
        const scene of customScenes
    )
        if (
            scene.status === 'finalizing'
        )
            await markSceneCompleted(
                scene.id
            );
        else
            scheduleCustomSceneRecord(
                client,
                scene
            );

    return customScenes.length;

}

module.exports = {
    restoreCustomScenes,
    scheduleCustomScene
};
