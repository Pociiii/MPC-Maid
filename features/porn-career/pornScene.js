const {
    CHANNELS
} = require('../../data/constants');

const {
    getMemberCategory
} = require('../../utils/userCategory');

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
    clearSceneBusy,
    getPendingRequest,
    isBusy,
    removePendingRequest,
    setSceneBusy
} = require('../../utils/pornScenes');

const {
    mpcLogoAttachment,
    mpcLogoPath
} = require('../../utils/mpcLogo');

const {
    logWarning
} = require('../../utils/inboxLogger');

const {
    calculateScene,
    formatStatValue
} = require('./sceneMath');

const {
    buildStartEmbed,
    getRandomSceneName
} = require('./sceneEmbeds');

const {
    scheduleScene
} = require('./sceneScheduler');

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

async function fetchGuildMember(
    interaction,
    userId
) {

    const guild =
        interaction.client.guilds.cache.get(
            process.env.GUILD_ID
        ) ??
        await interaction.client.guilds.fetch(
            process.env.GUILD_ID
        );

    return guild.members.fetch(
        userId
    );

}

async function acceptScene(
    interaction,
    requesterId,
    targetId
) {

    if (
        interaction.user.id !== targetId
    ) {

        await interaction.reply({
            content:
                'Only the requested partner can accept this scene.',
            flags:
                64
        });

        return;

    }

    if (
        isBusy(
            requesterId
        ) ||
        isBusy(
            targetId
        )
    ) {

        await interaction.reply({
            content:
                'One of you is currently filming another scene. Try accepting again later.',
            flags:
                64
        });

        return;

    }

    const requesterMember =
        await fetchGuildMember(
            interaction,
            requesterId
        );

    const targetMember =
        await fetchGuildMember(
            interaction,
            targetId
        );

    let sceneCategory;

    try {

        sceneCategory =
            getSceneCategory(
                getMemberCategory(
                    requesterMember
                ),
                getMemberCategory(
                    targetMember
                )
            );

    }
    catch (error) {

        await interaction.reply({
            content:
                `Missing role info: ${error.message}`,
            flags:
                64
        });

        return;

    }

    if (
        !sceneCategory
    ) {

        await interaction.reply({
            content:
                'No matching scene category exists for this role combination.',
            flags:
                64
        });

        return;

    }

    const channel =
        interaction.client.channels.cache.get(
            CHANNELS.PORN_CAREER
        ) ??
        await interaction.client.channels.fetch(
            CHANNELS.PORN_CAREER
        ).catch(
            () => null
        );

    if (
        !channel
    ) {

        await interaction.reply({
            content:
                'I could not find the porn career channel.',
            flags:
                64
        });

        await logWarning(
            interaction.client,
            {
                title:
                    'Porn Career Channel Missing',
                description:
                    `Could not find porn career channel <#${CHANNELS.PORN_CAREER}> while accepting a scene.`,
                fields: [
                    {
                        name:
                            'Users',
                        value:
                            `<@${requesterId}> + <@${targetId}>`,
                        inline:
                            false
                    }
                ]
            }
        );

        return;

    }

    const requesterUser =
        await getOrCreateUser(
            requesterId
        );

    const targetUser =
        await getOrCreateUser(
            targetId
        );

    const pendingRequest =
        getPendingRequest(
            requesterId,
            targetId
        );

    const booster =
        pendingRequest?.booster ?? null;

    const result =
        calculateScene(
            requesterUser,
            targetUser,
            booster
        );

    const sceneTitle =
        getRandomSceneName(
            sceneCategory
        );

    const requesterAuthor = {
        name:
            formatPornCareerName(
                requesterMember.displayName,
                requesterUser,
                getRankTitle(
                    requesterUser.ranking
                )
            ),
        icon:
            mpcLogoAttachment,
        thumbnail:
            requesterMember.user.displayAvatarURL()
    };

    setSceneBusy(
        requesterId,
        targetId,
        {
            channelId:
                CHANNELS.PORN_CAREER,
            startedAt:
                Date.now()
        }
    );

    removePendingRequest(
        requesterId,
        targetId
    );

    await interaction.update({
        content:
            `Scene accepted. Filming has started in <#${CHANNELS.PORN_CAREER}>.`,
        embeds:
            [],
        components:
            [],
        attachments:
            []
    });

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
                buildStartEmbed(
                    requesterId,
                    targetId,
                    sceneTitle,
                    result,
                    requesterUser,
                    targetUser,
                    booster,
                    requesterAuthor,
                    formatStatValue
                )
            ],
            files: [
                mpcLogoPath
            ]
        });

    }
    else {

        await logWarning(
            interaction.client,
            {
                title:
                    'Porn Scene Start Rumor Missing',
                description:
                    `Could not post scene start rumor because <#${CHANNELS.RUMORS}> was unavailable.`,
                fields: [
                    {
                        name:
                            'Scene',
                        value:
                            `<@${requesterId}> + <@${targetId}>`,
                        inline:
                            false
                    }
                ]
            }
        );

    }

    scheduleScene(
        channel,
        requesterId,
        targetId,
        sceneCategory,
        result,
        sceneTitle,
        requesterAuthor
    );

}

async function declineScene(
    interaction,
    requesterId,
    targetId
) {

    if (
        interaction.user.id !== targetId
    ) {

        await interaction.reply({
            content:
                'Only the requested partner can decline this scene.',
            flags:
                64
        });

        return;

    }

    removePendingRequest(
        requesterId,
        targetId
    );

    await interaction.update({
        content:
            'Scene request declined.',
        embeds:
            [],
        components:
            [],
        attachments:
            []
    });

}

module.exports = {

    async execute(
        interaction
    ) {

        const [
            action,
            requesterId,
            targetId
        ] =
            interaction.customId.split(
                ':'
            );

        if (
            action === 'pornscene_accept'
        ) {

            await acceptScene(
                interaction,
                requesterId,
                targetId
            );

            return;

        }

        if (
            action === 'pornscene_decline'
        ) {

            await declineScene(
                interaction,
                requesterId,
                targetId
            );

        }

    }

};
