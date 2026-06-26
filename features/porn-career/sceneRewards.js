const {
    addCoins,
    addRanking,
    addScene,
    addXP
} = require('../../utils/users');

const {
    ECONOMY
} = require('../../data/constants');

function getRequesterSceneXp(
    result
) {

    return result.xp + ECONOMY.PORN_SCENE_STARTER_XP_BONUS;

}

function getTargetSceneXp(
    result
) {

    return result.xp;

}

async function applyRewards(
    requesterId,
    targetId,
    result
) {

    await Promise.all([
        addXP(
            requesterId,
            getRequesterSceneXp(
                result
            )
        ),
        addXP(
            targetId,
            getTargetSceneXp(
                result
            )
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
    applyRewards,
    getRequesterSceneXp,
    getTargetSceneXp
};
