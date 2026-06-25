const { SlashCommandBuilder } = require('discord.js');

const { createEmbed } = require('../../utils/embeds');
const {
    mpcLogoAttachment
} = require('../../utils/mpcLogo');
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
    commandFooter
} = require('../../utils/version');

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
                getRandomGif(
                    category,
                    [
                        interaction.user.id
                    ]
                );

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
                mpcLogoAttachment,

            thumbnail:
                interaction.user.displayAvatarURL(),

            title: 'Flex',

            description:
                `<@${interaction.user.id}> flexes confidently.`,

            image:
                imageUrl,

            footerText:
                commandFooter(
                    '/flex',
                    footerText
                ),

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
                ),

            new ButtonBuilder()

                .setCustomId(
                    `brofist:${interaction.user.id}`
                )

                .setLabel(
                    'Brofist'
                )

                .setEmoji(
                    '🤜'
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
