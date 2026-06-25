const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} =
    require('discord.js');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    mpcLogoAttachment
} = require('../../utils/mpcLogo');

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

const {
    trackDailyQuest
} = require('../../features/daily-quests/dailyQuests');

const {
    incrementAchievementProgress
} = require('../../features/achievements/achievements');

const {
    commandFooter
} = require('../../utils/version');

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
                    `❌ ${error.message}`,

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
            createEmbed({

                color:
                    getRandomColor(),

                authorName:
                    interaction.member.displayName,

                authorIcon:
                    mpcLogoAttachment,

                thumbnail:
                    interaction.user.displayAvatarURL(),

                title:
                    'Horny',

                description:
                    `<@${interaction.user.id}> is feeling needy...`,

                image:
                    result.url,

                footerText:
                    commandFooter(
                        '/horny',
                        `GIF #${result.index}/${result.total}`
                    ),

                timestamp:
                    true

            });

        const helpLabel =
            `Help ${interaction.member.displayName}`
                .slice(
                    0,
                    80
                );

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            `horny_help:${interaction.user.id}`
                        )

                        .setLabel(
                            helpLabel
                        )
                        .setEmoji(
                            '🤝'
                        )

                        .setStyle(
                            ButtonStyle.Secondary
                        )

                );

        await interaction.editReply({

            embeds: [embed],

            components: [row]

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
