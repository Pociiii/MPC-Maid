const sceneNames =
    require('../data/sceneNames.json');

function getRandomSceneName() {

    return sceneNames[
        Math.floor(
            Math.random() *
            sceneNames.length
        )
    ];

}

module.exports = {
    getRandomSceneName
};