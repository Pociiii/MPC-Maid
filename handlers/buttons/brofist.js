const {
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

const ROLES =
    require('../../data/roles.json');

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
    addBrofistGiven,
    addBrofistTaken
} = require('../../utils/users');

const {
    getGifList,
    getRandomGif
} = require('../../utils/gifs');

const {
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const {
    incrementAchievementProgress
} = require('../../features/achievements/achievements');

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

function buildDisabledRow(
    interaction
) {

    return new ActionRowBuilder()
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

}

module.exports = async (
    interaction
) => {

    const targetUserId =
        interaction.customId.split(
            ':'
        )[1];

    if (
        !interaction.member.roles.cache.has(
            ROLES.MALE
        )
    ) {

        await interaction.reply({
            content:
                'Only male users can use Brofist.',
            flags:
                64
        });

        return;

    }

    if (
        interaction.user.id === targetUserId
    ) {

        await interaction.reply({
            content:
                'You cannot brofist yourself.',
            flags:
                64
        });

        return;

    }

    if (
        getGifList(
            'brofist'
        ).length === 0
    ) {

        await interaction.reply({
            content:
                'No Brofist GIFs are ready yet. Use `/gifsubmit` to send some in.',
            flags:
                64
        });

        return;

    }

    const brofistGif =
        getRandomGif(
            'brofist',
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
                'Brofist',
            description:
                `<@${interaction.user.id}> brofists <@${targetUserId}>.\n${pickOne(
                    interactionFlavor.brofist
                )}`,
            image:
                brofistGif.url,
            footerText:
                commandFooter(
                    '/flex',
                    `Brofist GIF #${brofistGif.index}/${brofistGif.total}`
                ),
            timestamp:
                true
        });

    await interaction.deferUpdate();

    await interaction.message.edit({
        components: [
            buildDisabledRow(
                interaction
            )
        ]
    });

    await interaction.followUp({
        embeds: [
            embed
        ]
    });

    await Promise.all([
        addBrofistGiven(
            interaction.user.id
        ),
        addBrofistTaken(
            targetUserId
        )
    ]);

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
        recordActivityMoment(
            interaction.client,
            interaction.user.id,
            'brofist',
            {
                partnerId:
                    targetUserId
            }
        )
    ]);

};
