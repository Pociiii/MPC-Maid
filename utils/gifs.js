const path = require('path');

function getRandomGif(category) {

    const gifs = require(
        path.join(
            '..',
            'data',
            'gifs',
            `${category}.json`
        )
    );

    const index =
        Math.floor(
            Math.random() * gifs.length
        );

    return {
        url: gifs[index],
        index: index + 1,
        total: gifs.length
    };
}

module.exports = {
    getRandomGif
};