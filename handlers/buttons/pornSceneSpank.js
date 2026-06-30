const {
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

const ROLES =
    require('../../data/roles.json');

const {
    getRandomGif
} = require('../../utils/gifs');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    mpcLogoAttachment
} = require('../../utils/mpcLogo');

const {
    getRandomColor
} = require('../../data/constants');

const {
    addSpankGiven,
    addSpankTaken
} = require('../../utils/users');

const {
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const {
    incrementAchievementProgress,
    syncUserAchievementCounters
} = require('../../features/achievements/achievements');

const {
    recordActivityMoment
} = require('../../features/activity/activityMoments');

const {
    interactionFlavor,
    pickOne
} = require('../../utils/flavorText');

const {
    commandFooter
} = require('../../utils/version');

const claimedSpankMessages =
    new Set();

function disableClickedButton(
    message,
    customId
) {

    return message.components.map(
        (row) =>
            new ActionRowBuilder()
                .addComponents(
                    ...row.components.map(
                        (component) =>
                            ButtonBuilder
                                .from(
                                    component
                                )
                                .setDisabled(
                                    component.disabled ||
                                    component.customId === customId
                                )
                    )
                )
    );

}

function isFemaleScene(
    sceneCategory
) {

    return sceneCategory
        .split(
            '_'
        )
        .every(
            (part) =>
                part.endsWith(
                    'f'
                )
        );

}

function buildSpankEmbed(
    interaction,
    receiverId
) {

    const spankGif =
        getRandomGif(
            'spank',
            [
                interaction.user.id,
                receiverId
            ]
        );

    return createEmbed({
        color:
            getRandomColor(),
        authorName:
            interaction.member.displayName,
        authorIcon:
            mpcLogoAttachment,
        thumbnail:
            interaction.user.displayAvatarURL(),
        title:
            'Spank!',
        description:
            `<@${interaction.user.id}> spanks <@${receiverId}>.\n${pickOne(
                interactionFlavor.spank
            )}`,
        image:
            spankGif.url,
        footerText:
            commandFooter(
                '/pornscene',
                `Spank GIF #${spankGif.index}/${spankGif.total}`
            ),
        timestamp:
            true
    });

}

module.exports = async function handlePornSceneSpank(
    interaction
) {

    const [
        ,
        requesterId,
        targetId,
        sceneCategory
    ] =
        interaction.customId.split(
            ':'
        );

    const sceneUserIds =
        [
            requesterId,
            targetId
        ];

    if (
        !sceneUserIds.includes(
            interaction.user.id
        )
    ) {

        await interaction.reply({
            content:
                'Only the performers in this scene can use this spank button.',
            flags:
                64
        });

        return;

    }

    if (
        !isFemaleScene(
            sceneCategory
        ) &&
        !interaction.member.roles.cache.has(
            ROLES.MALE
        )
    ) {

        await interaction.reply({
            content:
                'Only the male performer can use this spank button for MF scenes.',
            flags:
                64
        });

        return;

    }

    const receiverId =
        interaction.user.id === requesterId
            ? targetId
            : requesterId;

    if (
        claimedSpankMessages.has(
            interaction.message.id
        )
    ) {

        await interaction.reply({
            content:
                'This scene spank was already used.',
            flags:
                64
        });

        return;

    }

    claimedSpankMessages.add(
        interaction.message.id
    );

    await interaction.deferUpdate();

    await interaction.message.edit({
        components:
            disableClickedButton(
                interaction.message,
                interaction.customId
            )
    });

    await interaction.message.reply({
        content:
            `<@${receiverId}>`,
        embeds: [
            buildSpankEmbed(
                interaction,
                receiverId
            )
        ],
        allowedMentions: {
            users: [
                receiverId
            ]
        }
    });

    await addSpankGiven(
        interaction.user.id
    );

    await addSpankTaken(
        receiverId
    );

    await Promise.all([
        trackDailyQuest(
            interaction.client,
            interaction.user.id,
            'social_interaction'
        ),
        trackDailyQuest(
            interaction.client,
            receiverId,
            'social_interaction'
        ),
        incrementAchievementProgress(
            interaction.client,
            interaction.user.id,
            'button_interactions'
        ),
        syncUserAchievementCounters(
            interaction.client,
            interaction.user.id,
            [
                'spanks_given'
            ]
        ),
        syncUserAchievementCounters(
            interaction.client,
            receiverId,
            [
                'spanks_taken'
            ]
        ),
        recordActivityMoment(
            interaction.client,
            interaction.user.id,
            'spank',
            {
                partnerId:
                    receiverId
            }
        )
    ]);

};
