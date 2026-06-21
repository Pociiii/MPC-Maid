const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    COLORS
} = require('../../data/constants');

const {
    createUserEmbed
} = require('../../utils/embeds');

const {
    addBooster,
    boosterStatLabels,
    boosterStats,
    boosterTiers,
    formatBooster,
    isValidBooster
} = require('../../utils/boosters');

const {
    getOrCreateUser,
    removeCoins
} = require('../../utils/users');

const emojis =
    require('../../utils/emojis');

const SHOP_TIER =
    1;

const statEmojis = {
    performance:
        '💪',
    stamina:
        '❤️',
    fame:
        '👑'
};

function formatShopItem(
    stat
) {

    const tier =
        boosterTiers[SHOP_TIER];

    return `+${tier.value} ${boosterStatLabels[stat]} for one porn scene.\nCost: ${emojis.coin} **${tier.cost} coins**\nBurnout: **+${tier.burnoutRisk}%** flop chance`;

}

function buildShopButtons(
    userId
) {

    return new ActionRowBuilder()
        .addComponents(
            ...boosterStats.map(
                (stat) =>
                    new ButtonBuilder()
                        .setCustomId(
                            `shop_booster:${userId}:${stat}:${SHOP_TIER}`
                        )
                        .setLabel(
                            `${boosterStatLabels[stat]} Booster`
                        )
                        .setEmoji(
                            statEmojis[stat]
                        )
                        .setStyle(
                            ButtonStyle.Primary
                        )
            )
        );

}

async function buildShopReply(
    interaction,
    notice = null
) {

    const user =
        await getOrCreateUser(
            interaction.user.id
        );

    const embed =
        createUserEmbed(
            interaction,
            {
                color:
                    notice?.success === false
                        ? COLORS.ERROR
                        : COLORS.DEFAULT,
                command:
                    '/shop',
                title:
                    'Booster Shop',
                description:
`${notice?.text ? `${notice.text}\n\n` : ''}Balance: ${emojis.coin} **${user.coins} coins**
Buy boosters for future \`/pornscene\` requests. One booster can be spent per scene.`
            }
        );

    embed.addFields(
        ...boosterStats.map(
            (stat) => ({
                name:
                    `${statEmojis[stat]} ${boosterStatLabels[stat]}`,
                value:
                    formatShopItem(
                        stat
                    ),
                inline:
                    true
            })
        )
    );

    return {
        embeds: [
            embed
        ],
        components: [
            buildShopButtons(
                interaction.user.id
            )
        ]
    };

}

async function buyShopBooster(
    interaction,
    ownerId,
    stat,
    tier
) {

    if (
        interaction.user.id !== ownerId
    ) {

        await interaction.reply({
            content:
                'This shop panel belongs to someone else.',
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    const numericTier =
        Number(
            tier
        );

    if (
        numericTier !== SHOP_TIER ||
        !isValidBooster(
            stat,
            numericTier
        )
    ) {

        await interaction.editReply(
            await buildShopReply(
                interaction,
                {
                    success:
                        false,
                    text:
                        'That booster is not available in the shop.'
                }
            )
        );

        return;

    }

    const user =
        await getOrCreateUser(
            interaction.user.id
        );

    const cost =
        boosterTiers[numericTier].cost;

    if (
        user.coins < cost
    ) {

        await interaction.editReply(
            await buildShopReply(
                interaction,
                {
                    success:
                        false,
                    text:
                        `Not enough coins for ${formatBooster({
                            stat,
                            tier:
                                numericTier
                        })}.`
                }
            )
        );

        return;

    }

    await removeCoins(
        interaction.user.id,
        cost
    );

    await addBooster(
        interaction.user.id,
        stat,
        numericTier
    );

    await interaction.editReply(
        await buildShopReply(
            interaction,
            {
                success:
                    true,
                text:
                    `Bought **${formatBooster({
                        stat,
                        tier:
                            numericTier
                    })}** for ${emojis.coin} **${cost} coins**.`
            }
        )
    );

}

module.exports = {
    buildShopReply,
    buyShopBooster
};
