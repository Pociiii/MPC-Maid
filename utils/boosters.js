const db =
    require('../database/database');

const boosterStats = [
    'performance',
    'stamina',
    'fame'
];

const boosterTiers = {
    1: {
        value: 2,
        cost: 150
    },
    2: {
        value: 4,
        cost: 400
    },
    3: {
        value: 6,
        cost: 800
    },
    4: {
        value: 8,
        cost: 1400
    }
};

function isValidBooster(
    stat,
    tier
) {

    return boosterStats.includes(
        stat
    ) &&
        Boolean(
            boosterTiers[tier]
        );

}

function getUserBoosters(
    userId
) {

    return new Promise(
        (resolve, reject) => {

            db.all(
                `SELECT *
                FROM user_boosters
                WHERE user_id = ?
                AND quantity > 0
                ORDER BY stat ASC, tier ASC`,
                [userId],
                (error, rows) => {

                    if (
                        error
                    )
                        reject(
                            error
                        );
                    else
                        resolve(
                            rows
                        );

                }
            );

        }
    );

}

function addBooster(
    userId,
    stat,
    tier,
    quantity = 1
) {

    return new Promise(
        (resolve, reject) => {

            db.run(
                `INSERT INTO user_boosters (
                    user_id,
                    stat,
                    tier,
                    quantity
                )
                VALUES (?, ?, ?, ?)
                ON CONFLICT(user_id, stat, tier)
                DO UPDATE SET quantity = quantity + excluded.quantity`,
                [
                    userId,
                    stat,
                    tier,
                    quantity
                ],
                (error) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve()
            );

        }
    );

}

function removeBooster(
    userId,
    stat,
    tier,
    quantity = 1
) {

    return new Promise(
        (resolve, reject) => {

            db.run(
                `UPDATE user_boosters
                SET quantity = quantity - ?
                WHERE user_id = ?
                AND stat = ?
                AND tier = ?
                AND quantity >= ?`,
                [
                    quantity,
                    userId,
                    stat,
                    tier,
                    quantity
                ],
                function(error) {

                    if (
                        error
                    )
                        reject(
                            error
                        );
                    else
                        resolve(
                            this.changes > 0
                        );

                }
            );

        }
    );

}

module.exports = {
    boosterStats,
    boosterTiers,
    isValidBooster,
    getUserBoosters,
    addBooster,
    removeBooster
};
