const path =
    require('path');

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const ROLES =
    require('../../data/roles.json');

const gifts =
    require('../../data/gifts/gifts');

const {
    canonicalizeCastCategories
} = require('../../data/sceneSubmitGroups');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getOrCreateUser
} = require('../../utils/user/core');

const {
    clearUserBusy,
    isBusy,
    setUserBusy
} = require('../../utils/pornScenes');

const {
    boosterStatLabels
} = require('../../utils/boosters');

const {
    getSmartGifFromFile,
    getGifCount
} = require('../../utils/gifs');

const {
    getRuntimeDataPath
} = require('../../utils/runtimeData');

const {
    getRandomSceneName,
    getPhaseFlavor
} = require('../porn-career/sceneEmbeds');

const {
    getTwoPersonSceneCategory
} = require('../porn-career/sceneCommon');

const {
    trackDailyQuest
} = require('../daily-quests/dailyQuests');

const {
    applyRewardsOnce,
    checkpointPart,
    claimCastingSlot,
    createProduction,
    expireCasting,
    getLatestProductionType,
    getOpenCasting,
    getProduction,
    getRestorableProductions,
    markCompleted,
    setCastingMessage
} = require('../../database/communityProductions');

const {
    logError,
    logWarning
} = require('../../utils/inboxLogger');

const CASTING_MS =
    30 * 60 * 1000;

const SCENE_MS =
    60 * 60 * 1000;

const BONUS_REWARD_CHANCE =
    0.1;

const PARTS = [
    'foreplay',
    'foreplay',
    'foreplay',
    'sex',
    'sex',
    'sex',
    'sex',
    'finale'
];

const PART_INTERVAL_MS =
    Math.floor(
        SCENE_MS /
        (PARTS.length - 1)
    );

const productionTimers =
    new Map();

let castingTimer =
    null;

let creatingCasting =
    null;

function randomInt(
    minimum,
    maximum
) {

    return Math.floor(
        Math.random() *
        (maximum - minimum + 1)
    ) + minimum;

}

function weightedPick(
    entries,
    weightFor
) {

    const total =
        entries.reduce(
            (sum, entry) =>
                sum + weightFor(
                    entry
                ),
            0
        );

    let roll =
        Math.random() * total;

    for (
        const entry of entries
    ) {

        roll -= weightFor(
            entry
        );

        if (
            roll <= 0
        )
            return entry;

    }

    return entries[
        entries.length - 1
    ];

}

function pickProductionType(
    previousType = null
) {

    const choices = [
        {
            type:
                'MFM',
            weight:
                40
        },
        {
            type:
                'FMF',
            weight:
                40
        },
        {
            type:
                'FFF',
            weight:
                20
        }
    ].filter(
        (choice) =>
            choice.type !== previousType
    );

    return weightedPick(
        choices,
        (choice) =>
            choice.weight
    ).type;

}

function buildSlots(
    productionType
) {

    return productionType
        .split(
            ''
        )
        .map(
            (gender, index) => ({
                index,
                gender:
                    gender.toLowerCase(),
                userId:
                    null,
                category:
                    null
            })
        );

}

function getExactMemberCategory(
    member
) {

    const male =
        member.roles.cache.has(
            ROLES.MALE
        );

    const female =
        member.roles.cache.has(
            ROLES.FEMALE
        );

    const light =
        member.roles.cache.has(
            ROLES.LIGHT_SKIN
        );

    const dark =
        member.roles.cache.has(
            ROLES.DARK_SKIN
        );

    if (
        male === female
    )
        return {
            error:
                male
                    ? 'You cannot join while you have both gender roles.'
                    : 'You need a gender role before joining.'
        };

    if (
        light === dark
    )
        return {
            error:
                light
                    ? 'You cannot join while you have both skin-tone roles.'
                    : 'You need a skin-tone role before joining.'
        };

    return {
        category:
            `${dark ? 'b' : 'w'}${male ? 'm' : 'f'}`
    };

}

function formatSlots(
    slots
) {

    return slots.map(
        (slot) => {

            const icon =
                slot.gender === 'm'
                    ? '\uD83D\uDC68'
                    : '\uD83D\uDC69';

            return `${icon} ${slot.gender === 'm' ? 'Male' : 'Female'}\n${
                slot.userId
                    ? `\u2705 <@${slot.userId}>`
                    : '\u2B1C Available'
            }`;

        }
    ).join(
        '\n\n'
    );

}

