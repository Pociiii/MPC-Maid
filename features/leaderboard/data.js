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

function rankedBy(
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

}

function topBy(
    users,
    stat,
    includeUser = () => true
) {

    return rankedBy(
        users,
        stat,
        includeUser
    ).slice(
        0,
        limit
    );

}

function rankBy(
    users,
    stat,
    userId,
    includeUser = () => true
) {

    const rankedUsers =
        rankedBy(
            users,
            stat,
            includeUser
        );

    const index =
        rankedUsers.findIndex(
            (user) =>
                user.id === userId
        );

    if (
        index === -1
    )
        return null;

    return {
        rank:
            index + 1,
        user:
            rankedUsers[index],
        value:
            Number(
                rankedUsers[index][stat]
            )
    };

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
    rankBy,
    topBy
};
