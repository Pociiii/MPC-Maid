const {
    ButtonStyle,
    SlashCommandBuilder
} = require('discord.js');

const {
    COOLDOWNS
} = require('../../data/constants');

const {
    handleCooldown
} = require('../../utils/cooldowns');

const {
    buildShowcaseButtons,
    buildShowcaseEmbed,
    getShowcaseMedia,
    isValidShowcaseAttachment,
    trackShowcasePost
} = require('../../features/showcase/showcasePosts');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'wiggle'
            )
            .setDescription(
                'Random wiggle'
            )
            .addAttachmentOption(
                (option) =>
                    option
                        .setName(
                            'media'
                        )
                        .setDescription(
                            'Custom GIF'
                        )
                        .setRequired(
                            false
                        )
            ),

    async execute(
        interaction
    ) {

        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.WIGGLE
            )
        )
            return;

        await interaction.deferReply();

        const media =
            getShowcaseMedia(
                interaction,
                'wiggle'
            );

        if (
            !isValidShowcaseAttachment(
                media.attachment
            )
        )
            return interaction.editReply({
                content:
                    '\u274C Please upload an image or GIF.'
            });

        const embed =
            buildShowcaseEmbed(
                interaction,
                {
                    commandName:
                        '/wiggle',
                    title:
                        'Wiggle',
                    description:
                        `<@${interaction.user.id}> wiggles teasingly.`,
                    imageUrl:
                        media.imageUrl,
                    footerText:
                        media.footerText
                }
            );

        const row =
            buildShowcaseButtons([
                {
                    customId:
                        `spank_male:${interaction.user.id}`,
                    label:
                        'Guys Spank',
                    emoji:
                        '1486644512032948314',
                    style:
                        ButtonStyle.Secondary
                },
                {
                    customId:
                        `spank_female:${interaction.user.id}`,
                    label:
                        'Girls Spank',
                    emoji:
                        '1486644512032948314',
                    style:
                        ButtonStyle.Secondary
                }
            ]);

        await interaction.editReply({
            embeds:
                [
                    embed
                ],
            components:
                [
                    row
                ]
        });

        await trackShowcasePost(
            interaction
        );

    }

};