function buildCastingEmbed(
    production,
    guild,
    state = production.status
) {

    const serverIcon =
        guild?.iconURL?.() ??
        undefined;

    const description =
        state === 'expired'
            ? 'This casting call expired before the cast was completed.'
            : state === 'running'
                ? 'Casting is locked. Production has started.'
                : 'Join an official MPC community production.';

    const embed =
        createEmbed({
            color:
                production.color,
            authorName:
                'Midnight Pleasure Club',
            authorIcon:
                serverIcon,
            thumbnail:
                serverIcon,
            title:
                '\uD83C\uDFAC Community Production Casting Call',
            description,
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                'Scene',
            value:
                production.title,
            inline:
                true
        },
        {
            name:
                'Type',
            value:
                production.production_type,
            inline:
                true
        },
        {
            name:
                state === 'running' ||
                state === 'finalizing' ||
                state === 'completed'
                    ? 'Scene Started'
                    : 'Casting Closes',
            value:
                state === 'running' ||
                state === 'finalizing' ||
                state === 'completed'
                    ? production.sceneLinks[0]
                        ? `[View first part](${production.sceneLinks[0]})`
                        : 'Starting now\u2026'
                    : `<t:${Math.floor(production.casting_closes_at / 1000)}:R>`,
            inline:
                true
        },
        {
            name:
                'Requirements',
            value:
                '\u2022 Performance 10+\n\u2022 Stamina 10+\n\u2022 Fame 10+',
            inline:
                false
        },
        {
            name:
                'Cast',
            value:
                formatSlots(
                    production.slots
                ),
            inline:
                false
        },
        {
            name:
                'Guaranteed Rewards',
            value:
                '\uD83E\uDE99 150\u2013225 Coins\n\u2B50 40\u201355 XP',
            inline:
                false
        },
        {
            name:
                'Possible Bonuses',
            value:
                '\u26A1 10% chance of a weighted Booster\n\uD83C\uDF81 10% chance of a weighted Gift',
            inline:
                false
        }
    );

    return embed;

}

function castingComponents(
    production
) {

    if (
        production.status !== 'casting'
    )
        return [];

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `community_join:${production.id}`
                    )
                    .setLabel(
                        'Join Production'
                    )
                    .setEmoji(
                        '\uD83C\uDFAC'
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    )
            )
    ];

}

async function fetchChannel(
    client,
    channelId
) {

    return client.channels.cache.get(
        channelId
    ) ??
        await client.channels.fetch(
            channelId
        ).catch(
            () => null
        );

}

async function updateCastingMessage(
    client,
    production
) {

    const channel =
        await fetchChannel(
            client,
            production.casting_channel_id
        );

    if (
        !channel?.messages
    )
        return false;

    const message =
        production.casting_message_id
            ? await channel.messages.fetch(
                production.casting_message_id
            ).catch(
                () => null
            )
            : null;

    if (
        !message
    )
        return false;

    await message.edit({
        embeds: [
            buildCastingEmbed(
                production,
                channel.guild
            )
        ],
        components:
            castingComponents(
                production
            )
    });

    return true;

}

async function postCasting(
    client,
    production
) {

    const channel =
        await fetchChannel(
            client,
            production.casting_channel_id
        );

    if (
        !channel?.send
    )
        throw new Error(
            `Casting channel ${production.casting_channel_id} is unavailable.`
        );

    const message =
        await channel.send({
            embeds: [
                buildCastingEmbed(
                    production,
                    channel.guild
                )
            ],
            components:
                castingComponents(
                    production
                )
        });

    await setCastingMessage(
        production.id,
        message.id
    );

    return getProduction(
        production.id
    );

}

function scheduleCastingRotation(
    client,
    closesAt
) {

    if (
        castingTimer
    )
        clearTimeout(
            castingTimer
        );

    castingTimer =
        setTimeout(
            () =>
                void rotateCasting(
                    client
                ),
            Math.max(
                0,
                closesAt - Date.now()
            )
        );

    castingTimer.unref?.();

}

