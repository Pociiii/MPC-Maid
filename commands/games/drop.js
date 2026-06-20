const { SlashCommandBuilder } = require('discord.js');

const { createEmbed } = require('../../utils/embeds');
const {
    adpLogoPath,
    adpLogoAttachment
} = require('../../utils/adpLogo');
const { getRandomGif } = require('../../utils/gifs');
const {
    COOLDOWNS,
    getRandomColor
} = require('../../data/constants');
const {
    handleCooldown
} = require('../../utils/cooldowns');

module.exports = {

    data: new SlashCommandBuilder()
    .setName('drop')
    .setDescription('Random titty drop')

    .addAttachmentOption(option =>

        option

            .setName('media')

            .setDescription(
                'Custom media'
            )

            .setRequired(false)

    ),

    async execute(interaction) {
        
        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.DROP
            )
        )
            return;


        const attachment =
            interaction.options.getAttachment(
                'media'
            );

        if (
            attachment &&
            !attachment.contentType?.startsWith(
                'image/'
            ) &&
            !attachment.contentType?.startsWith(
                'video/'
            )
        ) {

            return interaction.reply({

                content:
                    '❌ Please upload an image, GIF, or video.',

                flags: 64

            });

        }

        let imageUrl;
        let footerText;

        if (attachment) {

            imageUrl =
                attachment.url;

            footerText =
                `Custom media by ${interaction.member.displayName}`;

        }
        else {

            const result =
                getRandomGif(
                    'titty_drop'
                );

            imageUrl =
                result.url;

            footerText =
                `GIF #${result.index}/${result.total}`;

        }
        const embed = createEmbed({
            color: getRandomColor(),
            authorName: interaction.member.displayName,
            authorIcon: adpLogoAttachment,
            thumbnail: interaction.user.displayAvatarURL(),
            title: 'Titty Drop',
            image:
                imageUrl,

            footerText:
                footerText,
            timestamp: true
        });

        await interaction.reply({
            embeds: [embed],
            files: [adpLogoPath]
        });

    }

};
