const fs =
    require('fs');

const path =
    require('path');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    getMemberCategory
} = require('../../utils/userCategory');

const {
    addCoins,
    addRanking,
    addScene,
    addXP,
    getOrCreateUser
} = require('../../utils/users');

const {
    getRankTitle
} = require('../../utils/ranks');

const emojis =
    require('../../utils/emojis');

const {
    clearSceneBusy,
    getPendingRequest,
    isBusy,
    removePendingRequest,
    setSceneBusy
} = require('../../utils/pornScenes');

const {
    boosterTiers
} = require('../../utils/boosters');

const {
    formatBooster
} = require('./pornSceneRequest');

const sceneRoot =
    path.join(
        __dirname,
        '..',
        '..',
        'data',
        'scenes'
    );

const adpLogoPath =
    path.join(
        __dirname,
        '..',
        '..',
        'assets',
        'ADP_logo.png'
    );

const adpLogoAttachment =
    'attachment://ADP_logo.png';

const sceneNames =
    require('../../data/scenes/sceneName.json');

const phaseLabels = {
    foreplay: 'Foreplay',
    oral: 'Oral',
    sex: 'Sex',
    finale: 'Finale'
};

function getSceneCategory(
    firstCategory,
    secondCategory
) {

    const categories =
        [
            firstCategory,
            secondCategory
        ];

    const maleCategory =
        categories.find(
            (category) =>
                category.endsWith(
                    'm'
                )
        );

    const femaleCategories =
        categories.filter(
            (category) =>
                category.endsWith(
                    'f'
                )
        );

    if (
        maleCategory &&
        femaleCategories.length === 1
    )
        return `${maleCategory}_${femaleCategories[0]}`;

    if (
        femaleCategories.length === 2
    ) {

        const uniqueCategories =
            [...new Set(
                femaleCategories
            )];

        return uniqueCategories.length === 1
            ? `${uniqueCategories[0]}_${uniqueCategories[0]}`
            : 'wf_bf';

    }

    return null;

}

function randomInt(
    min,
    max
) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            value,
            max
        )
    );

}

function buildPhaseOrder(
    totalParts
) {

    const orders = {
        3: [
            'foreplay',
            'sex',
            'finale'
        ],
        4: [
            'foreplay',
            'oral',
            'sex',
            'finale'
        ],
        5: [
            'foreplay',
            'oral',
            'sex',
            'sex',
            'finale'
        ],
        6: [
            'foreplay',
            'foreplay',
            'oral',
            'sex',
            'sex',
            'finale'
        ],
        7: [
            'foreplay',
            'foreplay',
            'oral',
            'oral',
            'sex',
            'sex',
            'finale'
        ],
        8: [
            'foreplay',
            'foreplay',
            'oral',
            'oral',
            'sex',
            'sex',
            'sex',
            'finale'
        ]
    };

    return orders[totalParts];

}

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
    partNumber,
    totalParts,
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

function getBoostValue(
    booster,
    stat
) {

    if (
        !booster ||
        booster.stat !== stat
    )
        return 0;

    return boosterTiers[booster.tier].value;

}

function formatStatValue(
    value,
    boost
) {

    if (
        boost <= 0
    )
        return `${value}`;

    return `${value}+${boost}`;

}

function calculateScene(
    requesterUser,
    targetUser,
    booster = null
) {

    const requesterPerformanceBoost =
        getBoostValue(
            booster,
            'performance'
        );

    const requesterStaminaBoost =
        getBoostValue(
            booster,
            'stamina'
        );

    const requesterFameBoost =
        getBoostValue(
            booster,
            'fame'
        );

    const requesterPerformance =
        requesterUser.performance +
        requesterPerformanceBoost;

    const requesterStamina =
        requesterUser.stamina +
        requesterStaminaBoost;

    const requesterFame =
        requesterUser.fame +
        requesterFameBoost;

    const combinedPerformance =
        requesterPerformance +
        targetUser.performance;

    const combinedStamina =
        requesterStamina +
        targetUser.stamina;

    const combinedFame =
        requesterFame +
        targetUser.fame;

    const performanceBonus =
        Math.floor(
            combinedPerformance / 10
        );

    const staminaBonus =
        Math.floor(
            combinedStamina / 10
        );

    const fameBonus =
        Math.floor(
            combinedFame / 10
        );

    const totalParts =
        clamp(
            4 + staminaBonus,
            4,
            8
        );

    const xp =
        25 +
        (combinedPerformance * 3) +
        (performanceBonus * 25);

    const viewers =
        100 +
        (combinedFame * 50) +
        (fameBonus * 500) +
        randomInt(
            0,
            250
        );

    const coins =
        Math.max(
            25,
            Math.floor(
                viewers / 10
            )
        );

    const score =
        randomInt(
            1,
            100
        ) +
        Math.floor(
            xp / 10
        ) +
        (totalParts * 4) +
        Math.floor(
            viewers / 100
        );

    let outcome = 'Awkward Scene';
    let rankingChange = -8;

    if (
        score >= 115
    ) {
        outcome = 'Viral Hit';
        rankingChange = 20;
    }
    else if (
        score >= 85
    ) {
        outcome = 'Hot Scene';
        rankingChange = 12;
    }
    else if (
        score >= 55
    ) {
        outcome = 'Solid Scene';
        rankingChange = 5;
    }

    return {
        totalParts,
        score,
        outcome,
        rankingChange,
        xp,
        viewers,
        coins,
        combinedPerformance,
        combinedStamina,
        combinedFame,
        requesterPerformance,
        requesterStamina,
        requesterFame,
        requesterPerformanceBoost,
        requesterStaminaBoost,
        requesterFameBoost,
        booster
    };

}

