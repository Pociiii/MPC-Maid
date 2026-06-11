const {
    ActionRowBuilder,
    ButtonBuilder
} = require('discord.js');

const {
    getRandomGif
} = require('../../utils/gifs');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomColor
} = require('../../data/constants');

const ROLES =
    require('../../data/roles.json');

const {

    addKissGiven,
    addKissTaken

} = require('../../utils/users');

module.exports = async (
    interaction
) => {
    if (
        !interaction.member.roles.cache.has(
            ROLES.FEMALE
        )
    ) {

        return interaction.reply({

            content:
                '🚫 Only female users can blow a kiss.',

            flags: 64

        });

    }
    const targetUserId =
        interaction.customId.split(':')[1];

    const kissGif =
        getRandomGif('blowkiss');

    const embed =
        createEmbed({

            color:
                getRandomColor(),

            authorName:
                interaction.member.displayName,

            authorIcon:
                interaction.user.displayAvatarURL(),

            title:
                'Blow Kiss',

            description:
                `<@${interaction.user.id}> blows a kiss to <@${targetUserId}>.`,

            image:
                kissGif.url,

            footerText:
                `GIF #${kissGif.index}/${kissGif.total}`,

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

    await addKissGiven(
        interaction.user.id
    );

    await addKissTaken(
        targetUserId
    );

    await interaction.followUp({

        embeds: [embed]

    });

};