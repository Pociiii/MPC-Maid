const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require('discord.js');

const {
    CHANNELS,
    ECONOMY,
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getCoinIncome,
    getPreviousCoinIncomeDate
} = require('../../utils/coinIncome');

const {
    STUDIO_NPCS,
    getStudioNpc
} = require('../../data/studioNpcs');

const {
    getOrCreateUser
} = require('../../utils/users');

const {
    logError,
    logWarning
} = require('../../utils/inboxLogger');

const {
    getDailyQuestDate,
    getNextResetTimestamp
} = require('../daily-quests/dailyQuests');

const {
    attachSceneToOpenStudio,
    beginStudioPurchase,
    cancelStudioPurchase,
    closeStudio,
    completeStudioScene,
    finishStudioPurchase,
    getOpenStudios,
    getPendingMirrors,
    getProvisioningStudios,
    getStudioById,
    getStudioByOwner,
    getStudioScene,
    getStudioStaffByOwner,
    getStudioStaffDueUpkeep,
    getStudiosDueUpkeep,
    hireStudioNpc,
    markMirrorPosted,
    processStudioStaffUpkeep,
    processStudioUpkeep,
    queueMirror,
    reactivateStudioNpc,
    reopenStudio,
    saveProvisioningThread
} = require('../../database/studios');

let upkeepTimer = null;

function studioName(displayName) {
    return `${displayName}'s Studio`;
}

function studioUrl(guildId, threadId) {
    return `https://discord.com/channels/${guildId}/${threadId}`;
}

function anniversaryBadge(openedAt, now = Date.now()) {
    const days = Math.floor((now - openedAt) / 86400000);

    if (days >= 365)
        return '1 Year';
    if (days >= 180)
        return '180 Days';
    if (days >= 90)
        return '90 Days';
    if (days >= 30)
        return '30 Days';
    return 'New Studio';
}

function formatNumber(value) {
    return Number(value ?? 0).toLocaleString('en-US');
}

function buildHiredStaffValue(studio, staff) {
    if (!staff.length)
        return 'No staff hired. Use **Manage Staff** to view available NPCs.';

    return staff.map((member) => {
        const npc = getStudioNpc(member.npc_key);

        if (!npc)
            return `\u2753 **Unknown Staff (${member.npc_key})**`;

        return `${npc.emoji} **${npc.name}**`;
    }).join('\n\n');
}

function getPreviousDayIncome(ownerId) {
    return getCoinIncome(
        ownerId,
        getPreviousCoinIncomeDate()
    );
}

async function fetchOwnerTarget(client, ownerId) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID) ??
        await client.guilds.fetch(process.env.GUILD_ID).catch(() => null);
    const member = guild
        ? await guild.members.fetch(ownerId).catch(() => null)
        : null;

    return {
        displayName: member?.displayName ?? member?.user?.displayName ?? `Member ${ownerId}`,
        avatar: member?.displayAvatarURL?.() ?? member?.user?.displayAvatarURL?.() ?? null,
        guildId: guild?.id ?? process.env.GUILD_ID
    };
}

function buildOverviewEmbed(studio, target, previousDayIncome = 0) {
    const embed = createEmbed({
        color: getRandomColor(),
        authorName: studioName(studio.display_name ?? target.displayName),
        authorIcon: target.avatar,
        title: 'Studio Overview',
        description: 'A player-owned Porn Career production studio.',
        footerText: '/mystudio',
        timestamp: true
    });

    embed.addFields(
        {
            name: 'Owner',
            value: `<@${studio.owner_id}>`,
            inline: true
        },
        {
            name: 'Opened',
            value: `<t:${Math.floor(studio.opened_at / 1000)}:D>`,
            inline: true
        },
        {
            name: 'Status',
            value: studio.status === 'open' ? 'Open' : 'Closed',
            inline: true
        },
        {
            name: 'Movies Produced',
            value: formatNumber(studio.movies_produced),
            inline: true
        },
        {
            name: 'Total Viewers',
            value: formatNumber(studio.total_viewers),
            inline: true
        },
        {
            name: 'Viral Hits',
            value: formatNumber(studio.viral_hits),
            inline: true
        },
        {
            name: 'Studio Income \u2014 Previous Day',
            value: `\uD83E\DE99 ${formatNumber(previousDayIncome)} coins`,
            inline: false
        },
        {
            name: 'Anniversary Badge',
            value: anniversaryBadge(studio.opened_at),
            inline: true
        }
    );

    return embed;
}

