const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    addPendingRequest,
    getPendingRequest,
    removePendingRequest
} = require('../../utils/pornScenes');

const {
    getOrCreateUser
} = require('../../utils/users');

const {
    formatPornCareerName
} = require('../../utils/pornCareerTitles');

const {
    addBooster,
    formatBooster,
    removeBooster
} = require('../../utils/boosters');

const {
    mpcLogoAttachment
} = require('../../utils/mpcLogo');

const {
    getSceneCategoryLabel
} = require('../../data/sceneSubmitGroups');

const {
    logWarning
} = require('../../utils/inboxLogger');

const {
    postMoment
} = require('../../utils/moments');

const requestExpiryMs =
    24 * 60 * 60 * 1000;

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

function getSceneCategoryName(
    sceneCategory
) {

    const group =
        sceneCategory
            .split(
                '_'
            )
            .every(
                (part) =>
                    part.endsWith(
                        'f'
                    )
            )
            ? 'ff'
            : 'mf';

    return getSceneCategoryLabel(
        group,
        sceneCategory
    );

}

function scheduleRequestExpiry(
    message,
    requesterId,
    targetId
) {

    const timeout =
        setTimeout(
            async () => {

                const pendingRequest =
                    getPendingRequest(
                        requesterId,
                        targetId
                    );

                if (
                    !pendingRequest ||
                    pendingRequest.messageId !== message.id
                )
                    return;

                removePendingRequest(
                    requesterId,
                    targetId
                );

                await safeSendUserDm(
                    message.client,
                    requesterId,
                    `${pendingRequest.targetDisplayName ?? 'Your partner'} did not answer the scene request in time. The request expired.`
                );

                await message.edit({
                    content:
                        'Scene request expired.',
                    embeds:
                        [],
                    components:
                        [],
                    attachments:
                        []
                }).catch(
                    () => null
                );

            },
            requestExpiryMs
        );

    timeout.unref?.();

}

