const {
    getOrCreateUser
} = require('./core');

const {
    runUserUpdate
} = require('./db');

async function getRanking(
    userId
) {

    const user =
        await getOrCreateUser(
            userId
        );

    return user.ranking;

}

async function getScenesCompleted(
    userId
) {

    const user =
        await getOrCreateUser(
            userId
        );

    return user.scenes_completed;

}

function addRanking(
    userId,
    amount
) {

    return runUserUpdate(
        'UPDATE users SET ranking = ranking + ? WHERE id = ?',
        [
            amount,
            userId
        ]
    );

}

function addScene(
    userId
) {

    return runUserUpdate(
        'UPDATE users SET scenes_completed = scenes_completed + 1 WHERE id = ?',
        [
            userId
        ]
    );

}

module.exports = {
    addRanking,
    addScene,
    getRanking,
    getScenesCompleted
};
