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

const ROLES =
    require('../../data/roles.json');

function getFlexCategory(
    interaction
) {

    return interaction.member.roles.cache.has(
        ROLES.DARK_SKIN
    )
        ? 'flex_b'
        : 'flex_w';

}

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'flex'
            )
            .setDescription(
                'Show off your muscles'
            )
            .addAttachmentOption(
                (option) =>
                    option
                        .setName(
                            'media'
                        )
                        .setDescription(
                            'Custom media'
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
                COOLDOWNS.FLEX
            )
        )
            return;

        await interaction.deferReply();

        const media =
            getShowcaseMedia(
                interaction,
                getFlexCategory(
                    interaction
                )
            );

        if (
            !isValidShowcaseAttachment(
                media.attachment
            )
        )
            return interaction.editReply({
                content:
                    '\u274C Please upload an image, GIF, or video.'
            });

        const embed =
            buildShowcaseEmbed(
                interaction,
                {
                    commandName:
                        '/flex',
                    title:
                        'Flex',
                    description:
                        `<@${interaction.user.id}> flexes confidently.`,
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
                        `blowkiss:${interaction.user.id}`,
                    label:
                        'Blow Kiss',
                    emoji:
                        '<a:ADP_kiss:1450797539862511720>',
                    style:
                        ButtonStyle.Secondary
                },
                {
                    customId:
                        `brofist:${interaction.user.id}`,
                    label:
                        'Brofist',
                    emoji:
                        '\uD83E\uDD1C',
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
