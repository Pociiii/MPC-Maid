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
    logWarning
} = require('../../utils/inboxLogger');

const {
    postRumor
} = require('../../utils/rumors');

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
`<@${interaction.user.id}> wants to make a porn scene with you.

Booster: **${formatBooster(
    booster
)}**

Tip: use \`/train\` to raise stats and help your scene partner get better outcomes.`,
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

        const rumorMessage =
            await postRumor(
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
                        'Porn Scene Rumor',
                    flavor:
`A new production is being whispered about backstage.

<@${interaction.user.id}> is talking scene with <@${targetId}>.`,
                    command:
                        '/pornscene',
                    fields: [
                        {
                            name:
                                'Booster',
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
            !rumorMessage
        ) {

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
