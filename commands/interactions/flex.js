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

const ROLES =
    require('../../data/roles.json');

    const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
    .setName('flex')
    .setDescription('Show off your muscles')

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
                COOLDOWNS.FLEX
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

            let category = 'flex_w';

            if (
                interaction.member.roles.cache.has(
                    ROLES.DARK_SKIN
                )
            ) {

                category = 'flex_b';

            }

            const result =
                getRandomGif(category);

            imageUrl =
                result.url;

            footerText =
                `GIF #${result.index}/${result.total}`;

        }

        const embed = createEmbed({

            color: getRandomColor(),

            authorName:
                interaction.member.displayName,

            authorIcon:
                adpLogoAttachment,

            thumbnail:
                interaction.user.displayAvatarURL(),

            title: 'Flex',

            description:
                `<@${interaction.user.id}> flexes confidently.`,

            image:
                imageUrl,

            footerText:
                footerText,

            timestamp:
                true

        });
        const row =
    new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()

                .setCustomId(
                    `blowkiss:${interaction.user.id}`
                )

                .setLabel(
                    'Blow Kiss'
                )

                .setEmoji(
                    '<a:ADP_kiss:1450797539862511720>'
                )

                .setStyle(
                    ButtonStyle.Secondary
                )

        );

        await interaction.reply({

            embeds: [embed],

            components: [row],

            files: [adpLogoPath]

        });

    }

};
