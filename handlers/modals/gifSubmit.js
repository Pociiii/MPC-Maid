const {

    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle

} = require(
    'discord.js'
);

const {
    createEmbed
} = require(
    '../../utils/embeds'
);

const {
    CHANNELS,
    getRandomColor
} = require(
    '../../data/constants'
);

const {
    getSceneCategoryName,
    getSceneGroupKey
} = require(
    '../../data/sceneSubmitGroups'
);

const {
    findGifInData
} = require(
    '../../utils/gifs'
);

module.exports = {

    customId:
        'gif_submit',

    async execute(
        interaction
    ) {

        const customIdParts =
            interaction.customId.split(
                ':'
            );

        const isSceneSubmission =
            customIdParts.length >= 3;

        const group =
            isSceneSubmission
                ? getSceneGroupKey(
                    customIdParts[1]
                )
                : null;

        const category =
            isSceneSubmission
                ? customIdParts[2]
                : customIdParts[1];

        const categoryName =
            isSceneSubmission
                ? getSceneCategoryName(
                    group,
                    category
                )
                : category;

        const gifUrl =
            interaction.fields.getTextInputValue(
                'gif_url'
            );

        const existingGif =
            findGifInData(
                gifUrl
            );

        if (
            existingGif
        ) {

            await interaction.reply({
                embeds: [
                    createEmbed({
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
                    })
                ],
                flags:
                    64
            });

            return;

        }

        const reviewChannel =
            interaction.client.channels.cache.get(
                CHANNELS.GIF_REVIEW
            );

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
                    `<@${interaction.member.id}>`,
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

        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(

                            isSceneSubmission
                                ? `gifapprove:${group}:${category}:${interaction.user.id}`
                                : `gifapprove:${category}:${interaction.user.id}`

                        )

                        .setLabel(
                            'Approve'
                        )

                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()

                        .setCustomId(

                            isSceneSubmission
                                ? `gifreject:${group}:${category}:${interaction.user.id}`
                                : `gifreject:${category}:${interaction.user.id}`

                        )

                        .setLabel(
                            'Reject'
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        )

                );

        await reviewChannel.send({

            embeds: [embed],

            components: [row]

        });

        await interaction.reply({

    embeds: [

        createEmbed({

            color:
                getRandomColor(),

            description:
                '✅ GIF submitted for review.',

            image:
                gifUrl

        })

    ],

    flags: 64

});

    }

};
