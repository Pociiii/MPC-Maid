const {
    findGifInData
} = require('../../utils/gifs');

const {
    logWarning
} = require('../../utils/inboxLogger');

const {
    buildDuplicateEmbed,
    buildReviewChannelMissingEmbed,
    buildReviewComponents,
    buildReviewEmbed,
    buildSubmittedEmbed,
    getReviewChannel,
    parseSubmissionCustomId
} = require('../../features/gif-submit/submissionFlow');

module.exports = {

    customId:
        'gif_submit',

    async execute(
        interaction
    ) {

        const submission =
            parseSubmissionCustomId(
                interaction.customId
            );

        const gifUrl =
            interaction.fields.getTextInputValue(
                'gif_url'
            );

        if (
            findGifInData(
                gifUrl
            )
        ) {

            await interaction.reply({
                embeds: [
                    buildDuplicateEmbed(
                        gifUrl
                    )
                ],
                flags:
                    64
            });

            return;

        }

        const reviewChannel =
            getReviewChannel(
                interaction.client
            );

        if (
            !reviewChannel
        ) {

            await interaction.reply({
                embeds: [
                    buildReviewChannelMissingEmbed()
                ],
                flags:
                    64
            });

            await logWarning(
                interaction.client,
                {
                    title:
                        'GIF Review Channel Missing',
                    description:
                        'A GIF submission could not be sent for review because the review channel was unavailable.',
                    fields: [
                        {
                            name:
                                'User',
                            value:
                                `<@${interaction.user.id}>`,
                            inline:
                                true
                        },
                        {
                            name:
                                'Category',
                            value:
                                submission.categoryName,
                            inline:
                                true
                        }
                    ]
                }
            );

            return;

        }

        await reviewChannel.send({
            embeds: [
                buildReviewEmbed({
                    categoryName:
                        submission.categoryName,
                    gifUrl,
                    submitterId:
                        interaction.user.id
                })
            ],
            components:
                buildReviewComponents({
                    ...submission,
                    submitterId:
                        interaction.user.id
                })
        });

        await interaction.reply({
            embeds: [
                buildSubmittedEmbed()
            ],
            flags:
                64
        });

    }

};
