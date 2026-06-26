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
    setCoins
};
