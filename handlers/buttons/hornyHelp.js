const fs =
    require('fs');

const path =
    require('path');

const {
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

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
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const {
    incrementAchievementProgress,
    syncUserAchievementCounters
} = require('../../features/achievements/achievements');

const {
    getMemberCategory
} = require('../../utils/userCategory');

const {
    addHornyHelp,
    addHornyHelped
} = require('../../utils/users');

const {
    getSmartGifFromList
} = require('../../utils/gifs');

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
    getRuntimeDataPath
} = require('../../utils/runtimeData');

const sceneRoot =
    getRuntimeDataPath(
        'scenes'
    );

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

function getRandomHelpScene(
    sceneCategory,
    userIds = []
) {

    const phases =
        [
            'oral',
            'sex'
        ];

    const candidates =
        phases.flatMap(
            (phase) => {

                const filePath =
                    path.join(
                        sceneRoot,
                        sceneCategory,
                        `${phase}.json`
                    );

                if (
                    !fs.existsSync(
                        filePath
                    )
                )
                    return [];

                const gifs =
                    JSON.parse(
                        fs.readFileSync(
                            filePath,
                            'utf8'
                        )
                    );

                return gifs.map(
                    (url, index) => ({

                        phase,
                        url,
                        index:
                            index + 1,
                        total:
                            gifs.length

                    })
                );

            }
        );

    if (
        candidates.length === 0
    )
        return null;

    const smartGif =
        getSmartGifFromList(
            `horny_help:${sceneCategory}`,
            candidates.map(
                (candidate) =>
                    candidate.url
            ),
            userIds
        );

    return candidates.find(
        (candidate) =>
            candidate.url === smartGif.url
    ) ?? null;

}

module.exports = async (
    interaction
) => {

    const targetUserId =
        interaction.customId.split(
            ':'
        )[1];

    if (
        interaction.user.id === targetUserId
    ) {

        return interaction.reply({

            content:
                'You cannot help yourself with this button.',

            flags: 64

        });

    }

    await interaction.deferUpdate();

    let targetMember;

    try {

        targetMember =
            await interaction.guild.members.fetch(
                targetUserId
            );

    }
    catch {

        return interaction.followUp({

            content:
                'I could not find the user who started this horny scene.',

            flags: 64

        });

    }

    let targetCategory;
    let helperCategory;

    try {

        targetCategory =
            getMemberCategory(
                targetMember
            );

        helperCategory =
            getMemberCategory(
                interaction.member
            );

    }
    catch (error) {

        return interaction.followUp({

            content:
                `Missing role info: ${error.message}`,

            flags: 64

        });

    }

    const sceneCategory =
        getSceneCategory(
            targetCategory,
            helperCategory
        );

    if (
        !sceneCategory
    ) {

        return interaction.followUp({

            content:
                'No matching help scene category exists for this role combination.',

            flags: 64

        });

    }

    const scene =
        getRandomHelpScene(
            sceneCategory,
            [
                interaction.user.id,
                targetUserId
            ]
        );

    if (
        !scene
    ) {

        return interaction.followUp({

            content:
                `No oral or sex GIFs were found for ${sceneCategory}.`,

            flags: 64

        });

    }

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
                'Help Arrived',

            description:
                `<@${interaction.user.id}> helps <@${targetUserId}>.\n${pickOne(
                    interactionFlavor.hornyHelp
                )}`,

            image:
                scene.url,

            footerText:
                commandFooter(
                    '/horny',
                    `Help ${scene.phase} GIF #${scene.index}/${scene.total}`
                ),

            timestamp:
                true

        });

    const disabledRow =
        new ActionRowBuilder()
            .addComponents(

                ButtonBuilder
                    .from(
                        interaction.message
                            .components[0]
                            .components[0]
                    )
                    .setDisabled(true)

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

    await Promise.all([
        addHornyHelp(
            interaction.user.id
        ),
        addHornyHelped(
            targetUserId
        )
    ]);

    await Promise.all([
        trackDailyQuest(
            interaction.client,
            interaction.user.id,
            'horny_help'
        ),
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
                'horny_helps'
            ]
        ),
        syncUserAchievementCounters(
            interaction.client,
            targetUserId,
            [
                'horny_helped'
            ]
        ),
        recordActivityMoment(
            interaction.client,
            interaction.user.id,
            'help',
            {
                partnerId:
                    targetUserId
            }
        )
    ]);

};
