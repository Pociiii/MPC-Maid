const ROLES =
    require('../../data/roles.json');

const {
    getRandomGif
} = require('../../utils/gifs');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    adpLogoPath,
    adpLogoAttachment
} = require('../../utils/adpLogo');

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
    incrementAchievementProgress
} = require('../../features/achievements/achievements');

const {
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

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

    const spankGif =
        getRandomGif(
            'spank'
        );

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            authorName:
                interaction.member.displayName,
            authorIcon:
                adpLogoAttachment,
            thumbnail:
                interaction.user.displayAvatarURL(),
            title:
                'Spank!',
            description:
                `<@${interaction.user.id}> spanks <@${targetUserId}>.`,
            image:
                spankGif.url,
            footerText:
                `GIF #${spankGif.index}/${spankGif.total}`,
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

    await interaction.deferUpdate();

    await interaction.message.edit({
        components: [
            disabledRow
        ]
    });

    await addSpankGiven(
        interaction.user.id
    );

    await addSpankTaken(
        targetUserId
    );

    await interaction.followUp({
        embeds: [
            embed
        ],
        files: [
            adpLogoPath
        ]
    });

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
        )
    ]);

};
