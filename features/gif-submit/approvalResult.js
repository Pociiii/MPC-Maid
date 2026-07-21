const {
    EmbedBuilder
} = require('discord.js');

const {
    commandFooter
} = require('../../utils/version');

const {
    maidFeedFlavor,
    pickOne
} = require('../../utils/flavorText');

function getFieldValue(
    embed,
    fieldName
) {

    return embed.fields
        ?.find(
            (field) =>
                field.name === fieldName ||
                field.name.endsWith(
                    ` ${fieldName}`
                )
        )
        ?.value;

}

function getGifUrl(
    embed
) {

    return getFieldValue(
        embed,
        'URL'
    ) ?? embed.footer?.text;

}

function getSubmitterId(
    embed
) {

    return getFieldValue(
        embed,
        'Submitted By'
    )
        ?.match(
            /<@(\d+)>/
        )?.[1];

}

function buildApprovedEmbed(
    originalEmbed,
    {
        approvedBy,
        categoryName,
        gifUrl,
        submitter,
        totalCount
    }
) {

    return EmbedBuilder.from(
        originalEmbed
    )
        .setTitle(
            'GIF Approved'
        )
        .setDescription(
            null
        )
        .setFooter({
            text:
                commandFooter(
                    'GIF Submission Panel'
                )
        })
        .setFields(
            {
                name:
                    '✅ Approved By',
                value:
                    `${approvedBy}`,
                inline:
                    true
            },
            {
                name:
                    '👤 Submitted By',
                value:
                    submitter
                        ? `<@${submitter}>`
                        : 'Unknown',
                inline:
                    true
            },
            {
                name:
                    '📁 Category',
                value:
                    categoryName,
                inline:
                    true
            },
            {
                name:
                    '📊 Total GIFs',
                value:
                    String(
                        totalCount
                    ),
                inline:
                    true
            },
            {
                name:
                    '🔗 URL',
                value:
                    gifUrl,
                inline:
                    false
            }
        );

}

function buildApprovalFeedEmbed(
    approvedEmbed,
    {
        categoryName,
        gifChannelId,
        submitter,
        totalCount
    }
) {

    return EmbedBuilder.from(
        approvedEmbed
    )
        .setTitle(
            'New GIF Added'
        )
        .setDescription(
            pickOne(
                maidFeedFlavor.gifApproval
            )
        )
        .setFields(
            {
                name:
                    '📁 Category',
                value:
                    categoryName,
                inline:
                    true
            },
            {
                name:
                    '📊 Total GIFs',
                value:
                    String(
                        totalCount
                    ),
                inline:
                    true
            },
            {
                name:
                    '👤 Submitted By',
                value:
                    submitter
                        ? `<@${submitter}>`
                        : 'Unknown',
                inline:
                    true
            },
            {
                name:
                    '📤 Submit Your Own GIF',
                value:
                    `<#${gifChannelId}>`,
                inline:
                    true
            }
        )
        .setFooter({
            text:
                commandFooter(
                    'GIF Submission Panel'
                )
        });

}

module.exports = {
    buildApprovalFeedEmbed,
    buildApprovedEmbed,
    getGifUrl,
    getSubmitterId
};
