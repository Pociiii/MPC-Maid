const path = require('path');

function getRandomSceneGif(
    category,
    phase
) {

    const gifs = require(
        path.join(
            '..',
            'data',
            'scenes',
            category,
            `${phase}.json`
        )
    );

    return gifs[
        Math.floor(
            Math.random() * gifs.length
        )
    ];
}

module.exports = {
    getRandomSceneGif
};