const {
    getOrCreateUser
} = require('./core');

const {
    runUserUpdate
} = require('./db');

async function getPerformance(
    userId
) {

    const user =
        await getOrCreateUser(
            userId
        );

    return user.performance;

}

async function getStamina(
    userId
) {

    const user =
        await getOrCreateUser(
            userId
        );

    return user.stamina;

}

async function getFame(
    userId
) {

    const user =
        await getOrCreateUser(
            userId
        );

    return user.fame;

}

function setPerformance(
    userId,
    amount
) {

    return runUserUpdate(
        'UPDATE users SET performance = ? WHERE id = ?',
        [
            amount,
            userId
        ]
    );

}

function setStamina(
    userId,
    amount
) {

    return runUserUpdate(
        'UPDATE users SET stamina = ? WHERE id = ?',
        [
            amount,
            userId
        ]
    );

}

function setFame(
    userId,
    amount
) {

    return runUserUpdate(
        'UPDATE users SET fame = ? WHERE id = ?',
        [
            amount,
            userId
        ]
    );

}

module.exports = {
    getFame,
    getPerformance,
    getStamina,
    setFame,
    setPerformance,
    setStamina
};
