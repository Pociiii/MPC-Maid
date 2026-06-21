const {
    findGifInData
} = require('../../utils/gifs');

const {
    logWarning
} = require('../../utils/inboxLogger');

const {
    incrementAchievementProgress
} = require('../../features/achievements/achievements');

const {
    buildDuplicateEmbed,
    buildReviewChannelMissingEmbed,
    buildReviewComponents,
    buildReviewEmbed,
    buildSubmittedEmbed,
    getReviewChannel,
    parseSubmissionCustomId
} = require('../../features/gif-submit/submissionFlow');

async function confirmSubmission(
    interaction,
    gifUrl
) {

    const payload = {
        content:
            null,
        embeds: [
            buildSubmittedEmbed(
                gifUrl
            )
        ],
        components:
            []
    };

    if (
        interaction.message &&
        typeof interaction.update === 'function'
    ) {

        try {

            await interaction.update(
                payload
            );

            return;

        }
        catch {

            // Fall back to a private reply if Discord does not allow editing
            // the component message from this modal submit.

        }


    }

    await interaction.reply({
        embeds:
            payload.embeds,
        flags:
            64
    });

}

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

        await confirmSubmission(
            interaction,
            gifUrl
        );

        await incrementAchievementProgress(
            interaction.client,
            interaction.user.id,
            'gif_submissions'
        );

    }

};
