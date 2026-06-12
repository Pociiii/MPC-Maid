const { SlashCommandBuilder } =
    require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getRandomGif
} = require('../../utils/gifs');

const {
    handleCooldown
} = require('../../utils/cooldowns');

const {
    getUserCategory
} = require('../../utils/userCategory');

const {
    COOLDOWNS,
    getRandomColor
} = require('../../data/constants');

module.exports = {

    data: new SlashCommandBuilder()

        .setName('horny')

        .setDescription(
            'Feeling a little needy?'
        ),

    async execute(interaction) {

        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.HORNY
            )
        )
            return;

        let category;

        try {

            category =
                getUserCategory(
                    interaction
                );

        }
        catch (error) {

            return interaction.reply({

                content:
                    `❌ ${error.message}`,

                flags: 64

            });

        }

        const result =
            getRandomGif(
                `horny/${category}`
            );

        const embed =
            createEmbed({

                color:
                    getRandomColor(),

                authorName:
                    interaction.member.displayName,

                authorIcon:
                    interaction.user.displayAvatarURL(),

                title:
                    'Horny',

                description:
                    `<@${interaction.user.id}> is feeling needy...`,

                image:
                    result.url,

                footerText:
                    `GIF #${result.index}/${result.total}`,

                timestamp:
                    true

            });

        await interaction.reply({

            embeds: [embed]

        });

    }

};