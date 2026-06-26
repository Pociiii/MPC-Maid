const {
    runUserUpdate
} = require('./db');

function incrementColumn(
    userId,
    column
) {

    return runUserUpdate(
        `UPDATE users SET ${column} = ${column} + 1 WHERE id = ?`,
        [
            userId
        ]
    );

}

function addSpankGiven(
    userId
) {

    return incrementColumn(
        userId,
        'spanks_given'
    );

}

function addSpankTaken(
    userId
) {

    return incrementColumn(
        userId,
        'spanks_taken'
    );

}

function addKissGiven(
    userId
) {

    return incrementColumn(
        userId,
        'kisses_given'
    );

}

function addKissTaken(
    userId
) {

    return incrementColumn(
        userId,
        'kisses_taken'
    );

}

function addHornyHelp(
    userId
) {

    return incrementColumn(
        userId,
        'horny_helps'
    );

}

function addHornyHelped(
    userId
) {

    return incrementColumn(
        userId,
        'horny_helped'
    );

}

function addBrofistGiven(
    userId
) {

    return incrementColumn(
        userId,
        'brofists_given'
    );

}

function addBrofistTaken(
    userId
) {

    return incrementColumn(
        userId,
        'brofists_taken'
    );

}

module.exports = {
    addBrofistGiven,
    addBrofistTaken,
    addHornyHelp,
    addHornyHelped,
    addKissGiven,
    addKissTaken,
    addSpankGiven,
    addSpankTaken
};