async function createNextCasting(
    client,
    closesAt = Date.now() + CASTING_MS
) {

    if (
        creatingCasting
    )
        return creatingCasting;

    creatingCasting =
        (async () => {

            const existing =
                await getOpenCasting();

            if (
                existing
            ) {

                scheduleCastingRotation(
                    client,
                    existing.casting_closes_at
                );

                return existing;

            }

            const productionType =
                pickProductionType(
                    await getLatestProductionType()
                );

            let production =
                await createProduction({
                    productionType,
                    title:
                        getRandomSceneName(
                            productionType === 'FFF'
                                ? 'wf_wf_wf'
                                : 'wm_wf_wf'
                        ),
                    castingChannelId:
                        CHANNELS.CASTING_CALL,
                    sceneChannelId:
                        CHANNELS.PORN_CAREER,
                    slots:
                        buildSlots(
                            productionType
                        ),
                    parts:
                        PARTS,
                    castingClosesAt:
                        closesAt,
                    color:
                        getRandomColor()
                });

            production =
                await postCasting(
                    client,
                    production
                );

            scheduleCastingRotation(
                client,
                production.casting_closes_at
            );

            return production;

        })().finally(
            () => {
                creatingCasting = null;
            }
        );

    return creatingCasting;

}

async function rotateCasting(
    client
) {

    castingTimer =
        null;

    const casting =
        await getOpenCasting();

    if (
        casting
    ) {

        const expired =
            await expireCasting(
                casting.id
            );

        if (
            expired
        ) {

            for (
                const slot of casting.slots
            )
                if (
                    slot.userId
                )
                    clearUserBusy(
                        slot.userId
                    );

            const updated =
                await getProduction(
                    casting.id
                );

            await updateCastingMessage(
                client,
                updated
            ).catch(
                () => false
            );

        }

    }

    await createNextCasting(
        client
    );

}

function getCanonicalProductionCategory(
    production
) {

    const categories =
        production.slots
            .filter(
                (slot) =>
                    slot.category
            )
            .map(
                (slot) =>
                    slot.category
            );

    return categories.length === production.slots.length
        ? canonicalizeCastCategories(
            categories
        )
        : production.category;

}

function tripleGifPath(
    production,
    phase
) {

    return path.join(
        getRuntimeDataPath(
            `scenes_${production.production_type.toLowerCase()}`
        ),
        getCanonicalProductionCategory(
            production
        ),
        `${phase}.json`
    );

}

function fallbackGifPaths(
    production,
    phase
) {

    const categories =
        production.slots.map(
            (slot) =>
                slot.category
        );

    const pairs =
        new Set();

    for (
        let first = 0;
        first < categories.length;
        first += 1
    )
        for (
            let second = first + 1;
            second < categories.length;
            second += 1
        ) {

            if (
                (
                    production.production_type === 'MFM' ||
                    production.production_type === 'FMF'
                ) &&
                ![
                    categories[first],
                    categories[second]
                ].some(
                    (category) =>
                        category?.endsWith(
                            'm'
                        )
                )
            )
                continue;

            const category =
                getTwoPersonSceneCategory(
                    categories[first],
                    categories[second]
                );

            if (
                category
            )
                pairs.add(
                    category
                );

        }

    return [
        ...pairs
    ].map(
        (category) => ({
            category,
            filePath:
                path.join(
                    getRuntimeDataPath(
                        'scenes'
                    ),
                    category,
                    `${phase}.json`
                )
        })
    ).filter(
        ({ filePath }) =>
            getGifCount(
                filePath
            ) > 0
    );

}

function pickProductionGif(
    production,
    phase
) {

    const userIds =
        production.slots.map(
            (slot) =>
                slot.userId
        );

    const requestedPath =
        tripleGifPath(
            production,
            phase
        );

    const requestedCategory =
        getCanonicalProductionCategory(
            production
        );

    if (
        getGifCount(
            requestedPath
        ) > 0
    )
        return {
            ...getSmartGifFromFile(
                requestedPath,
                userIds
            ),
            category:
                requestedCategory,
            fallback:
                false
        };

    const fallbacks =
        fallbackGifPaths(
            production,
            phase
        );

    if (
        fallbacks.length === 0
    )
        return {
            url: null,
            index: 0,
            total: 0,
            category: null,
            fallback: true
        };

    const selected =
        fallbacks[
            Math.floor(
                Math.random() *
                fallbacks.length
            )
        ];

    return {
        ...getSmartGifFromFile(
            selected.filePath,
            userIds
        ),
        category:
            selected.category,
        fallback:
            true
    };

}

function buildOfficialEmbed(
    client,
    production,
    options
) {

    const guild =
        client.guilds.cache.get(
            process.env.GUILD_ID
        );

    const icon =
        guild?.iconURL?.() ??
        undefined;

    return createEmbed({
        color:
            production.color,
        authorName:
            'Midnight Pleasure Club',
        authorIcon:
            icon,
        thumbnail:
            icon,
        title:
            options.title ?? production.title,
        description:
            options.description,
        image:
            options.image,
        footerText:
            options.footerText,
        timestamp:
            true
    });

}

