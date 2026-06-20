const {
    EmbedBuilder
} = require('discord.js');

const {
    addGifToFile,
    findGifInData,
    getGifCount
} = require('./gifs');

const {
    CHANNELS
} = require('../data/constants');

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
        .setFooter(
            null
        )
        .setFields(
            {
                name:
                    'Approved By',
                value:
                    `${approvedBy}`,
                inline:
                    true
            },
            {
                name:
                    'Submitted By',
                value:
                    submitter
                        ? `<@${submitter}>`
                        : 'Unknown',
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
                    'Total GIFs',
                value:
                    String(
                        totalCount
                    ),
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

}

async function approveGif(
    interaction,
    filePath,
    categoryName = 'Unknown'
) {

    const originalEmbed =
        interaction.message.embeds[0];

    const gifUrl =
        getGifUrl(
            originalEmbed
        );

    const submitter =
        getFieldValue(
            originalEmbed,
            'Submitted By'
        )
            ?.match(
                /<@(\d+)>/
            )?.[1];

    const existingGif =
        findGifInData(
            gifUrl
        );

    if (
        existingGif &&
        existingGif !== filePath
    ) {

        return interaction.reply({
            content:
                'This GIF already exists in another data file.',
            flags:
                64
        });

    }

    const added =
        addGifToFile(
            filePath,
            gifUrl
        );

    const totalCount =
        getGifCount(
            filePath
        );

    if (
        !added
    ) {

        return interaction.reply({
            content:
                'This GIF already exists in this category.',
            flags:
                64
        });

    }

    const approvedEmbed =
        buildApprovedEmbed(
            originalEmbed,
            {
                approvedBy:
                    interaction.user,
                categoryName,
                gifUrl,
                submitter,
                totalCount
            }
        );

    await interaction.update({
        content:
            null,
        embeds: [
            approvedEmbed
        ],
        components:
            []
    });

    const rumorsChannel =
        interaction.client.channels.cache.get(
            CHANNELS.RUMORS
        );

    if (
        rumorsChannel
    ) {

        const rumorEmbed =
            EmbedBuilder.from(
                approvedEmbed
            )
                .setTitle(
                    'New GIF Added'
                )
                .spliceFields(
                    0,
                    1
                )
                .addFields({
                    name:
                        'Submit Your Own GIF',
                    value:
                        `<#${CHANNELS.GIFS}>`,
                    inline:
                        true
                });

        await rumorsChannel.send({
            embeds: [
                rumorEmbed
            ]
        });

    }

}

module.exports = {
    approveGif
};
