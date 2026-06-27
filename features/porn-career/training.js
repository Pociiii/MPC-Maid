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

const emojis =
    require('../../utils/emojis');

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
    setAchievementProgress,
    syncUserAchievementCounters
} = require('../achievements/achievements');

const {
    getStatUpgradeCoinCost,
    getStatUpgradeCost,
    isTrainableStat,
    prestigeStatStart,
    trainableStats
} = require('../../utils/statTraining');

const statLabels = {
    performance: 'Performance',
    stamina: 'Stamina',
    fame: 'Fame'
};

const statEmojis = {
    performance: '\uD83D\uDCAA',
    stamina: '\u2764\uFE0F',
    fame: '\uD83D\uDC51'
};

const statSetters = {
    performance: setPerformance,
    stamina: setStamina,
    fame: setFame
};

const statDescriptions = {
    performance:
        'Better scene score and critical scene chance.',
    stamina:
        'More scene parts, up to 8, with small XP bonuses.',
    fame:
        'More viewers, coins, and score.'
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

function formatStatField(
    user,
    stat
) {

    const value =
        Number(
            user[stat]
        );

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

    const prestigeText =
        value >= prestigeStatStart
            ? `\nPrestige training: costs rise hard after **${prestigeStatStart}**, but the stat still counts.`
            : '';

    return `${statDescriptions[stat]}\nLevel **${value} -> ${value + 1}**\nCost: **${cost.xp} XP** + **${cost.coins} coins**${prestigeText}${
        missing.length > 0
            ? `\nMissing: **${missing.join(
                ' + '
            )}**`
            : ''
    }`;

}

function getBalancedStatValue(
    user,
    trainedStat,
    trainedValue
) {

    return Math.min(
        ...trainableStats.map(
            (stat) =>
                stat === trainedStat
                    ? trainedValue
                    : Number(
                        user[stat] ?? 0
                    )
        )
    );

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
            thumbnail:
                interaction.user.displayAvatarURL(),
            title:
                'Training',
            description:
`${notice?.text ? `${notice.text}\n\n` : ''}Balance: **${user.xp} XP** + **${user.coins} coins**
Pick a stat to train. Stats keep counting in scenes, but training gets much more expensive after **${prestigeStatStart}**.`,
            footerText:
                '/train',
            timestamp:
                true
        });

    embed.addFields(
        ...trainableStats.map(
            (stat) => ({
                name:
                    `${statEmojis[stat]} ${statLabels[stat]}`,
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
                        `Not enough resources for ${statEmojis[stat]} ${statLabels[stat]}. Check the missing amount below.`
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
                    `${statEmojis[stat]} ${statLabels[stat]} trained from **${currentValue}** to **${currentValue + 1}**.`
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

    await setAchievementProgress(
        interaction.client,
        interaction.user.id,
        'all_stats',
        getBalancedStatValue(
            user,
            stat,
            currentValue + 1
        )
    );

    await syncUserAchievementCounters(
        interaction.client,
        interaction.user.id,
        [
            'xp_earned'
        ]
    );

}

module.exports = {
    buildTrainingPanel,
    trainStat
};