function addProductionFields(
    embed,
    production
) {

    embed.addFields(
        {
            name:
                '\uD83D\uDC65 Cast',
            value:
                production.slots.map(
                    (slot) =>
                        `<@${slot.userId}>`
                ).join(
                    ' + '
                ),
            inline:
                false
        },
        {
            name:
                '\uD83C\uDFAC Production',
            value:
                production.production_type,
            inline:
                true
        }
    );

    return embed;

}

async function postStartMoment(
    client,
    production
) {

    const channel =
        await fetchChannel(
            client,
            CHANNELS.MOMENTS
        );

    if (
        !channel?.send
    )
        return;

    const embed =
        addProductionFields(
            buildOfficialEmbed(
                client,
                production,
                {
                    title:
                        `\uD83C\uDFAC Production Started \u2014 ${production.title}`,
                    description:
                        'The cast is complete and this official MPC production is now filming.'
                }
            ),
            production
        );

    await channel.send({
        embeds: [
            embed
        ]
    });

}

function pickBooster() {

    const tier =
        weightedPick(
            [
                {
                    tier: 1,
                    weight: 65
                },
                {
                    tier: 2,
                    weight: 25
                },
                {
                    tier: 3,
                    weight: 8
                },
                {
                    tier: 4,
                    weight: 2
                }
            ],
            (entry) =>
                entry.weight
        ).tier;

    const stats = [
        'performance',
        'stamina',
        'fame'
    ];

    return {
        tier,
        stat:
            stats[
                Math.floor(
                    Math.random() *
                    stats.length
                )
            ]
    };

}

function pickGift() {

    const category =
        weightedPick(
            [
                {
                    category: 'common',
                    weight: 70
                },
                {
                    category: 'uncommon',
                    weight: 23
                },
                {
                    category: 'premium',
                    weight: 6
                },
                {
                    category: 'luxury',
                    weight: 1
                }
            ],
            (entry) =>
                entry.weight
        ).category;

    return weightedPick(
        gifts.filter(
            (gift) =>
                gift.category === category
        ),
        (gift) =>
            1 / gift.price
    );

}

function buildRewards(
    production
) {

    return production.slots.map(
        (slot) => ({
            userId:
                slot.userId,
            coins:
                randomInt(
                    150,
                    225
                ),
            xp:
                randomInt(
                    40,
                    55
                ),
            booster:
                Math.random() <
                BONUS_REWARD_CHANCE
                    ? pickBooster()
                    : null,
            gift:
                Math.random() <
                BONUS_REWARD_CHANCE
                    ? pickGift()
                    : null,
            lotteryTicket:
                Math.random() <
                BONUS_REWARD_CHANCE
        })
    );

}

function buildPartEmbed(
    client,
    production,
    phase,
    partIndex
) {

    const gif =
        pickProductionGif(
            production,
            phase
        );

    const embed =
        buildOfficialEmbed(
            client,
            production,
            {
                description:
                    getPhaseFlavor(
                        phase
                    ),
                image:
                    gif.url,
                footerText:
                    gif.total > 0
                        ? `Community Production \u2022 Part ${partIndex + 1}/${PARTS.length} \u2022 ${phase[0].toUpperCase()}${phase.slice(1)} \u2022 GIF #${gif.index}/${gif.total}${gif.fallback ? ' \u2022 Pair fallback' : ''}`
                        : `Community Production \u2022 Part ${partIndex + 1}/${PARTS.length} \u2022 ${phase[0].toUpperCase()}${phase.slice(1)} \u2022 No matching GIF`
            }
        );

    embed.addFields({
        name:
            '\uD83D\uDC65 Cast',
        value:
            production.slots.map(
                (slot) =>
                    `<@${slot.userId}>`
            ).join(
                ' + '
            ),
        inline:
            false
    });

    return embed;

}

function scheduleProduction(
    client,
    production,
    overrideDelay = null
) {

    const previous =
        productionTimers.get(
            production.id
        );

    if (
        previous
    )
        clearTimeout(
            previous
        );

    const timer =
        setTimeout(
            () =>
                void postNextPart(
                    client,
                    production.id
                ),
            overrideDelay ??
            Math.max(
                0,
                production.next_part_at - Date.now()
            )
        );

    timer.unref?.();

    productionTimers.set(
        production.id,
        timer
    );

}

