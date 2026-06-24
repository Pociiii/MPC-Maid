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

const {
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const {
    incrementAchievementProgress
} = require('../../features/achievements/achievements');

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

        await interaction.deferReply();


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

            return interaction.editReply({

                content:
                    '❌ Please upload an image, GIF, or video.',

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

        await interaction.editReply({
            embeds:
                reply.embeds,
            files:
                reply.files
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
