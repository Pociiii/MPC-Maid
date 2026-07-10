const {
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

const {
    COLORS,
    SCENE_BALANCE
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
    spendCoins
} = require('../../utils/users');

const {
    incrementAchievementProgress
} = require('../achievements/achievements');

const emojis =
    require('../../utils/emojis');

const statEmojis = {
    performance:
        '\uD83D\uDCAA',
    stamina:
        '\u2764\uFE0F',
    fame:
        '\uD83D\uDC51'
};

function getTierKeys() {

    return Object.keys(
        boosterTiers
    );

}

function formatShopItem(
    stat,
    tierKey
) {

    const tier =
        boosterTiers[tierKey];

    return `- **${boosterStatLabels[stat]}**: +${tier.value}, **${tier.cost} coins**, burnout **+${tier.burnoutRisk}%**`;

}

function buildShopMenu(
    userId
) {

    return new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(
                    `shop_booster:${userId}`
                )
                .setPlaceholder(
                    'Choose a booster to buy'
                )
                .addOptions(
                    getTierKeys()
                        .flatMap(
                            (tierKey) =>
                                boosterStats.map(
                                    (stat) => {

                                        const tier =
                                            boosterTiers[tierKey];

                                        return {
                                            label:
                                                `${boosterStatLabels[stat]} T${tierKey}`,
                                            description:
                                                `+${tier.value}, ${tier.cost} coins, +${tier.burnoutRisk}% burnout`,
                                            emoji:
                                                statEmojis[stat],
                                            value:
                                                `${stat}:${tierKey}`
                                        };

                                    }
                                )
                        )
                )
        );

}

function buildTierFields() {

    return getTierKeys()
        .map(
            (tierKey) => ({
                name:
                    `\uD83D\uDED2 Tier ${tierKey}`,
                value:
                    boosterStats.map(
                        (stat) =>
                            formatShopItem(
                                stat,
                                tierKey
                            )
                    ).join(
                        '\n'
                    ),
                inline:
                    false
            })
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
                    '/shop boosters',
                title:
                    'Booster Shop',
                description:
`${notice?.text ? `${notice.text}\n\n` : ''}Balance: **${user.coins} coins**
Buy boosters for future \`/pornscene\` requests. One booster can be spent per scene.
Every boosted stat point helps scene score, crit chance, or viewers. Stamina scene length still improves at **${SCENE_BALANCE.STAT_BONUS_THRESHOLD}**-point combined milestones. Stronger tiers add more burnout risk.`
            }
        );

    embed.addFields(
        ...buildTierFields()
    );

    return {
        embeds: [
            embed
        ],
        components: [
            buildShopMenu(
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

    const spent =
        await spendCoins(
            interaction.user.id,
            cost
        );

    if (
        !spent
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

    await addBooster(
        interaction.user.id,
        stat,
        numericTier
    );

    await incrementAchievementProgress(
        interaction.client,
        interaction.user.id,
        'shop_purchases'
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
                    })}** for **${cost} coins**.`
            }
        )
    );

}

module.exports = {
    buildShopReply,
    buyShopBooster
};