async function sendPornSceneRequest(
    interaction,
    targetId,
    sceneCategory,
    booster = null
) {

    const target =
        await interaction.client.users.fetch(
            targetId
        );

    const targetMember =
        await interaction.guild.members.fetch(
            targetId
        ).catch(
            () => null
        );

    const targetDisplayName =
        displayNameFor(
            targetMember,
            target
        );

    const requesterUser =
        await getOrCreateUser(
            interaction.user.id
        );

    const requesterName =
        formatPornCareerName(
            interaction.member.displayName,
            requesterUser,
            interaction.member
        );

    const row =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `pornscene_accept:${interaction.user.id}:${targetId}`
                    )
                    .setLabel(
                        'Accept'
                    )
                    .setEmoji(
                        '✅'
                    )
                    .setStyle(
                        ButtonStyle.Success
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `pornscene_decline:${interaction.user.id}:${targetId}`
                    )
                    .setLabel(
                        'Decline'
                    )
                    .setEmoji(
                        '❌'
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    )
            );

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            authorName:
                requesterName,
            authorIcon:
                mpcLogoAttachment,
            title:
                'Porn Scene Request',
            description:
                'A scene request is waiting for your answer.',
            thumbnail:
                interaction.user.displayAvatarURL(),
            footerText:
                '/pornscene',
            timestamp:
            true
        });

    embed.addFields(
        {
            name:
                '\uD83D\uDC65 Cast',
            value:
                `<@${interaction.user.id}> + <@${targetId}>\n${getSceneCategoryName(
                    sceneCategory
                )}`,
            inline:
                false
        },
        {
            name:
                '\uD83D\uDE80 Booster',
            value:
                formatBooster(
                    booster
                ),
            inline:
                true
        },
        {
            name:
                '\uD83D\uDCA1 Tip',
            value:
                'Use `/train` to raise stats and help your scene partner get better outcomes.',
            inline:
                false
        }
    );

    if (
        booster
    ) {

        const removed =
            await removeBooster(
                interaction.user.id,
                booster.stat,
                booster.tier
            );

        if (
            !removed
        )
            throw new Error(
                'Booster is no longer available.'
            );

    }

    let message;

    try {

        message =
            await target.send({
                embeds: [
                    embed
                ],
                components: [
                    row
                ]
            });

    }
    catch (error) {

        if (
            booster
        )
            await addBooster(
                interaction.user.id,
                booster.stat,
                booster.tier
            );

        await logWarning(
            interaction.client,
            {
                title:
                    'Porn Scene Request DM Failed',
                description:
                    'The request DM could not be delivered. Any consumed booster was returned.',
                fields: [
                    {
                        name:
                            '\uD83D\uDC64 Requester',
                        value:
                            `<@${interaction.user.id}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83C\uDFAF Target',
                        value:
                            `<@${targetId}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83D\uDCDD Reason',
                        value:
                            error.message || 'Unknown error',
                        inline:
                            false
                    }
                ]
            }
        );

        throw error;

    }

    addPendingRequest(
        interaction.user.id,
        targetId,
        {
            channelId:
                CHANNELS.PORN_CAREER,
            messageId:
                message.id,
            expiresAt:
                Date.now() + requestExpiryMs,
            targetDisplayName,
            sceneCategory,
            booster
        }
    );

    await safeSendUserDm(
        interaction.client,
        interaction.user.id,
        `Your scene request was sent to ${targetDisplayName}. Waiting for them to accept or decline.`
    );

    scheduleRequestExpiry(
        message,
        interaction.user.id,
        targetId
    );

    try {

        const momentMessage =
            await postMoment(
                interaction.client,
                {
                    type:
                        'scene_request',
                    color:
                        getRandomColor(),
                    authorName:
                        requesterName,
                    authorIcon:
                        mpcLogoAttachment,
                    thumbnail:
                        interaction.user.displayAvatarURL(),
                    title:
                        'Porn Scene Moment',
                    flavor:
                        'A new production just became a Moment backstage.',
                    command:
                        '/pornscene',
                    fields: [
                        {
                            name:
                                '\uD83D\uDC65 Cast',
                            value:
                                `<@${interaction.user.id}> + <@${targetId}>\n${getSceneCategoryName(
                                    sceneCategory
                                )}`,
                            inline:
                                false
                        },
                        {
                            name:
                                '\uD83D\uDE80 Booster',
                            value:
                                formatBooster(
                                    booster
                                ),
                            inline:
                                true
                        }
                    ]
                }
            );

        if (
            !momentMessage
        ) {

            await logWarning(
                interaction.client,
                {
                    title:
                        'Porn Scene Request Moment Missing',
                    description:
                        `Could not post the request moment because <#${CHANNELS.MOMENTS}> was unavailable.`,
                    fields: [
                        {
                            name:
                                '\uD83D\uDC64 Requester',
                            value:
                                `<@${interaction.user.id}>`,
                            inline:
                                true
                        },
                        {
                            name:
                                '\uD83C\uDFAF Target',
                            value:
                                `<@${targetId}>`,
                            inline:
                                true
                        }
                    ]
                }
            );

        }

    }
    catch (error) {

        console.error(
            'PORN SCENE MOMENT ERROR'
        );
        console.error(
            error
        );

        await logWarning(
            interaction.client,
            {
                title:
                    'Porn Scene Request Moment Failed',
                description:
                    `Could not post the request moment in <#${CHANNELS.MOMENTS}>.`,
                fields: [
                    {
                        name:
                            '\uD83D\uDC64 Requester',
                        value:
                            `<@${interaction.user.id}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83C\uDFAF Target',
                        value:
                            `<@${targetId}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            '\uD83D\uDCDD Reason',
                        value:
                            error.message || 'Unknown error',
                        inline:
                            false
                    }
                ]
            }
        );

    }

}

module.exports = {
    sendPornSceneRequest
};
