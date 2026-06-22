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

const outcomeOrder = [
    'Awkward Scene',
    'Solid Scene',
    'Hot Scene',
    'Viral Hit'
];

const outcomeRewards = {
    'Awkward Scene': {
        ranking:
            -8,
        xp:
            10
    },
    'Solid Scene': {
        ranking:
            5,
        xp:
            20
    },
    'Hot Scene': {
        ranking:
            12,
        xp:
            35
    },
    'Viral Hit': {
        ranking:
            20,
        xp:
            55
    }
};

function getOutcomeFromScore(
    score
) {

    if (
        score >= 115
    )
        return 'Viral Hit';

    if (
        score >= 85
    )
        return 'Hot Scene';

    if (
        score >= 55
    )
        return 'Solid Scene';

    return 'Awkward Scene';

}

function upgradeOutcome(
    outcome
) {

    const index =
        outcomeOrder.indexOf(
            outcome
        );

    return outcomeOrder[
        Math.min(
            outcomeOrder.length - 1,
            index + 1
        )
    ];

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
            combinedPerformance / 2
        ) +
        (totalParts * 4) +
        Math.floor(
            viewers / 100
        );

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

    const critChance =
        clamp(
            3 + (Math.floor(
                combinedPerformance / 20
            ) * 2),
            3,
            15
        );

    const criticalScene =
        !criticalFlop &&
        randomInt(
            1,
            100
        ) <= critChance;

    let outcome =
        getOutcomeFromScore(
            score
        );

    if (
        criticalScene
    )
        outcome =
            upgradeOutcome(
                outcome
            );

    if (
        criticalFlop
    ) {

        outcome = 'Awkward Scene';

    }

    const xp =
        outcomeRewards[outcome].xp +
        (
            criticalScene
                ? 10
                : 0
        );

    const rankingChange =
        outcomeRewards[outcome].ranking;

    return {
        totalParts,
        score,
        flopChance,
        critChance,
        criticalFlop,
        criticalScene,
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
