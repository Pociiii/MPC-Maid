const {
    baseFlopChance,
    boosterTiers
} = require('../../utils/boosters');

const {
    SCENE_BALANCE
} = require('../../data/constants');

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

    const cappedTotalParts =
        clamp(
            totalParts,
            4,
            8
        );

    const foreplayParts =
        cappedTotalParts >= 5
            ? 2
            : 1;

    const oralParts =
        cappedTotalParts >= 6
            ? 2
            : 1;

    const sexParts =
        Math.max(
            1,
            cappedTotalParts - foreplayParts - oralParts - 1
        );

    return [
        ...Array(
            foreplayParts
        ).fill(
            'foreplay'
        ),
        ...Array(
            oralParts
        ).fill(
            'oral'
        ),
        ...Array(
            sexParts
        ).fill(
            'sex'
        ),
        'finale'
    ];

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

const baseSceneScoreBonus =
    16;

const scorePerStatThreshold =
    3;

const xpPerExtraPart =
    2;

const viewerBonusPerFameThreshold =
    500;

const criticalChancePerPerformanceThreshold =
    1;

const viewerBonusPerFamePoint =
    viewerBonusPerFameThreshold / SCENE_BALANCE.STAT_BONUS_THRESHOLD;

function getStatBonus(
    combinedStat
) {

    return Math.floor(
        combinedStat / SCENE_BALANCE.STAT_BONUS_THRESHOLD
    );

}

function getSmoothStatBonus(
    combinedStat,
    bonusPerThreshold
) {

    return (
        combinedStat /
        SCENE_BALANCE.STAT_BONUS_THRESHOLD
    ) * bonusPerThreshold;

}

function getScoreBonus(
    combinedStat
) {

    return getSmoothStatBonus(
        combinedStat,
        scorePerStatThreshold
    );

}

function getCriticalChance(
    combinedPerformance
) {

    return clamp(
        3 +
        getSmoothStatBonus(
            combinedPerformance,
            criticalChancePerPerformanceThreshold
        ),
        3,
        15
    );

}

function getTotalParts(
    combinedStamina
) {

    return clamp(
        4 +
        getStatBonus(
            combinedStamina
        ),
        4,
        8
    );

}

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
        getStatBonus(
            combinedStamina
        );

    const totalParts =
        getTotalParts(
            combinedStamina
        );

    const extraParts =
        Math.max(
            0,
            totalParts - 4
        );

    const staminaXpBonus =
        extraParts * xpPerExtraPart;

    const performanceScoreBonus =
        getScoreBonus(
            combinedPerformance
        );

    const staminaScoreBonus =
        getScoreBonus(
            combinedStamina
        );

    const fameScoreBonus =
        getScoreBonus(
            combinedFame
        );

    const statScoreBonus =
        performanceScoreBonus +
        staminaScoreBonus +
        fameScoreBonus;

    const viewers =
        Math.round(
            100 +
            (combinedFame * 50) +
            (combinedFame * viewerBonusPerFamePoint) +
            randomInt(
                0,
                250
            )
        );

    const partViewers =
        Array.from(
            {
                length:
                    totalParts
            },
            (_value, index) => {

                const progress =
                    (index + 1) / totalParts;

                if (
                    index === totalParts - 1
                )
                    return viewers;

                return clamp(
                    Math.round(
                        (viewers * (0.45 + (progress * 0.5))) +
                        randomInt(
                            -35,
                            35
                        )
                    ),
                    25,
                    viewers
                );

            }
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
        baseSceneScoreBonus +
        statScoreBonus;

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
        getCriticalChance(
            combinedPerformance
        );

    const criticalScene =
        !criticalFlop &&
        (Math.random() * 100) < critChance;

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
        ) +
        staminaXpBonus;

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
        staminaXpBonus,
        viewers,
        partViewers,
        coins,
        combinedPerformance,
        combinedStamina,
        combinedFame,
        performanceScoreBonus,
        staminaScoreBonus,
        fameScoreBonus,
        statScoreBonus,
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
    getCriticalChance,
    getScoreBonus,
    getStatBonus,
    getTotalParts,
    getIntervalMs
};
