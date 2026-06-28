const {
    getOrCreateUser
} = require('./core');

const db =
    require('../../database/database');

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

async function spendCoins(
    userId,
    amount
) {

    const cost =
        Number(
            amount
        );

    if (
        !Number.isFinite(
            cost
        ) ||
        cost <= 0
    )
        return true;

    await getOrCreateUser(
        userId
    );

    return new Promise(
        (resolve, reject) => {

            db.run(
                `UPDATE users
                SET coins = coins - ?
                WHERE id = ?
                AND coins >= ?`,
                [
                    cost,
                    userId,
                    cost
                ],
                function onSpend(
                    error
                ) {

                    if (
                        error
                    ) {

                        reject(
                            error
                        );

                        return;

                    }

                    resolve(
                        this.changes > 0
                    );

                }
            );

        }
    );

}

async function spendResources(
    userId,
    {
        coins = 0,
        xp = 0
    } = {}
) {

    const coinCost =
        Number(
            coins
        );

    const xpCost =
        Number(
            xp
        );

    if (
        !Number.isFinite(
            coinCost
        ) ||
        !Number.isFinite(
            xpCost
        ) ||
        coinCost < 0 ||
        xpCost < 0
    )
        return false;

    if (
        coinCost === 0 &&
        xpCost === 0
    )
        return true;

    await getOrCreateUser(
        userId
    );

    return new Promise(
        (resolve, reject) => {

            db.run(
                `UPDATE users
                SET coins = coins - ?,
                    xp = xp - ?
                WHERE id = ?
                AND coins >= ?
                AND xp >= ?`,
                [
                    coinCost,
                    xpCost,
                    userId,
                    coinCost,
                    xpCost
                ],
                function onSpend(
                    error
                ) {

                    if (
                        error
                    ) {

                        reject(
                            error
                        );

                        return;

                    }

                    resolve(
                        this.changes > 0
                    );

                }
            );

        }
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
    spendCoins,
    spendResources,
    setCoins
};
