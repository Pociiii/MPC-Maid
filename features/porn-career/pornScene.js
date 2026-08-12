const {
    CHANNELS
} = require('../../data/constants');

const {
    getMemberCategory
} = require('../../utils/userCategory');

const {
    getOrCreateUser
} = require('../../utils/users');

const {
    formatPornCareerName
} = require('../../utils/pornCareerTitles');

const {
    clearSceneBusy,
    consumePendingRequest,
    getBusyUser,
    getPendingRequest,
    isBusy,
    setSceneBusy,
    trySetSceneBusy
} = require('../../utils/pornScenes');

const {
    removeFromCommunityProductionCasting
} = require('../community-production/communityProduction');

const {
    mpcLogoAttachment
} = require('../../utils/mpcLogo');

const {
    logWarning
} = require('../../utils/inboxLogger');

const {
    formatStatValue
} = require('./sceneMath');

const {
    hasActiveStudioNpc
} = require('../../database/studios');

const {
    calculateStudioSceneResult
} = require('./studioSceneEffects');

const {
    buildStartEmbed,
    getScenePairColor,
    getRandomSceneName
} = require('./sceneEmbeds');

const {
    scheduleScene,
    startScheduledScene
} = require('./sceneScheduler');

const {
    addStudioField,
    sendMirror
} = require('../player-studios/studios');

const {
    displayNameFor,
    fetchConfiguredGuildMember,
    getTwoPersonSceneCategory,
    safeSendUserDm
} = require('./sceneCommon');

const {
    returnReservedBooster
} = require('./pendingSceneRequests');

async function editSceneRequestMessage(
    interaction,
    payload
) {

    await interaction.editReply(
        payload
    );

}