async function finishProduction(
    client,
    production
) {

    const rewardsApplied =
        await applyRewardsOnce(
            production.id
        );

    if (
        rewardsApplied
    )
        await Promise.all(
            production.slots.map(
                (slot) =>
                    trackDailyQuest(
                        client,
                        slot.userId,
                        'porn_scene'
                    )
            )
        );

    const updated =
        await getProduction(
            production.id
        );

    const moments =
        await fetchChannel(
            client,
            CHANNELS.MOMENTS
        );

    if (
        moments?.send
    ) {

        const embed =
            addProductionFields(
                buildOfficialEmbed(
                    client,
                    updated,
                    {
                        title:
                            `\uD83C\uDFC1 Production Finished \u2014 ${updated.title}`,
                        description:
                            'The official MPC production has wrapped. Every cast member received coins and XP, with a chance of a bonus booster, gift, or lottery ticket.'
                    }
                ),
                updated
            );

        embed.addFields({
            name:
                '\uD83C\uDF81 Rewards',
            value:
                updated.rewards.map(
                    (reward) => {

                        const bonuses = [
                            reward.booster
                                ? `${boosterStatLabels[reward.booster.stat]} T${reward.booster.tier}`
                                : null,
                            reward.gift
                                ? `${reward.gift.emoji} ${reward.gift.name}`
                                : null,
                            reward.lotteryTicket
                                ? `Lottery Ticket #${reward.lotteryTicket.number}`
                                : null
                        ].filter(
                            Boolean
                        );

                        return `<@${reward.userId}> \u2014 ${reward.coins} coins, ${reward.xp} XP${bonuses.length ? `, \uD83C\uDF81 ${bonuses.join(', ')}` : ''}`;

                    }
                ).join(
                    '\n'
                ),
            inline:
                false
        });

        await moments.send({
            content:
                updated.slots.map(
                    (slot) =>
                        `<@${slot.userId}>`
                ).join(
                    ' '
                ),
            allowedMentions: {
                users:
                    updated.slots.map(
                        (slot) =>
                            slot.userId
                    )
            },
            embeds: [
                embed
            ]
        });

    }

    await markCompleted(
        production.id
    );

    for (
        const slot of production.slots
    )
        clearUserBusy(
            slot.userId
        );

    return rewardsApplied;

}

async function postNextPart(
    client,
    productionId
) {

    productionTimers.delete(
        productionId
    );

    const production =
        await getProduction(
            productionId
        );

    if (
        !production ||
        ![
            'running',
            'finalizing'
        ].includes(
            production.status
        )
    )
        return;

    try {

        if (
            production.status === 'finalizing'
        ) {

            await finishProduction(
                client,
                production
            );

            return;

        }

        const channel =
            await fetchChannel(
                client,
                production.scene_channel_id
            );

        if (
            !channel?.send
        )
            throw new Error(
                `Scene channel ${production.scene_channel_id} is unavailable.`
            );

        const index =
            production.next_part_index;

        const phase =
            production.parts[index];

        if (
            !phase
        )
            throw new Error(
                `Missing community production part ${index}.`
            );

        const message =
            await channel.send({
                embeds: [
                    buildPartEmbed(
                        client,
                        production,
                        phase,
                        index
                    )
                ]
            });

        const links = [
            ...production.sceneLinks
        ];

        links[index] =
            message.url;

        const finalPart =
            index === production.parts.length - 1;

        const rewards =
            finalPart &&
            !production.rewards
                ? buildRewards(
                    production
                )
                : null;

        const checkpointed =
            await checkpointPart(
                production.id,
                index,
                links,
                finalPart
                    ? Date.now()
                    : production.next_part_at + PART_INTERVAL_MS,
                finalPart,
                rewards
            );

        if (
            !checkpointed
        )
            return;

        const updated =
            await getProduction(
                production.id
            );

        if (
            index === 0
        )
            await updateCastingMessage(
                client,
                updated
            ).catch(
                () => false
            );

        if (
            finalPart
        )
            await finishProduction(
                client,
                updated
            );
        else
            scheduleProduction(
                client,
                updated
            );

    }
    catch (error) {

        await logError(
            client,
            {
                title:
                    'Community Production Step Failed',
                error,
                fields: [
                    {
                        name:
                            'Production',
                        value:
                            String(
                                productionId
                            ),
                        inline:
                            true
                    }
                ]
            }
        );

        scheduleProduction(
            client,
            production,
            60 * 1000
        );

    }

}

