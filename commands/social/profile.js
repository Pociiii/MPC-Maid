const {
    SlashCommandBuilder
} = require('discord.js');

const {
    COLORS
} = require('../../data/constants');

const {
    getAchievementPoints
} = require('../../features/achievements/achievements');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    mpcLogoAttachment
} = require('../../utils/mpcLogo');

const {
    getRankTitle
} = require('../../utils/ranks');

const {
    formatPornCareerName
} = require('../../utils/pornCareerTitles');

const {
    getOrCreateUser
} = require('../../utils/users');

const {
    commandFooter
} = require('../../utils/version');

const emojis =
    require('../../utils/emojis');

const COMMAND_CONFIG = {
    ephemeral:
        true
};

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName(
                'profile'
            )
            .setDescription(
                'View a user profile'
            )
            .addUserOption(
                (option) =>
                    option
                        .setName(
                            'user'
                        )
                        .setDescription(
                            'The user profile to view'
                        )
                        .setRequired(
                            true
                        )
            ),

    async execute(
        interaction
    ) {

        await interaction.deferReply({
            flags:
                COMMAND_CONFIG.ephemeral
                    ? 64
                    : 0
        });

        const target =
            interaction.options.getUser(
                'user'
            );

        const member =
            await interaction.guild.members.fetch(
                target.id
            );

        const user =
            await getOrCreateUser(
                target.id
            );

        const rankTitle =
            getRankTitle(
                user.ranking
            );

        const achievementPoints =
            await getAchievementPoints(
                target.id
            );

        const embed =
            createEmbed({
                color:
                    COLORS.DEFAULT,
                authorName:
                    formatPornCareerName(
                        member.displayName,
                        user
                    ),
                authorIcon:
                    mpcLogoAttachment,
                thumbnail:
                    target.displayAvatarURL(),
                title:
                    'Profile',
                footerText:
                    commandFooter(
                        '/profile'
                    ),
                timestamp:
                    true
            });

        embed.addFields(
            {
                name:
                    'Wallet',
                value:
`${emojis.coin} Coins: **${user.coins}**
${emojis.xp} XP: **${user.xp}**`,
                inline:
                    true
            },
            {
                name:
                    'Stats',
                value:
`${emojis.performance} Performance: **${user.performance}**
${emojis.stamina} Stamina: **${user.stamina}**
${emojis.fame} Fame: **${user.fame}**`,
                inline:
                    true
            },
            {
                name:
                    'Career',
                value:
`${emojis.ranking} Ranking: **${rankTitle} (${user.ranking})**
${emojis.scene_completed} Scenes: **${user.scenes_completed}**
\uD83C\uDFC5 Achievements: **${achievementPoints}**`,
                inline:
                    true
            },
            {
                name:
                    'Interactions',
                value:
`${emojis.spank_given} Spanks Given: **${user.spanks_given}**
${emojis.spank_taken} Spanks Taken: **${user.spanks_taken}**
${emojis.kiss_given} Kisses Given: **${user.kisses_given}**
${emojis.kiss_taken} Kisses Taken: **${user.kisses_taken}**`,
                inline:
                    false
            }
        );

        await interaction.editReply({
            embeds: [
                embed
            ]
        });

    }
};