async function updateStudioOverview(client, studioOrId) {
    const studio = typeof studioOrId === 'object'
        ? studioOrId
        : await getStudioById(studioOrId);

    if (!studio?.thread_id || !studio.overview_message_id)
        return false;

    const thread = client.channels.cache.get(studio.thread_id) ??
        await client.channels.fetch(studio.thread_id).catch(() => null);
    const message = thread?.messages?.fetch
        ? await thread.messages.fetch(studio.overview_message_id).catch(() => null)
        : null;

    if (!message?.edit)
        return false;

    const [target, previousDayIncome] = await Promise.all([
        fetchOwnerTarget(client, studio.owner_id),
        getPreviousDayIncome(studio.owner_id)
    ]);
    await message.edit({
        embeds: [buildOverviewEmbed(studio, target, previousDayIncome)]
    });
    return true;
}

async function createStudioForumPost(client, studio, ownerId) {
    const forum = client.channels.cache.get(CHANNELS.STUDIO_FORUM) ??
        await client.channels.fetch(CHANNELS.STUDIO_FORUM).catch(() => null);

    if (!forum?.threads?.create)
        throw new Error(`Studio forum ${CHANNELS.STUDIO_FORUM} is unavailable or is not a forum.`);

    const [target, previousDayIncome] = await Promise.all([
        fetchOwnerTarget(client, ownerId),
        getPreviousDayIncome(ownerId)
    ]);
    const thread = await forum.threads.create({
        name: studioName(target.displayName).slice(0, 100),
        message: {
            embeds: [
                buildOverviewEmbed(
                    { ...studio, status: 'open' },
                    target,
                    previousDayIncome
                )
            ]
        },
        reason: `Player Studio purchase by ${ownerId}`
    });
    await saveProvisioningThread(studio.id, thread.id);
    const starter = await thread.fetchStarterMessage();

    return finishStudioPurchase(studio.id, thread.id, starter.id);
}

function buildMyStudioReply(
    studio,
    user,
    target,
    staff = [],
    previousDayIncome = 0
) {
    if (!studio) {
        const embed = createEmbed({
            color: getRandomColor(),
            authorName: studioName(target.displayName),
            authorIcon: target.avatar,
            title: 'Open Your Studio',
            description:
                `Purchase: **${formatNumber(ECONOMY.STUDIO_PURCHASE_COST)} coins**\n` +
                `Daily upkeep: **${formatNumber(ECONOMY.STUDIO_DAILY_UPKEEP)} coins**\n` +
                `Your balance: **${formatNumber(user.coins)} coins**`,
            footerText: '/mystudio',
            timestamp: true
        });

        return {
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('studio_buy')
                        .setLabel('Buy Studio')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(user.coins < ECONOMY.STUDIO_PURCHASE_COST)
                )
            ]
        };
    }

    const embed = buildOverviewEmbed(
        studio,
        target,
        previousDayIncome
    );

    embed.addFields({
        name: '\uD83D\uDC65 Hired Staff',
        value: buildHiredStaffValue(studio, staff),
        inline: false
    });

    if (studio.thread_id)
        embed.addFields({
            name: 'Studio',
            value: `[Open Studio](${studioUrl(target.guildId, studio.thread_id)})`,
            inline: false
        });

    const components = [];

    if (studio.status === 'closed')
        components.push(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('studio_reopen')
                    .setLabel(`Reopen — ${formatNumber(ECONOMY.STUDIO_REOPEN_COST)} coins`)
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(user.coins < ECONOMY.STUDIO_REOPEN_COST)
            )
        );

    components.push(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('studio_staff')
                .setLabel('Manage Staff')
                .setEmoji('\uD83D\uDC65')
                .setStyle(ButtonStyle.Secondary),
            ...(
                studio.status === 'open'
                    ? [
                        new ButtonBuilder()
                            .setCustomId('studio_close')
                            .setLabel('Close Studio')
                            .setEmoji('\uD83D\uDD12')
                            .setStyle(ButtonStyle.Danger)
                    ]
                    : []
            )
        )
    );

    return { embeds: [embed], components };
}

async function buildMyStudio(interaction) {
    const [user, studio, target, staff, previousDayIncome] = await Promise.all([
        getOrCreateUser(interaction.user.id),
        getStudioByOwner(interaction.user.id),
        fetchOwnerTarget(interaction.client, interaction.user.id),
        getStudioStaffByOwner(interaction.user.id),
        getPreviousDayIncome(interaction.user.id)
    ]);

    return buildMyStudioReply(
        studio,
        user,
        target,
        staff,
        previousDayIncome
    );
}

