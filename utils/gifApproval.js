const {
    EmbedBuilder
} = require('discord.js');

const path =
    require('path');

const {
    addGifToFile
} = require('./gifs');

const {
    CHANNELS
} = require('../data/constants');
const {
    getGifCount
} = require('./gifs');

async function approveGif(
    interaction,
    filePath,
    categoryName = 'Unknown'
) {

    const gifUrl =
        interaction.message
            .embeds[0]
            .footer
            .text;

    const added =
        addGifToFile(
            filePath,
            gifUrl
        );

    const totalCount =
        getGifCount(
            filePath
        );
    if (!added) {

        return interaction.reply({

            content:
                '❌ This GIF already exists.',

            flags: 64

        });

    }

    await interaction.update({

        content:

    `✅ Approved by ${interaction.user}

    📊 Total GIFs: ${totalCount}`,

        embeds:
            interaction.message.embeds,

        components: []

    });

    const rumorsChannel =
        interaction.client.channels.cache.get(
            CHANNELS.RUMORS
        );

    const submitter =
    interaction.message.embeds[0]
        .description
        ?.match(/<@(\d+)>/)?.[1];

    if (rumorsChannel) {

        const {
            EmbedBuilder
        } = require('discord.js');

        const embed =
            EmbedBuilder.from(
                interaction.message.embeds[0]
            )

                .setTitle(
                    '🎉 New GIF Added'
                )
                .setDescription(null)
                .setFooter(null)
                .addFields(

                    {
                        name: '📁 Category',
                        value: categoryName,
                        inline: true
                    },

                    {
                        name: '📊 Total GIFs',
                        value: String(totalCount),
                        inline: true
                    },

                    {
                        name: '👤 Submitted By',
                        value: `<@${submitter}>`,
                        inline: false
                    }

                );

        await rumorsChannel.send({

            embeds: [embed]

        });

    }

}

module.exports = {
    approveGif
};