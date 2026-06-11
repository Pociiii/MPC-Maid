const db = require('../database/database');
const {
    ECONOMY,
    STATS
} = require('../data/constants');

// Get user
function getUser(userId) {
    return new Promise((resolve, reject) => {

        db.get(
            'SELECT * FROM users WHERE id = ?',
            [userId],
            (err, row) => {

                if (err)
                    return reject(err);

                resolve(row);
            }
        );

    });

}

// Create user
function createUser(userId) {
    return new Promise((resolve, reject) => {

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
                kisses_given
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                ECONOMY.STARTING_COINS,
                0,
                STATS.DEFAULT_PERFORMANCE,
                STATS.DEFAULT_STAMINA,
                STATS.DEFAULT_FAME,
                0,
                0,
                0,
                0,
                0,
                0
            ],


            function(err) {

                if (err)
                    return reject(err);

                resolve();
            }
        );

    });
}

// Get user or create if missing
async function getOrCreateUser(userId) {

    let user = await getUser(userId);

    console.log("LOOKUP:", userId);
    console.log("USER:", user);

    if (!user) {

        console.log("CREATING USER");

        await createUser(userId);

        user = await getUser(userId);
    }

    return user;
}

// Add coins
function addCoins(userId, amount) {
return new Promise((resolve, reject) => {


    db.run(
        'UPDATE users SET coins = coins + ? WHERE id = ?',
        [amount, userId],
        function(err) {

            if (err)
                return reject(err);

            resolve();
        }
    );

});


}

// Remove coins
function removeCoins(userId, amount) {
return new Promise((resolve, reject) => {


    db.run(
        'UPDATE users SET coins = coins - ? WHERE id = ?',
        [amount, userId],
        function(err) {

            if (err)
                return reject(err);

            resolve();
        }
    );

});


}

// Set coins
function setCoins(userId, amount) {
return new Promise((resolve, reject) => {


    db.run(
        'UPDATE users SET coins = ? WHERE id = ?',
        [amount, userId],
        function(err) {

            if (err)
                return reject(err);

            resolve();
        }
    );

});


}

// Get balance only
async function getBalance(userId) {

    const user = await getOrCreateUser(userId);

    return user.coins;

}

// Get xp only
async function getXP(userId) {

    const user = await getOrCreateUser(userId);

    return user.xp;
}


// add xp
function addXP(userId, amount) {
    return new Promise((resolve, reject) => {

        db.run(
            'UPDATE users SET xp = xp + ? WHERE id = ?',
            [amount, userId],
            function(err) {

                if (err)
                    return reject(err);

                resolve();
            }
        );

    });
}

// Get performance
async function getPerformance(userId) {

    const user = await getOrCreateUser(userId);

    return user.performance;
}

// Get stamina
async function getStamina(userId) {

    const user = await getOrCreateUser(userId);

    return user.stamina;
}

// Get fame
async function getFame(userId) {

    const user = await getOrCreateUser(userId);

    return user.fame;
}

// Set performance
function setPerformance(userId, amount) {
    return new Promise((resolve, reject) => {

        db.run(
            'UPDATE users SET performance = ? WHERE id = ?',
            [amount, userId],
            function(err) {

                if (err)
                    return reject(err);

                resolve();
            }
        );

    });
}

// Set stamina
function setStamina(userId, amount) {
    return new Promise((resolve, reject) => {

        db.run(
            'UPDATE users SET stamina = ? WHERE id = ?',
            [amount, userId],
            function(err) {

                if (err)
                    return reject(err);

                resolve();
            }
        );

    });
}

// Set fame
function setFame(userId, amount) {
    return new Promise((resolve, reject) => {

        db.run(
            'UPDATE users SET fame = ? WHERE id = ?',
            [amount, userId],
            function(err) {

                if (err)
                    return reject(err);

                resolve();
            }
        );

    });
}

async function getRanking(userId) {

    const user = await getOrCreateUser(userId);

    return user.ranking;
}

async function getScenesCompleted(userId) {

    const user = await getOrCreateUser(userId);

    return user.scenes_completed;
}


function addRanking(userId, amount) {
    return new Promise((resolve, reject) => {

        db.run(
            'UPDATE users SET ranking = ranking + ? WHERE id = ?',
            [amount, userId],
            err => err ? reject(err) : resolve()
        );

    });
}

function addScene(userId) {
    return new Promise((resolve, reject) => {

        db.run(
            'UPDATE users SET scenes_completed = scenes_completed + 1 WHERE id = ?',
            [userId],
            err => err ? reject(err) : resolve()
        );

    });
}

async function addSpankGiven(userId) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE users
            SET spanks_given = spanks_given + 1
            WHERE id = ?
            `,
            [userId],
            err => {

                if (err)
                    reject(err);
                else
                    resolve();

            }
        );

    });

}

async function addSpankTaken(userId) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE users
            SET spanks_taken = spanks_taken + 1
            WHERE id = ?
            `,
            [userId],
            err => {

                if (err)
                    reject(err);
                else
                    resolve();

            }
        );

    });

}

async function addKissGiven(userId) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE users
            SET kisses_given = kisses_given + 1
            WHERE id = ?
            `,
            [userId],
            err => {

                if (err)
                    reject(err);
                else
                    resolve();

            }
        );

    });

}

async function addKissTaken(userId) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE users
            SET kisses_taken = kisses_taken + 1
            WHERE id = ?
            `,
            [userId],
            err => {

                if (err)
                    reject(err);
                else
                    resolve();

            }
        );

    });

}

module.exports = {
    getUser,
    createUser,
    getOrCreateUser,

    getBalance,
    addCoins,
    removeCoins,
    setCoins,

    getXP,
    addXP,

    getPerformance,
    getStamina,
    getFame,

    setPerformance,
    setStamina,
    setFame,

    getRanking,
    getScenesCompleted,

    addRanking,
    addScene,
    
    addSpankGiven,
    addSpankTaken,

    addKissGiven,
    addKissTaken
};