async function buildStudioStaffReply(interaction) {
    const [studio, user, staff] = await Promise.all([
        getStudioByOwner(interaction.user.id),
        getOrCreateUser(interaction.user.id),
        getStudioStaffByOwner(interaction.user.id)
    ]);

    if (!studio)
        return {
            content: 'Open a player studio before hiring staff.',
            embeds: [],
            components: []
        };

    const embed = createEmbed({
        color: getRandomColor(),
        title: '\uD83D\uDC65 Studio Staff',
        description:
            `Hire abstract NPC staff to unlock studio services.\n` +
            `Your balance: **${formatNumber(user.coins)} coins**`,
        footerText: '/mystudio \u2022 Manage Staff',
        timestamp: true
    });

    for (const npc of STUDIO_NPCS) {
        const hired = staff.find((member) => member.npc_key === npc.key);
        const status = !hired
            ? 'Available'
            : hired.status === 'suspended'
                ? 'Suspended'
                : studio.status === 'open'
                    ? 'Active'
                    : 'Inactive \u2014 studio closed';

        embed.addFields({
            name: `${npc.emoji} ${npc.name} \u2014 ${status}`,
            value:
                `${npc.description}\n` +
                `Hire: **${formatNumber(npc.hireCost)} coins** \u2022 ` +
                `Daily upkeep: **${formatNumber(npc.dailyUpkeep)} coins**`,
            inline: false
        });
    }

    const actionable = STUDIO_NPCS.filter((npc) => {
        const hired = staff.find((member) => member.npc_key === npc.key);
        return !hired || hired.status === 'suspended';
    });
    const components = [];

    if (studio.status === 'open' && actionable.length)
        components.push(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('studio_staff_select')
                    .setPlaceholder('Select an NPC to hire or reactivate')
                    .addOptions(
                        ...actionable.map((npc) => {
                            const hired = staff.find(
                                (member) => member.npc_key === npc.key
                            );
                            const reactivating = hired?.status === 'suspended';

                            return {
                                label: `${reactivating ? 'Reactivate' : 'Hire'} ${npc.name}`,
                                description: reactivating
                                    ? `${formatNumber(npc.dailyUpkeep)} coins to reactivate`
                                    : `${formatNumber(npc.hireCost)} coins to hire`,
                                emoji: npc.emoji,
                                value: npc.key
                            };
                        })
                    )
            )
        );

    components.push(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('studio_staff_back')
                .setLabel('Back to Studio')
                .setStyle(ButtonStyle.Secondary)
        )
    );

    if (studio.status !== 'open')
        embed.setDescription(
            `${embed.data.description}\n\nReopen your studio to hire or reactivate staff.`
        );

    return { embeds: [embed], components };
}

async function handleStudioStaff(interaction) {
    await interaction.deferUpdate();
    await interaction.editReply(
        await buildStudioStaffReply(interaction)
    );
}

async function handleStudioStaffBack(interaction) {
    await interaction.deferUpdate();
    await interaction.editReply(
        await buildMyStudio(interaction)
    );
}

async function handleStudioStaffSelect(interaction) {
    await interaction.deferUpdate();

    const npc = getStudioNpc(interaction.values[0]);

    if (!npc) {
        await interaction.editReply({
            ...await buildStudioStaffReply(interaction),
            content: 'That NPC is no longer available.'
        });
        return;
    }

    const staff = await getStudioStaffByOwner(interaction.user.id);
    const hired = staff.find((member) => member.npc_key === npc.key);
    const result = hired?.status === 'suspended'
        ? await reactivateStudioNpc(
            interaction.user.id,
            npc.key,
            npc.dailyUpkeep,
            getDailyQuestDate()
        )
        : await hireStudioNpc(
            interaction.user.id,
            npc.key,
            npc.hireCost,
            getDailyQuestDate()
        );
    const reason = result.reason === 'coins'
        ? 'You no longer have enough coins.'
        : result.reason === 'studio'
            ? 'Your studio must be open.'
            : 'That staff member is no longer available for this action.';

    await interaction.editReply({
        ...await buildStudioStaffReply(interaction),
        content: result.ok
            ? `${npc.emoji} **${npc.name}** is now active.`
            : reason
    });
}

