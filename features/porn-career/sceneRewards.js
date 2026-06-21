const {
    addCoins,
    addRanking,
    addScene,
    addXP
} = require('../../utils/users');

async function applyRewards(
    requesterId,
    targetId,
    result
) {

    await Promise.all([
        addXP(
            requesterId,
            result.xp
        ),
        addXP(
            targetId,
            result.xp
        ),
        addCoins(
            requesterId,
            result.coins
        ),
        addCoins(
            targetId,
            result.coins
        ),
        addRanking(
            requesterId,
            result.rankingChange
        ),
        addRanking(
            targetId,
            result.rankingChange
        ),
        addScene(
            requesterId
        ),
        addScene(
            targetId
        )
    ]);

}

module.exports = {
    applyRewards
};
