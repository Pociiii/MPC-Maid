const {
    getOrCreateUser
} = require('./core');

const {
    runUserUpdate
} = require('./db');

async function getBalance(
    userId
) {

    const user =
        await getOrCreateUser(
            userId
        );

    return user.coins;

}

function addCoins(
    userId,
    amount
) {

    return runUserUpdate(
        'UPDATE users SET coins = coins + ? WHERE id = ?',
        [
            amount,
            userId
        ]
    );

}

function removeCoins(
    userId,
    amount
) {

    return runUserUpdate(
        'UPDATE users SET coins = coins - ? WHERE id = ?',
        [
            amount,
            userId
        ]
    );

}

function setCoins(
    userId,
    amount
) {

    return runUserUpdate(
        'UPDATE users SET coins = ? WHERE id = ?',
        [
            amount,
            userId
        ]
    );

}

module.exports = {
    addCoins,
    getBalance,
    removeCoins,
    setCoins
};
