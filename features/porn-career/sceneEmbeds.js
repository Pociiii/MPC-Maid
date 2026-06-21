const fs =
    require('fs');

const path =
    require('path');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

const {
    formatBooster
} = require('../../utils/boosters');

const emojis =
    require('../../utils/emojis');

const sceneRoot =
    path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scenes'
    );

const sceneNames =
    require('../../data/scenes/sceneName.json');

function getRandomSceneName() {

    return sceneNames[
        Math.floor(
            Math.random() *
            sceneNames.length
        )
    ];

}

function getRandomSceneGif(
    sceneCategory,
    phase
) {

    const filePath =
        path.join(
            sceneRoot,
            sceneCategory,
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

function buildPartEmbed(
    requesterId,
    targetId,
    sceneCategory,
    phase,
    sceneTitle,
    requesterAuthor
) {

    const gif =
        getRandomSceneGif(
            sceneCategory,
            phase
        );

    return createEmbed({
        color:
            getRandomColor(),
        authorName:
            requesterAuthor.name,
        authorIcon:
            requesterAuthor.icon,
        thumbnail:
            requesterAuthor.thumbnail,
        title:
            sceneTitle,
        description:
            `<@${requesterId}> and <@${targetId}> are filming a porn scene.`,
        image:
            gif.url,
        footerText:
            `/pornscene - GIF #${gif.index}/${gif.total}`,
        timestamp:
            true
    });

}

function buildFinalEmbed(
    requesterId,
    targetId,
    result,
    sceneLinks,
    requesterAuthor
) {

    const rankingPrefix =
        result.rankingChange >= 0
            ? '+'
            : '';

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            authorName:
                requesterAuthor.name,
            authorIcon:
                requesterAuthor.icon,
            thumbnail:
                requesterAuthor.thumbnail,
            title:
                'Porn Scene Finished',
            description:
                `<@${requesterId}> and <@${targetId}> finished their scene.`,
            footerText:
                '/pornscene',
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                '🎬 Outcome',
            value:
                `**${result.outcome}**`,
            inline:
                true
        },
        {
            name:
                '👀 Viewers',
            value:
                `**${result.viewers}**`,
            inline:
                true
        },
        {
            name:
                `${emojis.coin} Revenue`,
            value:
                `**${result.coins} coins each**`,
            inline:
                true
        },
        {
            name:
                '⭐ XP',
            value:
                `**${result.xp} each**`,
            inline:
                true
        },
        {
            name:
                '🏆 Ranking',
            value:
                `**${rankingPrefix}${result.rankingChange}**`,
            inline:
                true
        },
        {
            name:
                '🎞️ Parts',
            value:
                sceneLinks
                    .map(
                        (link, index) =>
                            `- Part ${index + 1}: ${link}`
                    )
                    .join(
                        '\n'
                    ),
            inline:
                false
        }
    );

    return embed;

}

function buildStartEmbed(
    requesterId,
    targetId,
    sceneTitle,
    result,
    requesterUser,
    targetUser,
    booster,
    requesterAuthor,
    formatStatValue
) {

    return createEmbed({
        color:
            getRandomColor(),
        authorName:
            requesterAuthor.name,
        authorIcon:
            requesterAuthor.icon,
        thumbnail:
            requesterAuthor.thumbnail,
        title:
            sceneTitle,
        description:
`<@${requesterId}> and <@${targetId}> are starting a scene.

Parts: **${result.totalParts}**
Booster: **${formatBooster(
    booster
)}**`,
        footerText:
            '/pornscene',
        timestamp:
            true
    })
        .addFields(
            {
                name:
                    'Performance',
                value:
                    `${formatStatValue(
                        requesterUser.performance,
                        result.requesterPerformanceBoost
                    )} + ${targetUser.performance} = ${result.combinedPerformance}`,
                inline:
                    true
            },
            {
                name:
                    'Stamina',
                value:
                    `${formatStatValue(
                        requesterUser.stamina,
                        result.requesterStaminaBoost
                    )} + ${targetUser.stamina} = ${result.combinedStamina}`,
                inline:
                    true
            },
            {
                name:
                    'Fame',
                value:
                    `${formatStatValue(
                        requesterUser.fame,
                        result.requesterFameBoost
                    )} + ${targetUser.fame} = ${result.combinedFame}`,
                inline:
                    true
            }
        );

}

module.exports = {
    buildFinalEmbed,
    buildPartEmbed,
    buildStartEmbed,
    getRandomSceneName
};
