const path =
    require('path');

const {
    createUserEmbed
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

const sceneDurationMs =
    30 * 60 * 1000;

const sceneRoot =
    path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scenes'
    );

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
    interaction,
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
                interaction.user.id
            ]
        );

    return createUserEmbed(
        interaction,
        {
        command:
            '/customscene',
        footerDetail:
            `Part ${index + 1}/${totalParts} - GIF #${gif.index}/${gif.total}`,
        title:
            sceneTitle,
        description:
            `Custom scene from <@${interaction.user.id}>`,
        image:
            gif.url
        }
    );

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

function scheduleCustomScene(
    channel,
    interaction,
    cast,
    parts
) {

    const intervalMs =
        getPartIntervalMs(
            parts.length
        );

    const sceneTitle =
        getRandomSceneName(
            cast
        );

    parts.forEach(
        (part, index) => {

            setTimeout(
                async () => {

                    try {

                        await channel.send({
                            embeds: [
                                buildSceneEmbed(
                                    interaction,
                                    cast,
                                    part,
                                    index,
                                    parts.length,
                                    sceneTitle
                                )
                            ]
                        });

                    }
                    catch (error) {

                        console.error(
                            'CUSTOM SCENE ERROR'
                        );
                        console.error(
                            error
                        );

                        await logError(
                            channel.client,
                            {
                                title:
                                    'Custom Scene Part Failed',
                                error,
                                fields: [
                                    {
                                        name:
                                            '\uD83C\uDF9E\uFE0F Part',
                                        value:
                                            `${index + 1}/${parts.length}`,
                                        inline:
                                            true
                                    },
                                    {
                                        name:
                                            '\uD83D\uDCC1 Category',
                                        value:
                                            `${cast}/${part}`,
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
                                            '\uD83D\uDC64 User',
                                        value:
                                            `<@${interaction.user.id}>`,
                                        inline:
                                            true
                                    }
                                ]
                            }
                        );

                    }

                },
                index * intervalMs
            );

        }
    );

}

module.exports = {
    scheduleCustomScene
};
