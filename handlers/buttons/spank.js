const ROLES =
    require('../../data/roles.json');

const {
    getRandomGif
} = require('../../utils/gifs');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

const {
    addSpankGiven,
    addSpankTaken
} = require('../../utils/users');

const {
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

module.exports = async (
    interaction
) => {

    if (
        !interaction.member.roles.cache.has(
            ROLES.MALE
        )
    ) {

        return interaction.reply({

            content:
                '🚫 Only male users can spank.',

            flags: 64

        });

    }

    const targetUserId =
        interaction.customId.split(':')[1];

    const spankGif =
        getRandomGif('spank');

    const embed =
        createEmbed({

            color:
                getRandomColor(),

            authorName:
                interaction.member.displayName,

            authorIcon:
                interaction.user.displayAvatarURL(),

            title:
                'Spank!',

            description:
                `<@${interaction.user.id}> spanks <@${targetUserId}>.`,

            image:
                spankGif.url,

            footerText:
                `GIF #${spankGif.index}/${spankGif.total}`,

            timestamp:
                true

        });

    const disabledRow =
        new ActionRowBuilder()
            .addComponents(

                ButtonBuilder
                    .from(
                        interaction.message
                            .components[0]
                            .components[0]
                    )
                    .setDisabled(true)

            );

    await interaction.deferUpdate();

    await interaction.message.edit({

        components: [
            disabledRow
        ]

    });

    await addSpankGiven(
        interaction.user.id
    );

    await addSpankTaken(
        targetUserId
    );

    await interaction.followUp({

        embeds: [embed]

    });

};