function isBusyWithEachOther(
    requesterId,
    targetId
) {

    return getBusyUser(
        requesterId
    )?.partnerId === targetId &&
        getBusyUser(
            targetId
        )?.partnerId === requesterId;

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
            flags:
                64
        });

        return;

    }

    const existingRequest =
        getPendingRequest(
            requesterId,
            targetId
        );

    if (
        !existingRequest
    ) {

        await interaction.deferUpdate();

        if (
            isBusyWithEachOther(
                requesterId,
                targetId
            )
        )
            return;

        await editSceneRequestMessage(
            interaction,
            {
                content:
                    'This scene request is no longer active.',
                embeds:
                    [],
                components:
                    [],
                attachments:
                    []
            }
        );

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
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    const pendingRequest =
        consumePendingRequest(
            requesterId,
            targetId
        );

    if (
        !pendingRequest
    ) {

        await editSceneRequestMessage(
            interaction,
            {
                content:
                    'This scene request is no longer active.',
                embeds:
                    [],
                components:
                    [],
                attachments:
                    []
            }
        );

        return;

    }

    const requesterMember =
        await fetchConfiguredGuildMember(
            interaction.client,
            requesterId
        );

    const targetMember =
        await fetchConfiguredGuildMember(
            interaction.client,
            targetId
        );

    let sceneCategory;

    try {

        sceneCategory =
            getTwoPersonSceneCategory(
                getMemberCategory(
                    requesterMember
                ),
                getMemberCategory(
                    targetMember
                )
            );

    }
    catch (error) {

        await returnReservedBooster(
            requesterId,
            pendingRequest
        );

        await editSceneRequestMessage(
            interaction,
            {
                content:
                    `Missing role info: ${error.message}`,
                embeds:
                    [],
                components:
                    []
            }
        );

        return;

    }

    if (
        !sceneCategory
    ) {

        await returnReservedBooster(
            requesterId,
            pendingRequest
        );

        await editSceneRequestMessage(
            interaction,
            {
                content:
                    'No matching scene category exists for this role combination.',
                embeds:
                    [],
                components:
                    []
            }
        );

        return;

    }

    const channel =
        interaction.client.channels.cache.get(
            CHANNELS.PORN_CAREER
        ) ??
        await interaction.client.channels.fetch(
            CHANNELS.PORN_CAREER
        ).catch(
            () => null
        );

    if (
        !channel
    ) {

        await returnReservedBooster(
            requesterId,
            pendingRequest
        );

        await editSceneRequestMessage(
            interaction,
            {
                content:
                    'I could not find the porn career channel.',
                embeds:
                    [],
                components:
                    []
            }
        );

        await logWarning(
            interaction.client,
            {
                title:
                    'Porn Career Channel Missing',
                description:
                    `Could not find porn career channel <#${CHANNELS.PORN_CAREER}> while accepting a scene.`,
                fields: [
                    {
                        name:
                            '\uD83D\uDC65 Users',
                        value:
                            `<@${requesterId}> + <@${targetId}>`,
                        inline:
                            false
                    }
                ]
            }
        );

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

    const booster =
        pendingRequest?.booster ?? null;

    const [
        productionManager,
        talentScout,
        marketingExpert
    ] = await Promise.all([
        hasActiveStudioNpc(requesterId, 'production_manager'),
        hasActiveStudioNpc(requesterId, 'talent_scout'),
        hasActiveStudioNpc(requesterId, 'marketing_expert')
    ]);

    const result = calculateStudioSceneResult(
        requesterUser,
        targetUser,
        booster,
        { productionManager, talentScout, marketingExpert }
    );

    const sceneTitle =
        getRandomSceneName(
            sceneCategory
        );

    const sceneColor =
        getScenePairColor(
            requesterId,
            targetId
        );

    const requesterAuthor = {
        name:
            formatPornCareerName(
                requesterMember.displayName,
                requesterUser,
                requesterMember
            ),
        icon:
            mpcLogoAttachment,
        thumbnail:
            requesterMember.user.displayAvatarURL()
    };

    if (!trySetSceneBusy(
        requesterId,
        targetId,
        {
            channelId:
                CHANNELS.PORN_CAREER,
            startedAt:
                Date.now()
        }
    )) {
        await returnReservedBooster(
            requesterId,
            pendingRequest
        );
        await editSceneRequestMessage(
            interaction,
            {
                content: 'One of you started another scene first. This request was cancelled.',
                embeds: [],
                components: [],
                attachments: []
            }
        );
        return;
    }

    await removeFromCommunityProductionCasting(
        interaction.client,
        requesterId
    );
    await removeFromCommunityProductionCasting(
        interaction.client,
        targetId
    );

    await editSceneRequestMessage(
        interaction,
        {
            content:
                `Scene accepted. Filming has started in <#${CHANNELS.PORN_CAREER}>.`,
            embeds:
                [],
            components:
                [],
            attachments:
                []
        }
    );

    const targetDisplayName =
        displayNameFor(
            targetMember,
            targetMember.user
        );

    await safeSendUserDm(
        interaction.client,
        requesterId,
        `${targetDisplayName} accepted your scene request. The scene is starting in <#${CHANNELS.PORN_CAREER}>.`
    );

    const scheduled =
        await scheduleScene(
            channel,
            requesterId,
            targetId,
            sceneCategory,
            result,
            sceneTitle,
            requesterAuthor,
            sceneColor
        );

    const startEmbed =
        buildStartEmbed(
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
        );

    if (
        scheduled.studioScene
    )
        addStudioField(
            startEmbed,
            scheduled.studioScene,
            interaction.guild?.id ??
                process.env.GUILD_ID
        );

    const momentsChannel =
        interaction.client.channels.cache.get(
            CHANNELS.MOMENTS
        ) ??
        await interaction.client.channels.fetch(
            CHANNELS.MOMENTS
        ).catch(
            () => null
        );

    if (
        momentsChannel
    ) {

        await momentsChannel.send({
            embeds: [
                startEmbed
            ]
        });

    }
    else {

        await logWarning(
            interaction.client,
            {
                title:
                    'Porn Scene Start Moment Missing',
                description:
                    `Could not post scene start moment because <#${CHANNELS.MOMENTS}> was unavailable.`,
                fields: [
                    {
                        name:
                            '\uD83C\uDFAC Scene',
                        value:
                            `<@${requesterId}> + <@${targetId}>`,
                        inline:
                            false
                    }
                ]
            }
        );

    }

    if (
        scheduled.studioScene
    )
        await sendMirror(
            interaction.client,
            scheduled.studioScene,
            'started',
            startEmbed
        );

    startScheduledScene(
        interaction.client,
        scheduled.scene
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
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    const pendingRequest =
        consumePendingRequest(
            requesterId,
            targetId
        );

    if (
        !pendingRequest
    ) {

        await editSceneRequestMessage(
            interaction,
            {
                content:
                    'This scene request is no longer active.',
                embeds:
                    [],
                components:
                    [],
                attachments:
                    []
            }
        );

        return;

    }

    await returnReservedBooster(
        requesterId,
        pendingRequest
    );

    await editSceneRequestMessage(
        interaction,
        {
            content:
                'Scene request declined.',
            embeds:
                [],
            components:
                [],
            attachments:
                []
        }
    );

    const targetDisplayName =
        pendingRequest.targetDisplayName ??
        displayNameFor(
            interaction.member,
            interaction.user
        );

    await safeSendUserDm(
        interaction.client,
        requesterId,
        `${targetDisplayName} declined your scene request. Nothing was posted publicly.`
    );

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
