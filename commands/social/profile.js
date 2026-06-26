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

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            value,
            max
        )
    );

}

function getStatDelta(
    first,
    second
) {

    const diff =
        first - second;

    if (
        diff === 0
    )
        return 'even';

    return diff > 0
        ? `+${diff}`
        : `${diff}`;

}

function formatStatCompareLine(
    label,
    first,
    second
) {

    return `${label}: **${first}** vs **${second}** (${getStatDelta(
        first,
        second
    )})`;

}

function buildProfileEmbed(
    target,
    member,
    user,
    achievementPoints
) {

    const rankTitle =
        getRankTitle(
            user.ranking
        );

    const embed =
        createEmbed({
            color:
                COLORS.DEFAULT,
            authorName:
                formatPornCareerName(
                    member.displayName,
                    user,
                    member
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
                `${emojis.coin} Wallet`,
            value:
`- Coins: **${user.coins}**
- XP: **${user.xp}**`,
            inline:
                true
        },
        {
            name:
                `${emojis.performance} Stats`,
            value:
`- Performance: **${user.performance}**
- Stamina: **${user.stamina}**
- Fame: **${user.fame}**`,
            inline:
                true
        },
        {
            name:
                `${emojis.ranking} Career`,
            value:
`- Ranking: **${rankTitle} (${user.ranking})**
- Scenes: **${user.scenes_completed}**
- Achievements: **${achievementPoints}**`,
            inline:
                true
        },
        {
            name:
                `${emojis.spank_given} Interactions`,
            value:
`- Spanks Given: **${user.spanks_given}**
- Spanks Taken: **${user.spanks_taken}**
- Kisses Given: **${user.kisses_given}**
- Kisses Taken: **${user.kisses_taken}**
- Helps Given: **${user.horny_helps ?? 0}**
- Helps Received: **${user.horny_helped ?? 0}**
- Brofists Given: **${user.brofists_given ?? 0}**
- Brofists Taken: **${user.brofists_taken ?? 0}**`,
            inline:
                false
        }
    );

    return embed;

}

function buildCompareEmbed(
    firstTarget,
    firstMember,
    firstUser,
    secondTarget,
    secondMember,
    secondUser
) {

    const combinedPerformance =
        firstUser.performance +
        secondUser.performance;

    const combinedStamina =
        firstUser.stamina +
        secondUser.stamina;

    const combinedFame =
        firstUser.fame +
        secondUser.fame;

    const critChance =
        clamp(
            3 + Math.floor(
                combinedPerformance / 10
            ),
            3,
            15
        );

    const totalParts =
        clamp(
            4 + Math.floor(
                combinedStamina / 10
            ),
            4,
            8
        );

    const staminaXpBonus =
        Math.max(
            0,
            totalParts - 4
        ) * 2;

    const fameBonus =
        Math.floor(
            combinedFame / 10
        );

    const scoreBonus =
        (
            Math.floor(
                combinedPerformance / 10
            ) +
            Math.floor(
                combinedStamina / 10
            ) +
            fameBonus
        ) * 3;

    const embed =
        createEmbed({
            color:
                COLORS.DEFAULT,
            authorName:
                firstMember.displayName,
            authorIcon:
                mpcLogoAttachment,
            thumbnail:
                firstTarget.displayAvatarURL(),
            title:
                'Profile Stat Compare',
            description:
                `<@${firstTarget.id}> compared with <@${secondTarget.id}>.`,
            footerText:
                commandFooter(
                    '/profile',
                    'Compare'
                ),
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                `\uD83D\uDC64 ${firstMember.displayName}`,
            value:
`- Performance: **${firstUser.performance}**
- Stamina: **${firstUser.stamina}**
- Fame: **${firstUser.fame}**`,
            inline:
                true
        },
        {
            name:
                `\uD83D\uDC64 ${secondMember.displayName}`,
            value:
`- Performance: **${secondUser.performance}**
- Stamina: **${secondUser.stamina}**
- Fame: **${secondUser.fame}**`,
            inline:
                true
        },
        {
            name:
                '\u2194\uFE0F Difference',
            value:
`- ${formatStatCompareLine(
    'Performance',
    firstUser.performance,
    secondUser.performance
)}
- ${formatStatCompareLine(
    'Stamina',
    firstUser.stamina,
    secondUser.stamina
)}
- ${formatStatCompareLine(
    'Fame',
    firstUser.fame,
    secondUser.fame
)}`,
            inline:
                false
        },
        {
            name:
                `${emojis.performance} Combined Scene Stats`,
            value:
`- Performance: **${combinedPerformance}** | Crit: **${critChance}%**
- Stamina: **${combinedStamina}** | Parts: **${totalParts}/8** | XP bonus: **+${staminaXpBonus}**
- Fame: **${combinedFame}** | Fame bonus: **+${fameBonus}**
- Scene score bonus: **+${scoreBonus}**`,
            inline:
                false
        }
    );

    return embed;

}

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
            )
            .addUserOption(
                (option) =>
                    option
                        .setName(
                            'compare'
                        )
                        .setDescription(
                            'Compare profile stats with another user'
                        )
                        .setRequired(
                            false
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

        const compareTarget =
            interaction.options.getUser(
                'compare'
            );

        const member =
            await interaction.guild.members.fetch(
                target.id
            );

        const user =
            await getOrCreateUser(
                target.id
            );

        if (
            compareTarget
        ) {

            const compareMember =
                await interaction.guild.members.fetch(
                    compareTarget.id
                );

            const compareUser =
                await getOrCreateUser(
                    compareTarget.id
                );

            await interaction.editReply({
                embeds: [
                    buildCompareEmbed(
                        target,
                        member,
                        user,
                        compareTarget,
                        compareMember,
                        compareUser
                    )
                ]
            });

            return;

        }

        const achievementPoints =
            await getAchievementPoints(
                target.id
            );

        await interaction.editReply({
            embeds: [
                buildProfileEmbed(
                    target,
                    member,
                    user,
                    achievementPoints
                )
            ]
        });

    }
};
