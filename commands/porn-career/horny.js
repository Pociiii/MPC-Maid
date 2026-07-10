const {
    ButtonStyle,
    SlashCommandBuilder
} = require('discord.js');

const {
    COOLDOWNS
} = require('../../data/constants');

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
    buildShowcaseButtons,
    buildShowcaseEmbed,
    trackShowcasePost
} = require('../../features/showcase/showcasePosts');

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName(
                'horny'
            )
            .setDescription(
                'Feeling a little needy?'
            ),

    async execute(
        interaction
    ) {

        if (
            await handleCooldown(
                interaction,
                interaction.commandName,
                COOLDOWNS.HORNY
            )
        )
            return;

        await interaction.deferReply();

        let category;

        try {

            category =
                getUserCategory(
                    interaction
                );

        }
        catch (error) {

            return interaction.editReply({
                content:
                    `\u274C ${error.message}`
            });

        }

        const result =
            getRandomGif(
                `horny/${category}`,
                [
                    interaction.user.id
                ]
            );

        const embed =
            buildShowcaseEmbed(
                interaction,
                {
                    commandName:
                        '/horny',
                    title:
                        'Horny',
                    description:
                        `<@${interaction.user.id}> is feeling needy...`,
                    imageUrl:
                        result.url,
                    footerText:
                        `GIF #${result.index}/${result.total}`
                }
            );

        const helpLabel =
            `Help ${interaction.member.displayName}`
                .slice(
                    0,
                    80
                );

        const row =
            buildShowcaseButtons([
                {
                    customId:
                        `horny_help:${interaction.user.id}`,
                    label:
                        helpLabel,
                    emoji:
                        '\uD83E\uDD1D',
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
