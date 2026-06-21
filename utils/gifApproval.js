const {
    addGifToFile,
    findGifInData,
    getGifCount
} = require('./gifs');

const {
    CHANNELS
} = require('../data/constants');

const {
    buildApprovalRumorEmbed,
    buildApprovedEmbed,
    getGifUrl,
    getSubmitterId
} = require('../features/gif-submit/approvalResult');

function duplicateReply(
    scope
) {

    return {
        content:
            `This GIF already exists in ${scope}.`,
        flags:
            64
    };

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
        getSubmitterId(
            originalEmbed
        );

    const existingGif =
        findGifInData(
            gifUrl
        );

    if (
        existingGif &&
        existingGif !== filePath
    ) {

        return interaction.reply(
            duplicateReply(
                'another data file'
            )
        );

    }

    const added =
        addGifToFile(
            filePath,
            gifUrl
        );

    if (
        !added
    ) {

        return interaction.reply(
            duplicateReply(
                'this category'
            )
        );

    }

    const totalCount =
        getGifCount(
            filePath
        );

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

        await rumorsChannel.send({
            embeds: [
                buildApprovalRumorEmbed(
                    approvedEmbed,
                    {
                        categoryName,
                        gifChannelId:
                            CHANNELS.GIFS,
                        submitter,
                        totalCount
                    }
                )
            ]
        });

    }

}

module.exports = {
    approveGif
};
