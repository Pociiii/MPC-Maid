const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    COLORS
} = require('../../data/constants');

const {
    PREGNANCY
} = require('../../data/pregnancyConfig');

const {
    getActivePregnancy,
    getFertilityPillActivation,
    getNextPregnancyResetTimestamp,
    purchaseFertilityPill
} = require('../../database/pregnancy');

const {
    createUserEmbed
} = require('../../utils/embeds');

const {
    getOrCreateUser
} = require('../../utils/users');

const {
    incrementAchievementProgress
} = require('../achievements/achievements');

async function buildFertilityShopReply(
    interaction,
    notice = null
) {

    const [
        user,
        activePregnancy,
        activation
    ] = await Promise.all([
        getOrCreateUser(interaction.user.id),
        getActivePregnancy(interaction.user.id),
        getFertilityPillActivation(interaction.user.id)
    ]);

    const disabled =
        Boolean(activePregnancy) ||
        Boolean(activation) ||
        user.coins < PREGNANCY.FERTILITY_PILL_COST;

    let status =
        'Available to activate.';

    if (activePregnancy)
        status = 'Unavailable while you are pregnant.';
    else if (activation)
        status = 'Active for the current pregnancy day.';
    else if (user.coins < PREGNANCY.FERTILITY_PILL_COST)
        status = 'You do not have enough coins.';

    const embed =
        createUserEmbed(
            interaction,
            {
                color:
                    notice?.success === false
                        ? COLORS.ERROR
                        : COLORS.DEFAULT,
                command:
                    '/shop fertility',
                title:
                    'Fertility Shop',
                description:
`${notice?.text ? `${notice.text}\n\n` : ''}Balance: **${user.coins} coins**

💊 **Fertility Pill — ${PREGNANCY.FERTILITY_PILL_COST} coins**
Adds **+${PREGNANCY.FERTILITY_PILL_BONUS} percentage points** to your contribution for the current pregnancy day. Both selected participants may contribute a pill bonus, but the combined pregnancy chance is always capped at **${PREGNANCY.MAX_PREGNANCY_CHANCE}%**.

The pill activates immediately, cannot stack or be extended, and may be wasted if you do not participate in a roll or are not the selected partner.

Status: **${status}**
Reset: <t:${getNextPregnancyResetTimestamp()}:F> (<t:${getNextPregnancyResetTimestamp()}:R>)`
            }
        );

    return {
        embeds: [embed],
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`fertility_pill_buy:${interaction.user.id}`)
                        .setLabel(`Activate for ${PREGNANCY.FERTILITY_PILL_COST} coins`)
                        .setEmoji('💊')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(disabled)
                )
        ]
    };

}

async function buyFertilityPill(
    interaction,
    ownerId
) {

    if (interaction.user.id !== ownerId) {
        await interaction.reply({
            content: 'This shop panel belongs to someone else.',
            flags: 64
        });
        return;
    }

    await interaction.deferUpdate();

    const result =
        await purchaseFertilityPill(ownerId);

    const notices = {
        active: {
            success: false,
            text: 'Your fertility pill is already active for this pregnancy day.'
        },
        insufficient: {
            success: false,
            text: `You need **${PREGNANCY.FERTILITY_PILL_COST} coins** to activate a fertility pill.`
        },
        pregnant: {
            success: false,
            text: 'You cannot activate a fertility pill while pregnant.'
        },
        purchased: {
            success: true,
            text: `Activated a fertility pill for **${PREGNANCY.FERTILITY_PILL_COST} coins**. Your fertility contribution receives **+${PREGNANCY.FERTILITY_PILL_BONUS} points** for this pregnancy day.`
        }
    };

    if (result.status === 'purchased')
        await incrementAchievementProgress(
            interaction.client,
            ownerId,
            'shop_purchases'
        );

    await interaction.editReply(
        await buildFertilityShopReply(
            interaction,
            notices[result.status]
        )
    );

}

module.exports = {
    buildFertilityShopReply,
    buyFertilityPill
};