async function handleStudioBuy(interaction) {
    await interaction.deferUpdate();
    await getOrCreateUser(interaction.user.id);
    const purchaseTarget = await fetchOwnerTarget(
        interaction.client,
        interaction.user.id
    );

    const result = await beginStudioPurchase(
        interaction.user.id,
        ECONOMY.STUDIO_PURCHASE_COST,
        getDailyQuestDate(),
        purchaseTarget.displayName
    );

    if (!result.ok) {
        const target = await fetchOwnerTarget(interaction.client, interaction.user.id);
        const user = await getOrCreateUser(interaction.user.id);
        const [studio, staff, previousDayIncome] = await Promise.all([
            getStudioByOwner(interaction.user.id),
            getStudioStaffByOwner(interaction.user.id),
            getPreviousDayIncome(interaction.user.id)
        ]);
        await interaction.editReply({
            ...buildMyStudioReply(
                studio,
                user,
                target,
                staff,
                previousDayIncome
            ),
            content: result.reason === 'exists'
                ? 'You already own a studio.'
                : 'You no longer have enough coins to buy a studio.'
        });
        return;
    }

    try {
        const studio = await createStudioForumPost(
            interaction.client,
            result.studio,
            interaction.user.id
        );
        const [user, target, staff, previousDayIncome] = await Promise.all([
            getOrCreateUser(interaction.user.id),
            fetchOwnerTarget(interaction.client, interaction.user.id),
            getStudioStaffByOwner(interaction.user.id),
            getPreviousDayIncome(interaction.user.id)
        ]);
        await interaction.editReply({
            ...buildMyStudioReply(
                studio,
                user,
                target,
                staff,
                previousDayIncome
            ),
            content: `Your studio is open: ${studioUrl(target.guildId, studio.thread_id)}`
        });
    }
    catch (error) {
        await cancelStudioPurchase(
            result.studio.id,
            interaction.user.id,
            ECONOMY.STUDIO_PURCHASE_COST
        );
        await logError(interaction.client, {
            title: 'Studio Provisioning Failed',
            error,
            fields: [{ name: 'Owner', value: `<@${interaction.user.id}>`, inline: true }]
        });
        await interaction.editReply({
            content: 'The studio forum post could not be created. Your coins were refunded.',
            embeds: [],
            components: []
        });
    }
}

async function handleStudioReopen(interaction) {
    await interaction.deferUpdate();
    await getOrCreateUser(interaction.user.id);
    const result = await reopenStudio(
        interaction.user.id,
        ECONOMY.STUDIO_REOPEN_COST,
        getDailyQuestDate()
    );
    const [studio, user, target, staff, previousDayIncome] = await Promise.all([
        getStudioByOwner(interaction.user.id),
        getOrCreateUser(interaction.user.id),
        fetchOwnerTarget(interaction.client, interaction.user.id),
        getStudioStaffByOwner(interaction.user.id),
        getPreviousDayIncome(interaction.user.id)
    ]);

    if (result.ok)
        await updateStudioOverview(interaction.client, result.studio).catch(() => false);

    await interaction.editReply({
        ...buildMyStudioReply(
            studio,
            user,
            target,
            staff,
            previousDayIncome
        ),
        content: result.ok
            ? 'Your studio is open again. Future requested scenes will be produced there.'
            : result.reason === 'coins'
                ? 'You no longer have enough coins to reopen your studio.'
                : 'This studio cannot be reopened.'
    });
}

async function handleStudioClose(interaction) {
    await interaction.deferUpdate();

    const studio = await getStudioByOwner(interaction.user.id);

    if (!studio || studio.status !== 'open') {
        await interaction.editReply({
            ...await buildMyStudio(interaction),
            content: 'This studio is already closed.'
        });
        return;
    }

    const embed = createEmbed({
        color: getRandomColor(),
        title: '\uD83D\uDD12 Close Studio?',
        description:
            'Closing pauses studio upkeep and every staff upkeep charge. Staff benefits become inactive until the studio is reopened.\n\n' +
            `Existing productions will still finish. Reopening costs **${formatNumber(ECONOMY.STUDIO_REOPEN_COST)} coins**.`,
        footerText: '/mystudio',
        timestamp: true
    });

    await interaction.editReply({
        content: null,
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('studio_close_confirm')
                    .setLabel('Confirm Close')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('studio_close_cancel')
                    .setLabel('Keep Open')
                    .setStyle(ButtonStyle.Secondary)
            )
        ]
    });
}

