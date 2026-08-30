const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder
} = require('discord.js');

const {
    COLORS
} = require('../../data/constants');

const {
    getAchievementPoints
} = require('../../features/achievements/achievements');

const {
    getCriticalChance,
    getScoreBonus,
    getStatBonus,
    getTotalParts
} = require('../../features/porn-career/sceneMath');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    mpcLogoAttachment
} = require('../../utils/mpcLogo');

const {
    formatPornCareerName
} = require('../../utils/pornCareerTitles');

const {
    getOrCreateUser
} = require('../../utils/users');

const {
    getProfileLikeCount,
    hasProfileLike
} = require('../../features/profile/profileLikes');

const {
    commandFooter
} = require('../../utils/version');

const emojis =
    require('../../utils/emojis');
const { getGiftCollectionPreview, getReceivedGiftCollection } = require('../../utils/gifts');

const COMMAND_CONFIG = {
    ephemeral:
        true
};

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
    achievementPoints,
    profileLikes,
    giftPreview,
    giftTotal
) {

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
                `${emojis.scene_completed} Career`,
            value:
`- Scenes: **${user.scenes_completed}**
- Achievements: **${achievementPoints}**`,
            inline:
                true
        },
        {
            name:
                `${emojis.spank_given} Spanks`,
            value:
`- Spanks Given: **${user.spanks_given}**
- Spanks Taken: **${user.spanks_taken}**`,
            inline:
                true
        },
        {
            name:
                `${emojis.kiss_given} Kisses`,
            value:
`- Kisses Given: **${user.kisses_given}**
- Kisses Taken: **${user.kisses_taken}**`,
            inline:
                true
        },
        {
            name:
                `${emojis.help} Helps`,
            value:
`- Helps Given: **${user.horny_helps ?? 0}**
- Helps Received: **${user.horny_helped ?? 0}**`,
            inline:
                true
        },
        {
            name:
                'Brofists',
            value:
`- Brofists Given: **${user.brofists_given ?? 0}**
- Brofists Taken: **${user.brofists_taken ?? 0}**`,
            inline:
                true
        },
        {
            name:
                'Profile Likes',
            value:
                `- Total Likes: **${profileLikes}**`,
            inline:
                true
        },
        {
            name: '🎁 Gifts',
            value: giftPreview.length
                ? `${giftPreview.map((gift) => `- ${gift.emoji} ×${gift.quantity}`).join('\n')}\n- **${giftTotal} gifts received**`
                : '- No gifts received yet',
            inline: true
        }
    );

    return embed;

}

function formatDecimal(
    value
) {

    return Number.isInteger(
        value
    )
        ? `${value}`
        : value.toFixed(
            1
        );

}

function buildProfileComponents(
    targetId,
    viewerId,
    alreadyLiked
) {

    const ownProfile =
        targetId === viewerId;

    const button =
        new ButtonBuilder()
            .setCustomId(
                `profile_like:${targetId}`
            )
            .setLabel(
                alreadyLiked
                    ? 'Liked'
                    : ownProfile
                        ? 'Own Profile'
                        : 'Like Profile'
            )
            .setStyle(
                alreadyLiked
                    ? ButtonStyle.Secondary
                    : ButtonStyle.Success
            )
            .setDisabled(
                ownProfile ||
                alreadyLiked
            );

    const giftsButton = new ButtonBuilder()
        .setCustomId(`gift_collection:${targetId}`)
        .setLabel('View Gift Collection')
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder()
            .addComponents(
                button,
                giftsButton
            )
    ];

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
        getCriticalChance(
            combinedPerformance
        );

    const totalParts =
        getTotalParts(
            combinedStamina
        );

    const staminaXpBonus =
        Math.max(
            0,
            totalParts - 4
        ) * 2;

    const scoreBonus =
        getScoreBonus(
            combinedPerformance
        ) +
        getScoreBonus(
            combinedStamina
        ) +
        getScoreBonus(
            combinedFame
        );

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
`- Performance: **${combinedPerformance}** | Crit: **${formatDecimal(
    critChance
)}%**
- Stamina: **${combinedStamina}** | Parts: **${totalParts}/8** | XP bonus: **+${staminaXpBonus}**
- Fame: **${combinedFame}** | Viewer/revenue bonus scales every point
- Scene score bonus: **+${formatDecimal(
    scoreBonus
)}**`,
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

        const [
            profileLikes,
            alreadyLiked,
            giftPreview,
            receivedGifts
        ] =
            await Promise.all([
                getProfileLikeCount(
                    target.id
                ),
                hasProfileLike(
                    target.id,
                    interaction.user.id
                ),
                getGiftCollectionPreview(target.id),
                getReceivedGiftCollection(target.id)
            ]);

        await interaction.editReply({
            embeds: [
                buildProfileEmbed(
                    target,
                    member,
                    user,
                    achievementPoints,
                    profileLikes,
                    giftPreview,
                    receivedGifts.reduce((sum, gift) => sum + gift.quantity, 0)
                )
            ],
            components:
                buildProfileComponents(
                    target.id,
                    interaction.user.id,
                    alreadyLiked
                )
        });

    }
};

module.exports.buildProfileComponents =
    buildProfileComponents;
