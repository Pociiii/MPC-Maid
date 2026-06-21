const fs =
    require('fs');

const path =
    require('path');

const {
    createUserEmbed
} = require('../../utils/embeds');

const {
    logError
} = require('../../utils/inboxLogger');

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
    phase
) {

    const filePath =
        path.join(
            sceneRoot,
            cast,
            `${phase}.json`
        );

    const gifs =
        JSON.parse(
            fs.readFileSync(
                filePath,
                'utf8'
            )
        );

    const index =
        Math.floor(
            Math.random() * gifs.length
        );

    return {
        url:
            gifs[index],
        index:
            index + 1,
        total:
            gifs.length
    };

}

function buildSceneEmbed(
    interaction,
    cast,
    part,
    index,
    totalParts
) {

    const gif =
        getRandomSceneGif(
            cast,
            part
        );

    return createUserEmbed(
        interaction,
        {
        command:
            '/customscene',
        footerDetail:
            `Part ${index + 1}/${totalParts} - GIF #${gif.index}/${gif.total}`,
        title:
            `Part ${index + 1}`,
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
                                    parts.length
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
                                            'Part',
                                        value:
                                            `${index + 1}/${parts.length}`,
                                        inline:
                                            true
                                    },
                                    {
                                        name:
                                            'Category',
                                        value:
                                            `${cast}/${part}`,
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
                                            'User',
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
