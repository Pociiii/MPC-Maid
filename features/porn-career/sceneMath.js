const {
    baseFlopChance,
    boosterTiers
} = require('../../utils/boosters');

function randomInt(
    min,
    max
) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}

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

function buildPhaseOrder(
    totalParts
) {

    const orders = {
        4: [
            'foreplay',
            'oral',
            'sex',
            'finale'
        ],
        5: [
            'foreplay',
            'oral',
            'sex',
            'sex',
            'finale'
        ],
        6: [
            'foreplay',
            'foreplay',
            'oral',
            'sex',
            'sex',
            'finale'
        ],
        7: [
            'foreplay',
            'foreplay',
            'oral',
            'oral',
            'sex',
            'sex',
            'finale'
        ],
        8: [
            'foreplay',
            'foreplay',
            'oral',
            'oral',
            'sex',
            'sex',
            'sex',
            'finale'
        ]
    };

    return orders[totalParts];

}

function getBoostValue(
    booster,
    stat
) {

    if (
        !booster ||
        booster.stat !== stat
    )
        return 0;

    return boosterTiers[booster.tier].value;

}

function getBoosterBurnoutRisk(
    booster
) {

    if (
        !booster
    )
        return 0;

    return boosterTiers[booster.tier]
        ?.burnoutRisk ?? 0;

}

function formatStatValue(
    value,
    boost
) {

    if (
        boost <= 0
    )
        return `${value}`;

    return `${value}+${boost}`;

}

function calculateScene(
    requesterUser,
    targetUser,
    booster = null
) {

    const requesterPerformanceBoost =
        getBoostValue(
            booster,
            'performance'
        );

    const requesterStaminaBoost =
        getBoostValue(
            booster,
            'stamina'
        );

    const requesterFameBoost =
        getBoostValue(
            booster,
            'fame'
        );

    const requesterPerformance =
        requesterUser.performance +
        requesterPerformanceBoost;

    const requesterStamina =
        requesterUser.stamina +
        requesterStaminaBoost;

    const requesterFame =
        requesterUser.fame +
        requesterFameBoost;

    const combinedPerformance =
        requesterPerformance +
        targetUser.performance;

    const combinedStamina =
        requesterStamina +
        targetUser.stamina;

    const combinedFame =
        requesterFame +
        targetUser.fame;

    const performanceBonus =
        Math.floor(
            combinedPerformance / 10
        );

    const staminaBonus =
        Math.floor(
            combinedStamina / 10
        );

    const fameBonus =
        Math.floor(
            combinedFame / 10
        );

    const totalParts =
        clamp(
            4 + staminaBonus,
            4,
            8
        );

    const xp =
        25 +
        (combinedPerformance * 3) +
        (performanceBonus * 25);

    const viewers =
        100 +
        (combinedFame * 50) +
        (fameBonus * 500) +
        randomInt(
            0,
            250
        );

    const coins =
        Math.max(
            25,
            Math.floor(
                viewers / 10
            )
        );

    const score =
        randomInt(
            1,
            100
        ) +
        Math.floor(
            xp / 10
        ) +
        (totalParts * 4) +
        Math.floor(
            viewers / 100
        );

    let outcome = 'Awkward Scene';
    let rankingChange = -8;
    const flopChance =
        baseFlopChance +
        getBoosterBurnoutRisk(
            booster
        );

    const criticalFlop =
        randomInt(
            1,
            100
        ) <= flopChance;

    if (
        score >= 115
    ) {
        outcome = 'Viral Hit';
        rankingChange = 20;
    }
    else if (
        score >= 85
    ) {
        outcome = 'Hot Scene';
        rankingChange = 12;
    }
    else if (
        score >= 55
    ) {
        outcome = 'Solid Scene';
        rankingChange = 5;
    }

    if (
        criticalFlop
    ) {

        outcome = 'Awkward Scene';
        rankingChange = -8;

    }

    return {
        totalParts,
        score,
        flopChance,
        criticalFlop,
        outcome,
        rankingChange,
        xp,
        viewers,
        coins,
        combinedPerformance,
        combinedStamina,
        combinedFame,
        requesterPerformance,
        requesterStamina,
        requesterFame,
        requesterPerformanceBoost,
        requesterStaminaBoost,
        requesterFameBoost,
        booster
    };

}

function getIntervalMs(
    totalParts
) {

    if (
        totalParts <= 1
    )
        return 0;

    return Math.min(
        randomInt(
            8,
            12
        ) * 60 * 1000,
        Math.floor(
            60 * 60 * 1000 / (totalParts - 1)
        )
    );

}

module.exports = {
    buildPhaseOrder,
    calculateScene,
    formatStatValue,
    getIntervalMs
};
