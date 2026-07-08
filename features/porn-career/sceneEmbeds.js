const path =
    require('path');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getSceneCategoryLabel
} = require('../../data/sceneSubmitGroups');

const {
    ECONOMY
} = require('../../data/constants');

const {
    pickMomentFlavor
} = require('../../utils/moments');

const {
    pickOne
} = require('../../utils/flavorText');

const {
    commandFooter
} = require('../../utils/version');

const {
    formatBooster
} = require('../../utils/boosters');

const {
    getSmartGifFromFile
} = require('../../utils/gifs');

const {
    getRuntimeDataPath
} = require('../../utils/runtimeData');

const {
    getRequesterSceneXp,
    getTargetSceneXp,
    normalizeSceneRewardBonuses
} = require('./sceneRewards');

const sceneRoot =
    getRuntimeDataPath(
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
        foreplay: [
            'The cameras are live and the scene is warming up.',
            'The studio lights settle in while the room leans closer.',
            'A slow opening beat gives everyone time to lock in.',
            'The first take starts soft, but the attention is already there.',
            'The setup is done, and the chemistry is starting to show.',
            'The room gets quiet in that very interested way.'
        ],
        oral: [
            'The room is locked in and the viewers are climbing.',
            'The recording slips into a closer, warmer rhythm.',
            'The crowd response starts climbing with every minute.',
            'The camera stays close while the scene finds its pulse.',
            'The energy narrows in, and the viewers follow it.',
            'The set feels smaller now, in the best possible way.'
        ],
        sex: [
            'The recording hits its main act.',
            'The scene opens up and the viewer count follows.',
            'The main stretch lands with clear crowd attention.',
            'The studio pace turns heavier and more confident.',
            'The chemistry has stopped warming up and started carrying the room.',
            'The feed is watching the numbers climb in real time.'
        ],
        finale: [
            'The last take is rolling.',
            'The scene starts moving toward its final beat.',
            'The room stays close for the ending.',
            'The cameras hold steady while the final stretch lands.',
            'The last moments are getting the attention they deserve.',
            'The recording is almost wrapped, and the crowd knows it.'
        ]
    };

    return pickOne(
        flavors[phase],
        'The recording keeps rolling.'
    );

}

function sceneGroupForCategory(
    sceneCategory
) {

    return getSceneNameType(
        sceneCategory
    ) === 'ff'
        ? 'ff'
        : 'mf';

}

function formatSceneCategory(
    sceneCategory
) {

    return getSceneCategoryLabel(
        sceneGroupForCategory(
            sceneCategory
        ),
        sceneCategory
    );

}

function formatCast(
    requesterId,
    targetId,
    sceneCategory = null
) {

    return [
        `<@${requesterId}> + <@${targetId}>`,
        sceneCategory
            ? formatSceneCategory(
                sceneCategory
            )
            : null
    ]
        .filter(
            Boolean
        )
        .join(
            '\n'
        );

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

    const viewerCount =
        result?.partViewers?.[partIndex] ??
        result?.viewers ??
        0;

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
            getPhaseFlavor(
                phase
            ),
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
                '\uD83D\uDC65 Cast',
            value:
                formatCast(
                    requesterId,
                    targetId
                ),
            inline:
                false
        },
        {
            name:
                '\uD83D\uDCFA Viewers',
            value:
                `**${viewerCount}** watching now`,
            inline:
                true
        }
    );

    return embed;

}

function formatSignedNumber(
    value
) {

    return value >= 0
        ? `+${value}`
        : `${value}`;

}

function formatBonusNumber(
    value
) {

    return Number.isInteger(
        value
    )
        ? `${value}`
        : value.toFixed(
            1
        );

}

function formatSceneLinks(
    sceneLinks
) {

    if (
        sceneLinks.length === 0
    )
        return 'No part links recorded.';

    return sceneLinks
        .map(
            (link, index) =>
                `[${index + 1}](${link})`
        )
        .join(
            ' '
        );

}

function formatBonusNotes(
    notes
) {

    const filteredNotes =
        notes.filter(
            Boolean
        );

    return filteredNotes.length > 0
        ? ` (${filteredNotes.join(
            ', '
        )})`
        : '';

}

