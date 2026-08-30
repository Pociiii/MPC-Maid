const {
    addCoins,
    addScene,
    addXP
} = require('../../utils/users');

const {
    ECONOMY
} = require('../../data/constants');

const {
    syncUserAchievementCounters
} = require('../achievements/achievements');

function getEmptySceneRewardBonuses() {

    return {
        requester: {
            serverTag:
                0
        },
        target: {
            serverTag:
                0
        }
    };

}

function normalizeSceneRewardBonuses(
    rewardBonuses
) {

    return {
        requester: {
            serverTag:
                rewardBonuses?.requester?.serverTag ?? 0
        },
        target: {
            serverTag:
                rewardBonuses?.target?.serverTag ?? 0
        }
    };

}

function hasMpcServerTag(
    user
) {

    const primaryGuild =
        user?.primaryGuild;

    return Boolean(
        primaryGuild?.identityEnabled === true &&
        primaryGuild.identityGuildId === process.env.GUILD_ID &&
        primaryGuild.tag
    );

}

async function fetchUserForServerTag(
    client,
    userId
) {

    return await client.users.fetch(
        userId,
        {
            force:
                true
        }
    ).catch(
        () =>
            client.users.cache.get(
                userId
            ) ?? null
    );

}

async function buildSceneRewardBonuses(
    client,
    requesterId,
    targetId
) {

    const [
        requester,
        target
    ] =
        await Promise.all([
            fetchUserForServerTag(
                client,
                requesterId
            ),
            fetchUserForServerTag(
                client,
                targetId
            )
        ]);

    return {
        requester: {
            serverTag:
                hasMpcServerTag(
                    requester
                )
                    ? ECONOMY.PORN_SCENE_SERVER_TAG_XP_BONUS
                    : 0
        },
        target: {
            serverTag:
                hasMpcServerTag(
                    target
                )
                    ? ECONOMY.PORN_SCENE_SERVER_TAG_XP_BONUS
                    : 0
        }
    };

}

function getRequesterSceneXp(
    result,
    rewardBonuses = getEmptySceneRewardBonuses()
) {

    const normalizedBonuses =
        normalizeSceneRewardBonuses(
            rewardBonuses
        );

    return result.xp +
        ECONOMY.PORN_SCENE_STARTER_XP_BONUS +
        normalizedBonuses.requester.serverTag;

}

function getTargetSceneXp(
    result,
    rewardBonuses = getEmptySceneRewardBonuses()
) {

    const normalizedBonuses =
        normalizeSceneRewardBonuses(
            rewardBonuses
        );

    return result.xp +
        normalizedBonuses.target.serverTag;

}

async function applyRewards(
    client,
    requesterId,
    targetId,
    result,
    rewardBonuses = getEmptySceneRewardBonuses()
) {

    const requesterCoins = result.requesterCoins ?? result.coins;
    const targetCoins = result.targetCoins ?? result.coins;

    const normalizedBonuses =
        normalizeSceneRewardBonuses(
            rewardBonuses
        );

    await Promise.all([
        addXP(
            requesterId,
            getRequesterSceneXp(
                result,
                normalizedBonuses
            )
        ),
        addXP(
            targetId,
            getTargetSceneXp(
                result,
                normalizedBonuses
            )
        ),
        addCoins(
            requesterId,
            requesterCoins,
            {
                source:
                    'porn_scene'
            }
        ),
        addCoins(
            targetId,
            targetCoins,
            {
                source:
                    'porn_scene'
            }
        ),
        addScene(
            requesterId
        ),
        addScene(
            targetId
        )
    ]);

    await Promise.all([
        syncUserAchievementCounters(
            client,
            requesterId,
            [
                'xp_earned',
                'wallet_coins'
            ]
        ),
        syncUserAchievementCounters(
            client,
            targetId,
            [
                'xp_earned',
                'wallet_coins'
            ]
        )
    ]);

}

async function syncSceneRewardCounters(
    client,
    requesterId,
    targetId
) {

    await Promise.all([
        syncUserAchievementCounters(
            client,
            requesterId,
            [
                'xp_earned',
                'wallet_coins'
            ]
        ),
        syncUserAchievementCounters(
            client,
            targetId,
            [
                'xp_earned',
                'wallet_coins'
            ]
        )
    ]);

}

module.exports = {
    applyRewards,
    buildSceneRewardBonuses,
    getRequesterSceneXp,
    getTargetSceneXp,
    normalizeSceneRewardBonuses,
    syncSceneRewardCounters
};
