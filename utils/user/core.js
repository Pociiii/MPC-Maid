const db =
    require('../../database/database');

const {
    ECONOMY,
    STATS
} = require('../../data/constants');

function getUser(
    userId
) {

    return new Promise(
        (resolve, reject) => {

            db.get(
                'SELECT * FROM users WHERE id = ?',
                [
                    userId
                ],
                (error, row) => {

                    if (
                        error
                    )
                        reject(
                            error
                        );
                    else
                        resolve(
                            row
                        );

                }
            );

        }
    );

}

function createUser(
    userId
) {

    return new Promise(
        (resolve, reject) => {

            db.run(
                `INSERT INTO users (
                    id,
                    coins,
                    xp,
                    performance,
                    stamina,
                    fame,
                    ranking,
                    scenes_completed,
                    spanks_taken,
                    spanks_given,
                    kisses_taken,
                    kisses_given,
                    horny_helps,
                    partner_id,
                    mother_id,
                    father_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    ECONOMY.STARTING_COINS,
                    0,
                    STATS.DEFAULT_PERFORMANCE,
                    STATS.DEFAULT_STAMINA,
                    STATS.DEFAULT_FAME,
                    STATS.DEFAULT_RANKING,
                    0,
                    STATS.DEFAULT_SPANKS_TAKEN,
                    STATS.DEFAULT_SPANKS_GIVEN,
                    0,
                    0,
                    0,
                    null,
                    null,
                    null
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

async function getOrCreateUser(
    userId
) {

    let user =
        await getUser(
            userId
        );

    if (
        !user
    ) {

        await createUser(
            userId
        );

        user =
            await getUser(
                userId
            );

    }

    return user;

}

module.exports = {
    createUser,
    getOrCreateUser,
    getUser
};
