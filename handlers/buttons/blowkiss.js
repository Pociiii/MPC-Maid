const {
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

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

const ROLES =
    require('../../data/roles.json');

const {

    addKissGiven,
    addKissTaken

} = require('../../utils/users');

const {
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const {
    incrementAchievementProgress,
    syncUserAchievementCounters
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

module.exports = async (
    interaction
) => {
    if (
        !interaction.member.roles.cache.has(
            ROLES.FEMALE
        )
    ) {

        return interaction.reply({

            content:
                '🚫 Only female users can blow a kiss.',

            flags: 64

        });

    }
    const targetUserId =
        interaction.customId.split(':')[1];

    const kissGif =
        getRandomGif(
            'blowkiss',
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
                'Blow Kiss',

            description:
                `<@${interaction.user.id}> blows a kiss to <@${targetUserId}>.\n${pickOne(
                    interactionFlavor.kiss
                )}`,

            image:
                kissGif.url,

            footerText:
                commandFooter(
                    '/flex',
                    `Kiss GIF #${kissGif.index}/${kissGif.total}`
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

    await interaction.deferUpdate();

    await interaction.message.edit({

        components: [
            disabledRow
        ]

    });

    await interaction.followUp({

        embeds: [embed]

    });

    await addKissGiven(
        interaction.user.id
    );

    await addKissTaken(
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
                'kisses_given'
            ]
        ),
        syncUserAchievementCounters(
            interaction.client,
            targetUserId,
            [
                'kisses_taken'
            ]
        ),
        recordActivityMoment(
            interaction.client,
            interaction.user.id,
            'kiss',
            {
                partnerId:
                    targetUserId
            }
        )
    ]);

};