async function handleStudioCloseConfirm(interaction) {
    await interaction.deferUpdate();

    const result = await closeStudio(interaction.user.id);
    const [studio, user, target, staff, previousDayIncome] = await Promise.all([
        getStudioByOwner(interaction.user.id),
        getOrCreateUser(interaction.user.id),
        fetchOwnerTarget(interaction.client, interaction.user.id),
        getStudioStaffByOwner(interaction.user.id),
        getPreviousDayIncome(interaction.user.id)
    ]);

    if (result.ok)
        await updateStudioOverview(interaction.client, result.studio).catch(() => false);

    await interaction.editReply({
        ...buildMyStudioReply(
            studio,
            user,
            target,
            staff,
            previousDayIncome
        ),
        content: result.ok
            ? 'Your studio is closed. Studio and staff upkeep are paused until you reopen it.'
            : 'This studio is already closed.'
    });
}

async function handleStudioCloseCancel(interaction) {
    await interaction.deferUpdate();
    await interaction.editReply(
        await buildMyStudio(interaction)
    );
}

async function buildStudiosReply(interaction) {
    const studios = await getOpenStudios();
    const entries = await Promise.all(
        studios.slice(0, 200).map(async (studio) => {
            const target = await fetchOwnerTarget(interaction.client, studio.owner_id);
            return `• **${studioName(studio.display_name)}**\n` +
                `<@${studio.owner_id}> • ${formatNumber(studio.movies_produced)} movies • ` +
                `${formatNumber(studio.total_viewers)} viewers\n` +
                `[Open Studio](${studioUrl(target.guildId, studio.thread_id)})`;
        })
    );

    const pages = [];

    if (!entries.length)
        pages.push([]);
    else
        for (let index = 0; index < entries.length; index += 20)
            pages.push(entries.slice(index, index + 20));

    const embeds = pages.map((page, index) =>
        createEmbed({
            color: getRandomColor(),
            title: index === 0 ? 'Player Studios' : `Player Studios — ${index + 1}`,
            description: page.length
                ? page.join('\n\n')
                : 'No player studios are open right now.',
            footerText: studios.length > entries.length
                ? `/studios • Showing ${entries.length} of ${studios.length}`
                : '/studios',
            timestamp: true
        })
    );

    return { embeds };
}

function addStudioField(embed, studioScene, guildId) {
    if (!studioScene?.thread_id)
        return embed;

    embed.addFields({
        name: '🎬 Studio',
        value: `${studioName(studioScene.display_name)}\n` +
            `[View Studio](${studioUrl(guildId, studioScene.thread_id)})`,
        inline: false
    });
    return embed;
}

async function sendMirror(client, studioScene, mirrorKey, embed) {
    if (!studioScene?.thread_id)
        return false;

    try {
        const mirror = await queueMirror(studioScene.id, mirrorKey, embed);

        if (mirror.status === 'posted')
            return true;

        const thread = client.channels.cache.get(studioScene.thread_id) ??
            await client.channels.fetch(studioScene.thread_id);

        if (thread.archived && thread.setArchived)
            await thread.setArchived(false, 'Continue active studio production');

        const message = await thread.send({
            embeds: [JSON.parse(mirror.embed_json)]
        });
        await markMirrorPosted(mirror.id, message.id);
        return true;
    }
    catch (error) {
        await logError(client, {
            title: 'Studio Scene Mirror Failed',
            error,
            fields: [
                { name: 'Studio Scene', value: String(studioScene.id), inline: true },
                { name: 'Part', value: mirrorKey, inline: true }
            ]
        });
        return false;
    }
}

async function attachScene(activeScene) {
    return attachSceneToOpenStudio(
        activeScene.id,
        activeScene.owner_id,
        activeScene.title,
        activeScene.created_at
    );
}

async function finishStudioProduction(client, activeScene, finalEmbed) {
    const studioScene = await getStudioScene(activeScene.id);

    if (!studioScene)
        return false;

    await sendMirror(client, studioScene, 'finished', finalEmbed);
    const changed = await completeStudioScene(
        activeScene.id,
        activeScene.result.viewers,
        activeScene.result.outcome,
        activeScene.title
    );

    if (changed) {
        const studio = await getStudioById(studioScene.studio_id);
        await updateStudioOverview(client, studio).catch(async (error) => {
            await logError(client, {
                title: 'Studio Overview Update Failed',
                error,
                fields: [{ name: 'Studio', value: String(studio.id), inline: true }]
            });
        });
    }

    return changed;
}

