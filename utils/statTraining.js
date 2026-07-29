const trainableStats = [
    'performance',
    'stamina',
    'fame'
];

const prestigeStatStart = 40;

function isTrainableStat(
    stat
) {

    return trainableStats.includes(
        stat
    );

}

function getStatUpgradeCost(
    currentStat
) {

    const milestone =
        Math.floor(
            currentStat / 10
        );

    const prestigeLevel =
        Math.max(
            0,
            currentStat - prestigeStatStart + 1
        );

    return Math.floor(
        25 +
        (currentStat * 6) +
        (currentStat * currentStat * 0.45) +
        (milestone * 100) +
        (prestigeLevel * 50) +
        (prestigeLevel * prestigeLevel * 8)
    );

}

function getStatUpgradeCoinCost(
    currentStat
) {

    const prestigeLevel =
        Math.max(
            0,
            currentStat - prestigeStatStart + 1
        );

    const milestone =
        Math.floor(
            currentStat / 10
        );

    const previousCost =
        (currentStat * 20) +
        (milestone * 50) +
        (prestigeLevel * 40) +
        (prestigeLevel * prestigeLevel * 5);

    return Math.max(
        50,
        Math.ceil(
            previousCost *
            1.5
        )
    );

}

module.exports = {
    trainableStats,
    isTrainableStat,
    prestigeStatStart,
    getStatUpgradeCost,
    getStatUpgradeCoinCost
};
