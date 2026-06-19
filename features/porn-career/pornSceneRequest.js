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
    addBooster,
    boosterTiers,
    removeBooster
} = require('../../utils/boosters');

const statLabels = {
    performance: 'Performance',
    stamina: 'Stamina',
    fame: 'Fame'
};

function formatBooster(
    booster
) {

    if (
        !booster
    )
        return 'None';

    return `${statLabels[booster.stat]} T${booster.tier} (+${boosterTiers[booster.tier].value})`;

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
            title:
                'Porn Scene Request',
            description:
`<@${interaction.user.id}> wants to make a porn scene with you.

Booster: **${formatBooster(
    booster
)}**`,
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
                            interaction.member.displayName,
                        authorIcon:
                            interaction.user.displayAvatarURL(),
                        title:
                            'Porn Scene Rumor',
                        description:
`<@${interaction.user.id}> is talking scene with <@${targetId}>.

Booster: **${formatBooster(
    booster
)}**`,
                        footerText:
                            '/pornscene',
                        timestamp:
                            true
                    })
                ]
            });

        }

    }
    catch (error) {

        console.error(
            'PORN SCENE RUMOR ERROR'
        );
        console.error(
            error
        );

    }

}

module.exports = {
    formatBooster,
    sendPornSceneRequest
};
