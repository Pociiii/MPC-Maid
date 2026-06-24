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

    return 50 +
        (currentStat * 20) +
        (currentStat * currentStat * 2) +
        (milestone * 500) +
        (prestigeLevel * 250) +
        (prestigeLevel * prestigeLevel * 75);

}

function getStatUpgradeCoinCost(
    currentStat
) {

    const prestigeLevel =
        Math.max(
            0,
            currentStat - prestigeStatStart + 1
        );

    return (currentStat * 75) +
        (prestigeLevel * 100) +
        (prestigeLevel * prestigeLevel * 25);

}

module.exports = {
    trainableStats,
    isTrainableStat,
    prestigeStatStart,
    getStatUpgradeCost,
    getStatUpgradeCoinCost
};
