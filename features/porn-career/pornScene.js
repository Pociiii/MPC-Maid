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
    isBusy,
    setSceneBusy
} = require('../../utils/pornScenes');

const {
    mpcLogoAttachment
} = require('../../utils/mpcLogo');

const {
    logWarning
} = require('../../utils/inboxLogger');

const {
    calculateScene,
    formatStatValue
} = require('./sceneMath');

const {
    buildStartEmbed,
    getScenePairColor,
    getRandomSceneName
} = require('./sceneEmbeds');

const {
    scheduleScene
} = require('./sceneScheduler');

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

function displayNameFor(
    member,
    user
) {

    return member?.displayName ??
        user?.globalName ??
        user?.username ??
        'that user';

}

async function safeSendUserDm(
    client,
    userId,
    content
) {

    try {

        const user =
            await client.users.fetch(
                userId
            );

        await user.send({
            content
        });

        return true;

    }
    catch {

        return false;

    }

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

async function editSceneRequestMessage(
    interaction,
    payload
) {

    if (
        interaction.message?.editable !== false
    ) {

        await interaction.message.edit(
            payload
        );

        return;

    }

    await interaction.editReply(
        payload
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
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    if (
        isBusy(
            requesterId
        ) ||
        isBusy(
            targetId
        )
    ) {

        await interaction.followUp({
            content:
                'One of you is currently filming another scene. Try accepting again later.',
            flags:
                64
        });

        return;

    }

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

    const result =
        calculateScene(
            requesterUser,
            targetUser,
            booster
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
                )
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

    scheduleScene(
        channel,
        requesterId,
        targetId,
        sceneCategory,
        result,
        sceneTitle,
        requesterAuthor,
        sceneColor
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
