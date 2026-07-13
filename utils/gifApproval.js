const {
    addGifToFile,
    findGifInData,
    getGifCount
} = require('./gifs');

const {
    CHANNELS
} = require('../data/constants');

const {
    buildApprovalFeedEmbed,
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

    const editingRoomChannel =
        interaction.client.channels.cache.get(
            CHANNELS.EDITING_ROOM
        ) ||
        await interaction.client.channels.fetch(
            CHANNELS.EDITING_ROOM
        ).catch(
            () => null
        );

    if (
        editingRoomChannel?.send
    ) {

        await editingRoomChannel.send({
            embeds: [
                buildApprovalFeedEmbed(
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
