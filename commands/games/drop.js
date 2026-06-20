const { SlashCommandBuilder } = require('discord.js');

const {
    buildDropPost
} = require('../../utils/dropPost');
const {
    COOLDOWNS,
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

        const dropOptions = {
            authorName:
                interaction.member.displayName,
            thumbnail:
                interaction.user.displayAvatarURL()
        };

        if (attachment) {

            dropOptions.imageUrl =
                attachment.url;

            dropOptions.footerText =
                `Custom media by ${interaction.member.displayName}`;

        }

        const reply =
            buildDropPost(
                dropOptions
            );

        await interaction.reply({
            embeds:
                reply.embeds,
            files:
                reply.files
        });

    }

};