async function restorePendingMirrors(client) {
    const mirrors = await getPendingMirrors();
    let restored = 0;

    for (const mirror of mirrors) {
        const studioScene = { id: mirror.studio_scene_id, thread_id: mirror.thread_id };
        if (await sendMirror(client, studioScene, mirror.mirror_key, JSON.parse(mirror.embed_json)))
            restored += 1;
    }

    return restored;
}

async function recoverProvisioningStudios(client) {
    const studios = await getProvisioningStudios();
    let refunded = 0;

    for (const studio of studios) {
        if (studio.thread_id) {
            const thread = client.channels.cache.get(studio.thread_id) ??
                await client.channels.fetch(studio.thread_id).catch(() => null);
            const starter = thread?.fetchStarterMessage
                ? await thread.fetchStarterMessage().catch(() => null)
                : null;

            if (starter) {
                await finishStudioPurchase(studio.id, thread.id, starter.id);
                continue;
            }
        }

        await cancelStudioPurchase(
            studio.id,
            studio.owner_id,
            ECONOMY.STUDIO_PURCHASE_COST
        );
        await logWarning(client, {
            title: 'Interrupted Studio Purchase Refunded',
            description: `Refunded <@${studio.owner_id}> after an interrupted studio purchase.`
        });
        refunded += 1;
    }

    return refunded;
}

function nextResetDate(resetDate) {
    const date = new Date(`${resetDate}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
}

async function runStudioUpkeep(client) {
    const resetDate = getDailyQuestDate();
    const studios = await getStudiosDueUpkeep(resetDate);
    let closed = 0;
    let processed = 0;

    for (const studio of studios) {
        let chargeDate = nextResetDate(studio.last_upkeep_date);
        let latest = studio;

        while (chargeDate <= resetDate && latest.status === 'open') {
            const result = await processStudioUpkeep(
                studio.id,
                studio.owner_id,
                ECONOMY.STUDIO_DAILY_UPKEEP,
                chargeDate
            );

            if (!result.changed)
                break;

            processed += 1;
            latest = result.studio;

            if (result.closed) {
                closed += 1;
                break;
            }

            chargeDate = nextResetDate(chargeDate);
        }

        await updateStudioOverview(client, latest).catch(() => false);
    }

    const staffDue = await getStudioStaffDueUpkeep(resetDate);
    let staffProcessed = 0;
    let staffSuspended = 0;

    for (const staff of staffDue) {
        const npc = getStudioNpc(staff.npc_key);

        if (!npc)
            continue;

        let chargeDate = nextResetDate(staff.last_upkeep_date);
        let latest = staff;

        while (chargeDate <= resetDate && latest.status === 'active') {
            const result = await processStudioStaffUpkeep(
                staff.id,
                staff.owner_id,
                npc.dailyUpkeep,
                chargeDate
            );

            if (!result.changed)
                break;

            staffProcessed += 1;
            latest = result.staff;

            if (result.suspended) {
                staffSuspended += 1;
                break;
            }

            chargeDate = nextResetDate(chargeDate);
        }
    }

    return {
        processed,
        closed,
        staffProcessed,
        staffSuspended
    };
}

function scheduleStudioUpkeep(client) {
    if (upkeepTimer)
        clearTimeout(upkeepTimer);

    const delay = Math.max(
        1000,
        getNextResetTimestamp() * 1000 - Date.now() + 1000
    );

    upkeepTimer = setTimeout(async () => {
        try {
            await runStudioUpkeep(client);
        }
        catch (error) {
            await logError(client, { title: 'Studio Upkeep Failed', error });
        }
        scheduleStudioUpkeep(client);
    }, delay);

    upkeepTimer.unref?.();
}

async function startPlayerStudios(client) {
    const refunded = await recoverProvisioningStudios(client);
    const upkeep = await runStudioUpkeep(client);
    const mirrors = await restorePendingMirrors(client);
    scheduleStudioUpkeep(client);
    return { refunded, mirrors, ...upkeep };
}

module.exports = {
    addStudioField,
    attachScene,
    buildMyStudio,
    buildStudiosReply,
    finishStudioProduction,
    handleStudioBuy,
    handleStudioClose,
    handleStudioCloseCancel,
    handleStudioCloseConfirm,
    handleStudioReopen,
    handleStudioStaff,
    handleStudioStaffBack,
    handleStudioStaffSelect,
    sendMirror,
    startPlayerStudios,
    studioName,
    studioUrl,
    updateStudioOverview
};
