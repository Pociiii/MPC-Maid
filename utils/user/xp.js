const {
    getOrCreateUser
} = require('./core');

const {
    runUserUpdate
} = require('./db');

async function getXP(
    userId
) {

    const user =
        await getOrCreateUser(
            userId
        );

    return user.xp;

}

function addXP(
    userId,
    amount
) {

    return runUserUpdate(
        'UPDATE users SET xp = xp + ? WHERE id = ?',
        [
            amount,
            userId
        ]
    );

}

function removeXP(
    userId,
    amount
) {

    return runUserUpdate(
        'UPDATE users SET xp = xp - ? WHERE id = ?',
        [
            amount,
            userId
        ]
    );

}

module.exports = {
    addXP,
    getXP,
    removeXP
};
