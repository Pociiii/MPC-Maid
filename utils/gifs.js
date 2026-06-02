const fs = require('fs');
const path = require('path');

function getGifFilePath(category) {

    return path.join(
        __dirname,
        '..',
        'data',
        'gifs',
        `${category}.json`
    );

}

function getGifList(category) {

    const filePath =
        getGifFilePath(category);

    return JSON.parse(
        fs.readFileSync(
            filePath,
            'utf8'
        )
    );

}

function getRandomGif(category) {

    const gifs =
        getGifList(category);

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

function addGif(category, url) {

    const filePath =
        getGifFilePath(category);

    const gifs = JSON.parse(
        fs.readFileSync(
            filePath,
            'utf8'
        )
    );

    gifs.push(url);

    fs.writeFileSync(
        filePath,
        JSON.stringify(
            gifs,
            null,
            4
        )
    );

}

module.exports = {
    getRandomGif,
    addGif,
    getGifList
};