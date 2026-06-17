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

function addGifToFile(
    filePath,
    url
) {

    const gifs =
        JSON.parse(
            fs.readFileSync(
                filePath,
                'utf8'
            )
        );

    if (
        gifs.includes(url)
    )
        return false;

    gifs.push(url);

    fs.writeFileSync(
        filePath,
        JSON.stringify(
            gifs,
            null,
            4
        )
    );

    return true;

}

module.exports = {
    getRandomGif,
    addGifToFile,
    getGifList
};