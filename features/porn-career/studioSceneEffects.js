const {
    calculateScene
} = require('./sceneMath');

const outcomeRanks = {
    'Awkward Scene': 0,
    'Solid Scene': 1,
    'Hot Scene': 2,
    'Viral Hit': 3
};

function compareSceneResults(first, second) {
    const comparisons = [
        (outcomeRanks[first.outcome] ?? -1) - (outcomeRanks[second.outcome] ?? -1),
        (first.score ?? 0) - (second.score ?? 0),
        (first.viewers ?? 0) - (second.viewers ?? 0),
        (first.xp ?? 0) - (second.xp ?? 0)
    ];

    return comparisons.find((comparison) => comparison !== 0) ?? 0;
}

function selectBetterSceneResult(first, second, random = Math.random) {
    const comparison = compareSceneResults(first, second);

    if (comparison > 0)
        return first;
    if (comparison < 0)
        return second;
    return random() < 0.5 ? first : second;
}

function calculateStudioSceneResult(
    requesterUser,
    targetUser,
    booster,
    effects = {}
) {
    const first = calculateScene(requesterUser, targetUser, booster);
    const selected = effects.talentScout
        ? selectBetterSceneResult(
            first,
            calculateScene(requesterUser, targetUser, booster)
        )
        : first;
    const marketingBonus = effects.marketingExpert
        ? Math.floor(selected.coins * 0.10)
        : 0;

    return {
        ...selected,
        requesterCoins: selected.coins + marketingBonus,
        targetCoins: selected.coins,
        marketingBonus,
        studioEffects: {
            productionManager: Boolean(effects.productionManager),
            talentScout: Boolean(effects.talentScout),
            marketingExpert: Boolean(effects.marketingExpert)
        }
    };
}

function applyProductionManagerInterval(intervalMs, active) {
    return active
        ? Math.floor(intervalMs * 0.90)
        : intervalMs;
}

module.exports = {
    applyProductionManagerInterval,
    calculateStudioSceneResult,
    compareSceneResults,
    selectBetterSceneResult
};
