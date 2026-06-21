const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const {
    COLORS
} = require('../../data/constants');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    getOrCreateUser,
    removeCoins,
    removeXP,
    setFame,
    setPerformance,
    setStamina
} = require('../../utils/users');

const {
    trackDailyQuest
} = require('../daily-quests/dailyQuests');

const {
    setAchievementProgress
} = require('../achievements/achievements');

const {
    getStatUpgradeCoinCost,
    getStatUpgradeCost,
    isTrainableStat,
    maxTrainableStat,
    trainableStats
} = require('../../utils/statTraining');

const statLabels = {
    performance: 'Performance',
    stamina: 'Stamina',
    fame: 'Fame'
};

const statEmojis = {
    performance: '💪',
    stamina: '❤️',
    fame: '👑'
};

const statSetters = {
    performance: setPerformance,
    stamina: setStamina,
    fame: setFame
};

function getStatCost(
    value
) {

    return {
        xp:
            getStatUpgradeCost(
                value
            ),
        coins:
            getStatUpgradeCoinCost(
                value
            )
    };

}

function isCapped(
    user,
    stat
) {

    const value =
        Number(
            user[stat]
        );

    return value >= maxTrainableStat;

}

function formatStatField(
    user,
    stat
) {

    const value =
        Number(
            user[stat]
        );

    if (
        value >= maxTrainableStat
    )
        return `Level **${value}**\nCurrent cap reached.`;

    const cost =
        getStatCost(
            value
        );

    const missing = [];

    if (
        user.xp < cost.xp
    )
        missing.push(
            `${cost.xp - user.xp} XP`
        );

    if (
        user.coins < cost.coins
    )
        missing.push(
            `${cost.coins - user.coins} coins`
        );

    return `Level **${value} -> ${value + 1}**\nCost: **${cost.xp} XP** + **${cost.coins} coins**${
        missing.length > 0
            ? `\nMissing: **${missing.join(
                ' + '
            )}**`
            : ''
    }`;

}

async function buildTrainingPanel(
    interaction,
    notice = null
) {

    const user =
        await getOrCreateUser(
            interaction.user.id
        );

    const embed =
        createEmbed({
            color:
                notice?.success
                    ? COLORS.SUCCESS
                    : COLORS.DEFAULT,
            authorName:
                interaction.member.displayName,
            authorIcon:
                interaction.user.displayAvatarURL(),
            title:
                'Training',
            description:
`${notice?.text ? `${notice.text}\n\n` : ''}Balance: **${user.xp} XP** and **${user.coins} coins**
Pick a stat to train.`,
            footerText:
                '/train',
            timestamp:
                true
        });

    embed.addFields(
        ...trainableStats.map(
            (stat) => ({
                name:
                    statLabels[stat],
                value:
                    formatStatField(
                        user,
                        stat
                    ),
                inline:
                    true
            })
        )
    );

    const row =
        new ActionRowBuilder()
            .addComponents(
                ...trainableStats.map(
                    (stat) =>
                        new ButtonBuilder()
                            .setCustomId(
                                `train:${interaction.user.id}:${stat}`
                            )
                            .setLabel(
                                statLabels[stat]
                            )
                            .setEmoji(
                                statEmojis[stat]
                            )
                            .setStyle(
                                ButtonStyle.Primary
                            )
                            .setDisabled(
                                isCapped(
                                    user,
                                    stat
                                )
                            )
                )
            );

    return {
        embeds: [
            embed
        ],
        components: [
            row
        ]
    };

}

async function trainStat(
    interaction,
    ownerId,
    stat
) {

    if (
        interaction.user.id !== ownerId
    ) {

        await interaction.reply({
            content:
                'This training panel belongs to someone else.',
            flags:
                64
        });

        return;

    }

    await interaction.deferUpdate();

    if (
        !isTrainableStat(
            stat
        )
    ) {

        await interaction.editReply(
            await buildTrainingPanel(
                interaction,
                {
                    success:
                        false,
                    text:
                        'That stat cannot be trained.'
                }
            )
        );

        return;

    }

    const user =
        await getOrCreateUser(
            interaction.user.id
        );

    const currentValue =
        Number(
            user[stat]
        );

    if (
        currentValue >= maxTrainableStat
    ) {

        await interaction.editReply(
            await buildTrainingPanel(
                interaction,
                {
                    success:
                        false,
                    text:
                        `${statLabels[stat]} is already at the cap.`
                }
            )
        );

        return;

    }

    const cost =
        getStatCost(
            currentValue
        );

    if (
        user.xp < cost.xp ||
        user.coins < cost.coins
    ) {

        await interaction.editReply(
            await buildTrainingPanel(
                interaction,
                {
                    success:
                        false,
                    text:
                        `Not enough resources for ${statLabels[stat]}. Check the missing amount below.`
                }
            )
        );

        return;

    }

    await Promise.all([
        removeXP(
            interaction.user.id,
            cost.xp
        ),
        removeCoins(
            interaction.user.id,
            cost.coins
        ),
        statSetters[stat](
            interaction.user.id,
            currentValue + 1
        )
    ]);

    await interaction.editReply(
        await buildTrainingPanel(
            interaction,
            {
                success:
                    true,
                text:
                    `${statLabels[stat]} trained from **${currentValue}** to **${currentValue + 1}**.`
            }
        )
    );

    await trackDailyQuest(
        interaction.client,
        interaction.user.id,
        'train'
    );

    await setAchievementProgress(
        interaction.client,
        interaction.user.id,
        stat,
        currentValue + 1
    );

}

module.exports = {
    buildTrainingPanel,
    trainStat
};
