const {
    EmbedBuilder
} = require('discord.js');

const {
    commandFooter
} = require('../../utils/version');

function getFieldValue(
    embed,
    fieldName
) {

    return embed.fields
        ?.find(
            (field) =>
                field.name === fieldName
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
                    '/gifsubmit'
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
                    '/gifsubmit'
                )
        });

}

module.exports = {
    buildApprovalFeedEmbed,
    buildApprovedEmbed,
    getGifUrl,
    getSubmitterId
};
