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
    addPendingRequest
} = require('../../utils/pornScenes');

const {
    getOrCreateUser
} = require('../../utils/users');

const {
    getRankTitle
} = require('../../utils/ranks');

const {
    formatPornCareerName
} = require('../../utils/pornCareerTitles');

const {
    addBooster,
    formatBooster,
    removeBooster
} = require('../../utils/boosters');

const {
    adpLogoPath,
    adpLogoAttachment
} = require('../../utils/adpLogo');

const {
    logWarning
} = require('../../utils/inboxLogger');

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

    const requesterUser =
        await getOrCreateUser(
            interaction.user.id
        );

    const requesterRank =
        getRankTitle(
            requesterUser.ranking
        );

    const requesterName =
        formatPornCareerName(
            interaction.member.displayName,
            requesterUser,
            requesterRank
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
                adpLogoAttachment,
            title:
                'Porn Scene Request',
            description:
`<@${interaction.user.id}> wants to make a porn scene with you.

Booster: **${formatBooster(
    booster
)}**`,
            thumbnail:
                interaction.user.displayAvatarURL(),
            footerText:
                '/pornscene',
            timestamp:
                true
        });

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
                ],
                files: [
                    adpLogoPath
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
                            'Requester',
                        value:
                            `<@${interaction.user.id}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            'Target',
                        value:
                            `<@${targetId}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            'Reason',
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
            sceneCategory,
            booster
        }
    );

    try {

        const rumorsChannel =
            interaction.client.channels.cache.get(
                CHANNELS.RUMORS
            ) ??
            await interaction.client.channels.fetch(
                CHANNELS.RUMORS
            ).catch(
                () => null
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
                        requesterName,
                    authorIcon:
                        adpLogoAttachment,
                    title:
                        'Porn Scene Rumor',
                        description:
`<@${interaction.user.id}> is talking scene with <@${targetId}>.

Booster: **${formatBooster(
    booster
)}**`,
                    thumbnail:
                        interaction.user.displayAvatarURL(),
                    footerText:
                        '/pornscene',
                    timestamp:
                            true
                    })
                ],
                files: [
                    adpLogoPath
                ]
            });

        }
        else {

            await logWarning(
                interaction.client,
                {
                    title:
                        'Porn Scene Request Rumor Missing',
                    description:
                        `Could not post the request rumor because <#${CHANNELS.RUMORS}> was unavailable.`,
                    fields: [
                        {
                            name:
                                'Requester',
                            value:
                                `<@${interaction.user.id}>`,
                            inline:
                                true
                        },
                        {
                            name:
                                'Target',
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
            'PORN SCENE RUMOR ERROR'
        );
        console.error(
            error
        );

        await logWarning(
            interaction.client,
            {
                title:
                    'Porn Scene Request Rumor Failed',
                description:
                    `Could not post the request rumor in <#${CHANNELS.RUMORS}>.`,
                fields: [
                    {
                        name:
                            'Requester',
                        value:
                            `<@${interaction.user.id}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            'Target',
                        value:
                            `<@${targetId}>`,
                        inline:
                            true
                    },
                    {
                        name:
                            'Reason',
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
