const trainableStats = [
    'performance',
    'stamina',
    'fame'
];

const maxTrainableStat = 40;

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

    return 50 +
        (currentStat * 20) +
        (currentStat * currentStat * 2) +
        (milestone * 500);

}

function getStatUpgradeCoinCost(
    currentStat
) {

    return currentStat * 75;

}

module.exports = {
    trainableStats,
    isTrainableStat,
    maxTrainableStat,
    getStatUpgradeCost,
    getStatUpgradeCoinCost
};
