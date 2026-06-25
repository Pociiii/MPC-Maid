const path =
    require('path');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    pickFlavor
} = require('../../utils/rumors');

const {
    commandFooter
} = require('../../utils/version');

const {
    formatBooster
} = require('../../utils/boosters');

const {
    getSmartGifFromFile
} = require('../../utils/gifs');

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

const sceneNamesByCast =
    require('../../data/scenes/sceneNamesByCast.json');

function hashString(
    value
) {

    let hash =
        2166136261;

    for (
        let index = 0;
        index < value.length;
        index += 1
    ) {

        hash ^= value.charCodeAt(
            index
        );

        hash +=
            (hash << 1) +
            (hash << 4) +
            (hash << 7) +
            (hash << 8) +
            (hash << 24);

    }

    return hash >>> 0;

}

function hueToRgb(
    p,
    q,
    t
) {

    let normalized =
        t;

    if (
        normalized < 0
    )
        normalized += 1;

    if (
        normalized > 1
    )
        normalized -= 1;

    if (
        normalized < 1 / 6
    )
        return p + ((q - p) * 6 * normalized);

    if (
        normalized < 1 / 2
    )
        return q;

    if (
        normalized < 2 / 3
    )
        return p + ((q - p) * (2 / 3 - normalized) * 6);

    return p;

}

function hslToHex(
    hue,
    saturation,
    lightness
) {

    const h =
        hue / 360;

    const s =
        saturation / 100;

    const l =
        lightness / 100;

    const q =
        l < 0.5
            ? l * (1 + s)
            : l + s - (l * s);

    const p =
        (2 * l) - q;

    const rgb = [
        hueToRgb(
            p,
            q,
            h + (1 / 3)
        ),
        hueToRgb(
            p,
            q,
            h
        ),
        hueToRgb(
            p,
            q,
            h - (1 / 3)
        )
    ].map(
        (channel) =>
            Math.round(
                channel * 255
            )
                .toString(
                    16
                )
                .padStart(
                    2,
                    '0'
                )
    );

    return `#${rgb.join(
        ''
    )}`;

}

function getScenePairColor(
    firstUserId,
    secondUserId
) {

    const pairKey =
        [
            firstUserId,
            secondUserId
        ]
            .sort()
            .join(
                ':'
            );

    const hue =
        hashString(
            pairKey
        ) % 360;

    return hslToHex(
        hue,
        82,
        58
    );

}

function getSceneNameType(
    sceneCategory
) {

    if (
        !sceneCategory
    )
        return 'shared';

    const cast =
        sceneCategory.split(
            '_'
        );

    if (
        cast.every(
            (part) =>
                part.endsWith(
                    'f'
                )
        )
    )
        return 'ff';

    if (
        cast.some(
            (part) =>
                part.endsWith(
                    'm'
                )
        ) &&
        cast.some(
            (part) =>
                part.endsWith(
                    'f'
                )
        )
    )
        return 'mf';

    return 'shared';

}

function getRandomSceneName(
    sceneCategory
) {

    const type =
        getSceneNameType(
            sceneCategory
        );

    const sceneNames = [
        ...(sceneNamesByCast[type] ?? []),
        ...(sceneNamesByCast.shared ?? [])
    ];

    return sceneNames[
        Math.floor(
            Math.random() *
            sceneNames.length
        )
    ];

}

function getRandomSceneGif(
    sceneCategory,
    phase,
    userIds = []
) {

    const filePath =
        path.join(
            sceneRoot,
            sceneCategory,
            `${phase}.json`
        );

    return getSmartGifFromFile(
        filePath,
        userIds
    );

}

function getPhaseFlavor(
    phase
) {

    const flavors = {
        foreplay:
            'The cameras are live and the scene is warming up.',
        oral:
            'The room is locked in and the viewers are climbing.',
        sex:
            'The recording hits its main act.',
        finale:
            'The last take is rolling.'
    };

    return flavors[phase] ??
        'The recording keeps rolling.';

}

