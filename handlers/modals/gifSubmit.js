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

module.exports = {

    customId:
        'gif_submit',

    async execute(
        interaction
    ) {

        const category =
            interaction.customId.split(
                ':'
            )[1];

        const gifUrl =
            interaction.fields.getTextInputValue(
                'gif_url'
            );

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
                footerText:
                    gifUrl,

                description:

`**Submitted by**: <@${interaction.member.id}>

**Category**: ${category}

**URL**: ${gifUrl}`,

                image:
                    gifUrl,

                timestamp:
                    true

            });

        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(

                            `gifapprove:${category}:${interaction.user.id}`

                        )

                        .setLabel(
                            'Approve'
                        )

                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()

                        .setCustomId(

                            `gifreject:${category}:${interaction.user.id}`

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