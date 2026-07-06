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
            flags:
                64
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

        await interaction.update({
            content:
                'This scene request is no longer active.',
            embeds:
                [],
            components:
                [],
            attachments:
                []
        });

        return;

    }

    await interaction.deferUpdate();

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

        await interaction.editReply({
            content:
                `Missing role info: ${error.message}`,
            embeds:
                [],
            components:
                []
        });

        return;

    }

    if (
        !sceneCategory
    ) {

        await interaction.editReply({
            content:
                'No matching scene category exists for this role combination.',
            embeds:
                [],
            components:
                []
        });

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

        await interaction.editReply({
            content:
                'I could not find the porn career channel.',
            embeds:
                [],
            components:
                []
        });

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

    await interaction.editReply({
        content:
            `Scene accepted. Filming has started in <#${CHANNELS.PORN_CAREER}>.`,
        embeds:
            [],
        components:
            [],
        attachments:
            []
    });

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

    const pendingRequest =
        consumePendingRequest(
            requesterId,
            targetId
        );

    if (
        !pendingRequest
    ) {

        await interaction.update({
            content:
                'This scene request is no longer active.',
            embeds:
                [],
            components:
                [],
            attachments:
                []
        });

        return;

    }

    await interaction.update({
        content:
            'Scene request declined.',
        embeds:
            [],
        components:
            [],
        attachments:
            []
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