async function handleJoin(
    interaction
) {

    await interaction.deferReply({
        flags:
            64
    });

    const productionId =
        Number(
            interaction.customId.split(
                ':'
            )[1]
        );

    const production =
        await getProduction(
            productionId
        );

    if (
        !production ||
        production.status !== 'casting' ||
        production.casting_closes_at <= Date.now()
    ) {

        await interaction.editReply(
            'This casting call is closed. Wait for the next production.'
        );

        return;

    }

    const categoryResult =
        getExactMemberCategory(
            interaction.member
        );

    if (
        categoryResult.error
    ) {

        await interaction.editReply(
            categoryResult.error
        );

        return;

    }

    const user =
        await getOrCreateUser(
            interaction.user.id
        );

    const missingStats = [
        [
            'Performance',
            user.performance
        ],
        [
            'Stamina',
            user.stamina
        ],
        [
            'Fame',
            user.fame
        ]
    ].filter(
        ([, value]) =>
            value < 10
    ).map(
        ([name]) =>
            name
    );

    if (
        missingStats.length > 0
    ) {

        await interaction.editReply(
            `You need at least 10 ${missingStats.join(', ')} to join.`
        );

        return;

    }

    if (
        isBusy(
            interaction.user.id
        )
    ) {

        await interaction.editReply(
            'You are already busy and cannot join this production.'
        );

        return;

    }

    setUserBusy(
        interaction.user.id,
        {
            type:
                'community-production',
            productionId,
            joinedAt:
                Date.now()
        }
    );

    let claimed;

    try {

        claimed =
            await claimCastingSlot(
                productionId,
                interaction.user.id,
                categoryResult.category
            );

    }
    catch (error) {

        clearUserBusy(
            interaction.user.id
        );

        throw error;

    }

    if (
        !claimed.ok
    ) {

        clearUserBusy(
            interaction.user.id
        );

        const messages = {
            closed:
                'This casting call is closed. Wait for the next production.',
            joined:
                'You already joined this production.',
            role_full:
                'This production is already full for your role. Wait for the next production.'
        };

        await interaction.editReply(
            messages[claimed.reason] ??
            'You could not join this production.'
        );

        return;

    }

    const updated =
        await getProduction(
            productionId
        );

    await updateCastingMessage(
        interaction.client,
        updated
    );

    await interaction.editReply(
        claimed.full
            ? `You joined **${updated.title}**. The cast is complete and filming is starting in <#${CHANNELS.PORN_CAREER}>.`
            : `You joined **${updated.title}**. You will remain busy while casting is open.`
    );

    if (
        claimed.full
    ) {

        await postStartMoment(
            interaction.client,
            updated
        ).catch(
            error =>
                void logWarning(
                    interaction.client,
                    {
                        title:
                            'Community Production Start Moment Failed',
                        description:
                            error.message
                    }
                )
        );

        scheduleProduction(
            interaction.client,
            updated
        );

    }

}

async function startCommunityProductions(
    client
) {

    const productions =
        await getRestorableProductions();

    let casting =
        null;

    let nextCastingAt =
        0;

    for (
        const production of productions
    ) {

        for (
            const slot of production.slots
        )
            if (
                slot.userId
            )
                setUserBusy(
                    slot.userId,
                    {
                        type:
                            'community-production',
                        productionId:
                            production.id,
                        restored:
                            true
                    }
                );

        nextCastingAt =
            Math.max(
                nextCastingAt,
                production.casting_closes_at
            );

        if (
            production.status === 'casting'
        )
            casting =
                production;
        else
            scheduleProduction(
                client,
                production
            );

    }

    if (
        casting
    ) {

        if (
            casting.casting_closes_at <= Date.now()
        )
            await rotateCasting(
                client
            );
        else {

            const updated =
                await updateCastingMessage(
                    client,
                    casting
                );

            if (
                !updated
            )
                await postCasting(
                    client,
                    casting
                );

            scheduleCastingRotation(
                client,
                casting.casting_closes_at
            );

        }

    }
    else if (
        nextCastingAt > Date.now()
    )
        scheduleCastingRotation(
            client,
            nextCastingAt
        );
    else
        await createNextCasting(
            client
        );

    return {
        casting:
            Boolean(
                casting
            ),
        running:
            productions.filter(
                (production) =>
                    production.status !== 'casting'
            ).length
    };

}

module.exports = {
    getCanonicalProductionCategory,
    handleJoin,
    pickGift,
    pickProductionType,
    pickProductionGif,
    startCommunityProductions
};
