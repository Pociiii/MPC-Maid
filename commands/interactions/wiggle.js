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

const {
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const {
    incrementAchievementProgress
} = require('../../features/achievements/achievements');

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');



module.exports = {

    data: new SlashCommandBuilder()
        .setName('wiggle')
        .setDescription('Random wiggle')
        .addAttachmentOption(option =>

        option

            .setName('media')

            .setDescription(
                'Custom GIF'
            )

            .setRequired(false)
        ),

    async execute(interaction) {
        
        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.WIGGLE
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
                    '❌ Please upload an image or GIF.',

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
                    'wiggle'
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
            title: 'Wiggle',
            description: `<@${interaction.user.id}> wiggles teasingly.`,
            image: imageUrl,
            footerText: footerText,
            timestamp: true
        });

        const row = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        `spank_male:${interaction.user.id}`
                    )
                    .setLabel('Guys Spank')
                    .setEmoji('1486644512032948314')
                    .setStyle(
                        ButtonStyle.Secondary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `spank_female:${interaction.user.id}`
                    )
                    .setLabel('Girls Spank')
                    .setEmoji('1486644512032948314')
                    .setStyle(
                        ButtonStyle.Secondary
                    )

            );
            
        await interaction.reply({
            embeds: [embed],
            components: [row],
            files: [adpLogoPath]
        });

        await trackDailyQuest(
            interaction.client,
            interaction.user.id,
            'showcase'
        );

        await incrementAchievementProgress(
            interaction.client,
            interaction.user.id,
            'showcase_posts'
        );

    }

};
