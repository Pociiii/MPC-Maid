const db =
    require('../../database/database');

const {
    getGuildMembers
} = require('../../utils/memberCache');

const {
    limit
} = require('./config');

function allUsers() {

    return new Promise(
        (resolve, reject) => {

            db.all(
                'SELECT * FROM users',
                [],
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

function achievementUsers() {

    return new Promise(
        (resolve, reject) => {

            db.all(
                `SELECT
                    users.id,
                    COALESCE(SUM(user_achievements.points), 0) AS achievement_points
                 FROM users
                 LEFT JOIN user_achievements
                    ON users.id = user_achievements.user_id
                 GROUP BY users.id`,
                [],
                (error, rows) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            rows
                        )
            );

        }
    );

}

function topBy(
    users,
    stat,
    includeUser = () => true
) {

    return users
        .filter(
            (user) =>
                includeUser(
                    user
                )
        )
        .sort(
            (a, b) =>
                Number(
                    b[stat]
                ) -
                Number(
                    a[stat]
                )
        )
        .slice(
            0,
            limit
        );

}

async function filterByRole(
    interaction,
    users,
    roleId
) {

    const members =
        await getGuildMembers(
            interaction.guild
        );

    return users.filter(
        (user) => {

            const member =
                members.get(
                    user.id
                );

            return Boolean(
                member &&
                member.roles.cache.has(
                    roleId
                )
            );

        }
    );

}

module.exports = {
    achievementUsers,
    allUsers,
    filterByRole,
    topBy
};
