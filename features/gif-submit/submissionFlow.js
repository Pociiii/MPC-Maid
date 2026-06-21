const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const {
    CHANNELS,
    getRandomColor
} = require('../../data/constants');

const {
    getSceneCategoryName,
    getSceneGroupKey
} = require('../../data/sceneSubmitGroups');

const {
    createEmbed
} = require('../../utils/embeds');

function parseSubmissionCustomId(
    customId
) {

    const parts =
        customId.split(
            ':'
        );

    const isSceneSubmission =
        parts.length >= 3;

    const group =
        isSceneSubmission
            ? getSceneGroupKey(
                parts[1]
            )
            : null;

    const category =
        isSceneSubmission
            ? parts[2]
            : parts[1];

    return {
        category,
        categoryName:
            isSceneSubmission
                ? getSceneCategoryName(
                    group,
                    category
                )
                : category,
        group,
        isSceneSubmission
    };

}

function buildGifUrlModal(
    customId
) {

    const gifInput =
        new TextInputBuilder()
            .setCustomId(
                'gif_url'
            )
            .setLabel(
                'GIF URL'
            )
            .setStyle(
                TextInputStyle.Short
            )
            .setRequired(
                true
            )
            .setPlaceholder(
                'https://...'
            );

    return new ModalBuilder()
        .setCustomId(
            customId
        )
        .setTitle(
            'GIF Submission'
        )
        .addComponents(
            new ActionRowBuilder()
                .addComponents(
                    gifInput
                )
        );

}

function buildReviewEmbed(
    {
        categoryName,
        gifUrl,
        submitterId
    }
) {

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                'GIF Submission',
            image:
                gifUrl,
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                'Submitted By',
            value:
                `<@${submitterId}>`,
            inline:
                true
        },
        {
            name:
                'Category',
            value:
                categoryName,
            inline:
                true
        },
        {
            name:
                'URL',
            value:
                gifUrl,
            inline:
                false
        }
    );

    return embed;

}

function buildReviewComponents(
    {
        category,
        group,
        isSceneSubmission,
        submitterId
    }
) {

    const approvalPrefix =
        isSceneSubmission
            ? `${group}:${category}:${submitterId}`
            : `${category}:${submitterId}`;

    return [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `gifapprove:${approvalPrefix}`
                    )
                    .setLabel(
                        'Approve'
                    )
                    .setStyle(
                        ButtonStyle.Success
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        `gifreject:${approvalPrefix}`
                    )
                    .setLabel(
                        'Reject'
                    )
                    .setStyle(
                        ButtonStyle.Danger
                    )
            )
    ];

}

function buildDuplicateEmbed(
    gifUrl
) {

    return createEmbed({
        color:
            getRandomColor(),
        title:
            'Duplicate GIF',
        description:
            'This GIF already exists in the data folder, so it was not sent for review.',
        image:
            gifUrl,
        footerText:
            '/gifsubmit',
        timestamp:
            true
    });

}

function buildSubmittedEmbed() {

    return createEmbed({
        color:
            getRandomColor(),
        description:
            'GIF submitted for review.',
        footerText:
            '/gifsubmit',
        timestamp:
            true
    });

}

function buildReviewChannelMissingEmbed() {

    return createEmbed({
        color:
            getRandomColor(),
        title:
            'Review Channel Missing',
        description:
            'The GIF review channel is not available right now, so the submission was not sent.',
        footerText:
            '/gifsubmit',
        timestamp:
            true
    });

}

function getReviewChannel(
    client
) {

    return client.channels.cache.get(
        CHANNELS.GIF_REVIEW
    );

}

module.exports = {
    buildDuplicateEmbed,
    buildGifUrlModal,
    buildReviewChannelMissingEmbed,
    buildReviewComponents,
    buildReviewEmbed,
    buildSubmittedEmbed,
    getReviewChannel,
    parseSubmissionCustomId
};
