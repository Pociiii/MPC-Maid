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
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

const {
    interactionFlavor,
    pickOne
} = require('../../utils/flavorText');

const {
    commandFooter
} = require('../../utils/version');

const {
    recordActivityMoment
} = require('../../features/activity/activityMoments');

const {
    postShowcaseButtonReply
} = require('../../utils/showcaseReplies');

const {
    claimButton,
    replyButtonAlreadyUsed
} = require('../../utils/buttonDedup');

module.exports = async (
    interaction
) => {

    const [
        action,
        targetUserId
    ] =
        interaction.customId.split(
            ':'
        );

    const requiredRole =
        action === 'spank_female'
            ? ROLES.FEMALE
            : ROLES.MALE;

    const roleLabel =
        action === 'spank_female'
            ? 'female'
            : 'male';

    if (
        !interaction.member.roles.cache.has(
            requiredRole
        )
    ) {

        return interaction.reply({
            content:
                `Only ${roleLabel} users can use this spank button.`,
            flags:
                64
        });

    }

    if (
        interaction.user.id === targetUserId
    ) {

        return interaction.reply({
            content:
                'You cannot spank yourself.',
            flags:
                64
        });

    }

    if (
        !claimButton(
            interaction
        )
    ) {

        await replyButtonAlreadyUsed(
            interaction
        );

        return;

    }

    await interaction.deferUpdate();

    const spankGif =
        getRandomGif(
            'spank',
            [
                interaction.user.id,
                targetUserId
            ]
        );

    const embed =
        createEmbed({
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
                `<@${interaction.user.id}> spanks <@${targetUserId}>.\n${pickOne(
                    interactionFlavor.spank
                )}`,
            image:
                spankGif.url,
            footerText:
                commandFooter(
                    '/wiggle',
                    `Spank GIF #${spankGif.index}/${spankGif.total}`
                ),
            timestamp:
                true
        });

    const disabledRow =
        new ActionRowBuilder()
            .addComponents(
                ...interaction.message
                    .components[0]
                    .components
                    .map(
                        (component) =>
                            ButtonBuilder
                                .from(
                                    component
                                )
                                .setDisabled(
                                    component.disabled ||
                                    component.customId ===
                                    interaction.customId
                                )
                    )
            );

    await interaction.message.edit({
        components: [
            disabledRow
        ]
    });

    await postShowcaseButtonReply(
        interaction,
        targetUserId,
        {
            embeds: [
                embed
            ]
        }
    );

    await addSpankGiven(
        interaction.user.id
    );

    await addSpankTaken(
        targetUserId
    );

    await Promise.all([
        trackDailyQuest(
            interaction.client,
            interaction.user.id,
            'social_interaction'
        ),
        trackDailyQuest(
            interaction.client,
            targetUserId,
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
            targetUserId,
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
                    targetUserId
            }
        )
    ]);

};
