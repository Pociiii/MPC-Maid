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

module.exports = {
    addHornyHelp,
    addKissGiven,
    addKissTaken,
    addSpankGiven,
    addSpankTaken
};
