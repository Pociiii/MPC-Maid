const db = require('../database/database');

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
        'INSERT INTO users (id, coins) VALUES (?, ?)',
        [userId, 0],
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

if (!user) {

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

module.exports = {
getUser,
createUser,
getOrCreateUser,
addCoins,
removeCoins,
setCoins,
getBalance
};
