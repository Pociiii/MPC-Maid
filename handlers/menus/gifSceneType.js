const path =
    require('path');

const {
    addGifToFile
} = require(
    '../../utils/gifs'
);

const {
    CHANNELS
} = require(
    '../../data/constants'
);

module.exports = {

    async execute(
        interaction
    ) {

        const [

            ,
            category,
            submitterId

        ] =
            interaction.customId.split(
                ':'
            );

        const sceneType =
            interaction.values[0];

        const gifUrl =
            interaction.message
                .embeds[0]
                .footer
                .text;

        const filePath =
            path.join(

                __dirname,

                '..',
                '..',

                'data',
                'scenes',

                category,

                `${sceneType}.json`

            );

        const added =
            addGifToFile(
                filePath,
                gifUrl
            );

        if (
            !added
        ) {

            return interaction.reply({

                content:
                    '❌ This GIF already exists.',

                flags: 64

            });

        }

        await interaction.update({

            content:
                `✅ Approved by ${interaction.user}`,

            embeds:
                interaction.message.embeds,

            components: []

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

                    interaction.message
                        .embeds[0]

                ]

            });

        }

    }

};