function getIntervalMs(
    totalParts
) {

    if (
        totalParts <= 1
    )
        return 0;

    return Math.min(
        randomInt(
            8,
            12
        ) * 60 * 1000,
        Math.floor(
            60 * 60 * 1000 / (totalParts - 1)
        )
    );

}

async function applyRewards(
    requesterId,
    targetId,
    result
) {

    await Promise.all([
        addXP(
            requesterId,
            result.xp
        ),
        addXP(
            targetId,
            result.xp
        ),
        addCoins(
            requesterId,
            result.coins
        ),
        addCoins(
            targetId,
            result.coins
        ),
        addRanking(
            requesterId,
            result.rankingChange
        ),
        addRanking(
            targetId,
            result.rankingChange
        ),
        addScene(
            requesterId
        ),
        addScene(
            targetId
        )
    ]);

}

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
        );

    if (
        rumorsChannel
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

        await rumorsChannel.send({
            embeds: [
                embed
            ],
            files: [
                adpLogoPath
            ]
        });

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
                                    index + 1,
                                    result.totalParts,
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

async function fetchGuildMember(
    interaction,
    userId
) {

    const guild =
        interaction.client.guilds.cache.get(
            process.env.GUILD_ID
        ) ??
        await interaction.client.guilds.fetch(
            process.env.GUILD_ID
        );

    return guild.members.fetch(
        userId
    );

}

async function acceptScene(
    interaction,
    requesterId,
    targetId
) {

    if (
        interaction.user.id !== targetId
    ) {

        await interaction.reply({
            content:
                'Only the requested partner can accept this scene.',
            flags: 64
        });

        return;

    }

    if (
        isBusy(
            requesterId
        ) ||
        isBusy(
            targetId
        )
    ) {

        await interaction.reply({
            content:
                'One of you is currently filming another scene. Try accepting again later.',
            flags: 64
        });

        return;

    }

    const requesterMember =
        await fetchGuildMember(
            interaction,
            requesterId
        );

    const targetMember =
        await fetchGuildMember(
            interaction,
            targetId
        );

    let sceneCategory;

    try {

        sceneCategory =
            getSceneCategory(
                getMemberCategory(
                    requesterMember
                ),
                getMemberCategory(
                    targetMember
                )
            );

    }
    catch (error) {

        await interaction.reply({
            content:
                `Missing role info: ${error.message}`,
            flags: 64
        });

        return;

    }

    if (
        !sceneCategory
    ) {

        await interaction.reply({
            content:
                'No matching scene category exists for this role combination.',
            flags: 64
        });

        return;

    }

    const channel =
        interaction.client.channels.cache.get(
            CHANNELS.PORN_CAREER
        ) ??
        await interaction.client.channels.fetch(
            CHANNELS.PORN_CAREER
        );

    if (
        !channel
    ) {

        await interaction.reply({
            content:
                'I could not find the porn career channel.',
            flags: 64
        });

        return;

    }

    const requesterUser =
        await getOrCreateUser(
            requesterId
        );

    const targetUser =
        await getOrCreateUser(
            targetId
        );

    const pendingRequest =
        getPendingRequest(
            requesterId,
            targetId
        );

    const booster =
        pendingRequest?.booster ?? null;

    const result =
        calculateScene(
            requesterUser,
            targetUser,
            booster
        );

    const sceneTitle =
        getRandomSceneName();

        const requesterAuthor = {
            name:
                `${requesterMember.displayName} - ${getRankTitle(
                    requesterUser.ranking
                )} (${requesterUser.ranking})`,
            icon:
                adpLogoAttachment,
            thumbnail:
                requesterMember.user.displayAvatarURL()
        };

    setSceneBusy(
        requesterId,
        targetId,
        {
            channelId:
                CHANNELS.PORN_CAREER,
            startedAt:
                Date.now()
        }
    );

    removePendingRequest(
        requesterId,
        targetId
    );

    await interaction.update({
        content:
            'Scene accepted. Filming has started.',
        embeds:
            [],
        components: [],
        attachments: []
    });

    const rumorsChannel =
        interaction.client.channels.cache.get(
            CHANNELS.RUMORS
        ) ??
        await interaction.client.channels.fetch(
            CHANNELS.RUMORS
        );

    if (
        rumorsChannel
    ) {

        await rumorsChannel.send({
            embeds: [
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
                    )
            ],
            files: [
                adpLogoPath
            ]
        });

    }

    scheduleScene(
        channel,
        requesterId,
        targetId,
        sceneCategory,
        result,
        sceneTitle,
        requesterAuthor
    );

}

async function declineScene(
    interaction,
    requesterId,
    targetId
) {

    if (
        interaction.user.id !== targetId
    ) {

        await interaction.reply({
            content:
                'Only the requested partner can decline this scene.',
            flags: 64
        });

        return;

    }

    removePendingRequest(
        requesterId,
        targetId
    );

    await interaction.update({
        content:
            'Scene request declined.',
        embeds:
            [],
        components: [],
        attachments: []
    });

}

module.exports = {

    async execute(
        interaction
    ) {

        const [
            action,
            requesterId,
            targetId
        ] =
            interaction.customId.split(
                ':'
            );

        if (
            action === 'pornscene_accept'
        ) {

            await acceptScene(
                interaction,
                requesterId,
                targetId
            );

            return;

        }

        if (
            action === 'pornscene_decline'
        ) {

            await declineScene(
                interaction,
                requesterId,
                targetId
            );

        }

    }

};