function formatXpRewards(
    requesterId,
    targetId,
    result,
    rewardBonuses
) {

    const normalizedBonuses =
        normalizeSceneRewardBonuses(
            rewardBonuses
        );

    const requesterNotes = [
        `+${ECONOMY.PORN_SCENE_STARTER_XP_BONUS} starter`,
        normalizedBonuses.requester.serverTag > 0
            ? `+${normalizedBonuses.requester.serverTag} MPC tag`
            : null
    ];

    const targetNotes = [
        normalizedBonuses.target.serverTag > 0
            ? `+${normalizedBonuses.target.serverTag} MPC tag`
            : null
    ];

    return [
        `<@${requesterId}>: **${getRequesterSceneXp(
            result,
            normalizedBonuses
        )} XP**${formatBonusNotes(
            requesterNotes
        )}`,
        `<@${targetId}>: **${getTargetSceneXp(
            result,
            normalizedBonuses
        )} XP**${formatBonusNotes(
            targetNotes
        )}`
    ]
        .join(
            '\n'
        );

}

function formatFinalSummary(
    result
) {

    return [
        `**${result.outcome}**`,
        `${result.viewers.toLocaleString()} viewers`,
        `${result.coins} coins each`,
        `${formatSignedNumber(
            result.rankingChange
        )} ranking`,
        `${result.totalParts} parts`,
        result.criticalScene
            ? 'critical'
            : null
    ]
        .filter(
            Boolean
        )
        .join(
            ' | '
        );

}

function buildFinalEmbed(
    requesterId,
    targetId,
    sceneCategory,
    result,
    sceneLinks,
    requesterAuthor,
    sceneColor,
    rewardBonuses
) {

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
                pickMomentFlavor(
                    'scene_final'
                ),
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
                '\uD83D\uDC65 Cast',
            value:
                formatCast(
                    requesterId,
                    targetId,
                    sceneCategory
                ),
            inline:
                false
        },
        {
            name:
                '\uD83C\uDFAC Result',
            value:
                formatFinalSummary(
                    result
                ),
            inline:
                false
        },
        {
            name:
                '\u2B50 XP Rewards',
            value:
                formatXpRewards(
                    requesterId,
                    targetId,
                    result,
                    rewardBonuses
                ),
            inline:
                false
        },
        {
            name:
                '\uD83D\uDD17 Scene Links',
            value:
                formatSceneLinks(
                    sceneLinks
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
    sceneCategory,
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
            pickMomentFlavor(
                'scene_start'
            ),
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
                    '\uD83D\uDC65 Cast',
                value:
                    formatCast(
                        requesterId,
                        targetId
                    ),
                inline:
                    false
            },
            {
                name:
                    '\uD83C\uDFAC Scene Setup',
                value:
                    `- Parts: **${result.totalParts}**
- Booster: **${formatBooster(
                        booster
                    )}**`,
                inline:
                    false
            },
            {
                name:
                    '\uD83D\uDCAA Performance',
                value:
                    `- Total: ${formatStatValue(
                        requesterUser.performance,
                        result.requesterPerformanceBoost
                    )} + ${targetUser.performance} = ${result.combinedPerformance}
- Score: **+${formatBonusNumber(
                        result.performanceScoreBonus
                    )}**`,
                inline:
                    true
            },
            {
                name:
                    '\u2764\uFE0F Stamina',
                value:
                    `- Total: ${formatStatValue(
                        requesterUser.stamina,
                        result.requesterStaminaBoost
                    )} + ${targetUser.stamina} = ${result.combinedStamina}
- Score: **+${formatBonusNumber(
                        result.staminaScoreBonus
                    )}**`,
                inline:
                    true
            },
            {
                name:
                    '\uD83D\uDC51 Fame',
                value:
                    `- Total: ${formatStatValue(
                        requesterUser.fame,
                        result.requesterFameBoost
                    )} + ${targetUser.fame} = ${result.combinedFame}
- Score: **+${formatBonusNumber(
                        result.fameScoreBonus
                    )}**`,
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
