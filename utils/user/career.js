const {
    runUserUpdate
} = require('./db');

function addScene(
    userId
) {

    return runUserUpdate(
        'UPDATE users SET scenes_completed = scenes_completed + 1 WHERE id = ?',
        [
            userId
        ]
    );

}

module.exports = {
    addScene
};
