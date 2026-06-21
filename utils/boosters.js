const db =
    require('../database/database');

const boosterStats = [
    'performance',
    'stamina',
    'fame'
];

const boosterStatLabels = {
    performance:
        'Performance',
    stamina:
        'Stamina',
    fame:
        'Fame'
};

const boosterTiers = {
    1: {
        value: 2,
        cost: 250,
        burnoutRisk: 1
    },
    2: {
        value: 4,
        cost: 400,
        burnoutRisk: 3
    },
    3: {
        value: 6,
        cost: 800,
        burnoutRisk: 6
    },
    4: {
        value: 8,
        cost: 1400,
        burnoutRisk: 10
    }
};

const baseFlopChance =
    5;

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

function formatBooster(
    booster
) {

    if (
        !booster
    )
        return 'None';

    const tier =
        boosterTiers[booster.tier];

    return `${boosterStatLabels[booster.stat]} T${booster.tier} (+${tier.value}, +${tier.burnoutRisk}% burnout)`;

}

function formatBoosterInventoryLine(
    booster
) {

    const tier =
        boosterTiers[booster.tier];

    return `- **${boosterStatLabels[booster.stat]} T${booster.tier}** (+${tier.value}, +${tier.burnoutRisk}% burnout) x${booster.quantity}`;

}

function formatBoosterSelectDescription(
    booster
) {

    const tier =
        boosterTiers[booster.tier];

    return `+${tier.value} ${boosterStatLabels[booster.stat]}, +${tier.burnoutRisk}% burnout. Owned: ${booster.quantity}`;

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
    baseFlopChance,
    boosterStatLabels,
    boosterStats,
    boosterTiers,
    formatBooster,
    formatBoosterInventoryLine,
    formatBoosterSelectDescription,
    isValidBooster,
    getUserBoosters,
    addBooster,
    removeBooster
};