function buildPartEmbed(
    requesterId,
    targetId,
    sceneCategory,
    phase,
    sceneTitle,
    requesterAuthor,
    sceneColor,
    result,
    partIndex
) {

    const gif =
        getRandomSceneGif(
            sceneCategory,
            phase,
            [
                requesterId,
                targetId
            ]
        );

    const totalParts =
        result?.totalParts ?? 1;

    const viewerCount =
        result?.partViewers?.[partIndex] ??
        result?.viewers ??
        0;

    const phaseLabel =
        `${phase.charAt(
            0
        ).toUpperCase()}${phase.slice(
            1
        )}`;

    const embed =
        createEmbed({
        color:
            sceneColor,
        authorName:
            requesterAuthor.name,
        authorIcon:
            requesterAuthor.icon,
        thumbnail:
            requesterAuthor.thumbnail,
        title:
            sceneTitle,
        description:
            `<@${requesterId}> and <@${targetId}> are recording part ${partIndex + 1}/${totalParts}.\n${getPhaseFlavor(
                phase
            )}`,
        image:
            gif.url,
        footerText:
            commandFooter(
                '/pornscene',
                `GIF #${gif.index}/${gif.total}`
            ),
        timestamp:
            true
    });

    embed.addFields(
        {
            name:
                'Viewers',
            value:
                `**${viewerCount}** watching now`,
            inline:
                true
        },
        {
            name:
                'Scene Part',
            value:
                phaseLabel,
            inline:
                true
        }
    );

    return embed;

}

function buildFinalEmbed(
    requesterId,
    targetId,
    result,
    sceneLinks,
    requesterAuthor,
    sceneColor
) {

    const rankingPrefix =
        result.rankingChange >= 0
            ? '+'
            : '';

    const finalTitle =
        result.criticalScene
            ? 'Midnight Headline'
            : 'Porn Scene Finished';

    const embed =
        createEmbed({
            color:
                sceneColor,
            authorName:
                requesterAuthor.name,
            authorIcon:
                requesterAuthor.icon,
            thumbnail:
                requesterAuthor.thumbnail,
            title:
                finalTitle,
            description:
                `${pickFlavor(
                    'scene_final'
                )}\n\n<@${requesterId}> and <@${targetId}> finished their scene.`,
            footerText:
                commandFooter(
                    '/pornscene'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                '🎬 Outcome',
            value:
                result.criticalScene
                    ? `**${result.outcome}**\n\uD83C\uDFB2 Critical Scene`
                    : `**${result.outcome}**`,
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
                [
                    `**${result.xp} each**`,
                    result.criticalScene
                        ? '+10 crit bonus'
                        : null,
                    result.staminaXpBonus > 0
                        ? `+${result.staminaXpBonus} stamina bonus`
                        : null
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        '\n'
                    ),
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
    formatStatValue,
    sceneColor
) {

    return createEmbed({
        color:
            sceneColor,
        authorName:
            requesterAuthor.name,
        authorIcon:
            requesterAuthor.icon,
        thumbnail:
            requesterAuthor.thumbnail,
        title:
            sceneTitle,
        description:
`${pickFlavor(
    'scene_start'
)}

<@${requesterId}> and <@${targetId}> are starting a scene.

Parts: **${result.totalParts}**
Booster: **${formatBooster(
    booster
)}**`,
        footerText:
            commandFooter(
                '/pornscene'
            ),
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
                    )} + ${targetUser.performance} = ${result.combinedPerformance}
Score: **+${result.performanceScoreBonus}**`,
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
                    )} + ${targetUser.stamina} = ${result.combinedStamina}
Score: **+${result.staminaScoreBonus}**`,
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
                    )} + ${targetUser.fame} = ${result.combinedFame}
Score: **+${result.fameScoreBonus}**`,
                inline:
                    true
            }
        );

}

module.exports = {
    buildFinalEmbed,
    buildPartEmbed,
    buildStartEmbed,
    getScenePairColor,
    getRandomSceneName
};
