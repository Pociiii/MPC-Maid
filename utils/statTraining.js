const trainableStats = [
    'performance',
    'stamina',
    'fame'
];

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

module.exports = {
    trainableStats,
    isTrainableStat,
    getStatUpgradeCost
};
