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

function getJsonFiles(
    folder
) {

    if (
        !fs.existsSync(
            folder
        )
    )
        return [];

    return fs.readdirSync(
        folder,
        {
            withFileTypes: true
        }
    )
        .flatMap(
            (entry) => {

                const entryPath =
                    path.join(
                        folder,
                        entry.name
                    );

                if (
                    entry.isDirectory()
                )
                    return getJsonFiles(
                        entryPath
                    );

                if (
                    entry.isFile() &&
                    entry.name.endsWith(
                        '.json'
                    )
                )
                    return [
                        entryPath
                    ];

                return [];

            }
        );

}

function findGifInData(
    url
) {

    const dataFolder =
        path.join(
            __dirname,
            '..',
            'data'
        );

    for (
        const filePath of getJsonFiles(
            dataFolder
        )
    ) {

        try {

            const gifs =
                JSON.parse(
                    fs.readFileSync(
                        filePath,
                        'utf8'
                    )
                );

            if (
                Array.isArray(
                    gifs
                ) &&
                gifs.includes(
                    url
                )
            )
                return filePath;

        }
        catch {
            // Ignore JSON files that are not GIF lists.
        }

    }

    return null;

}

function getGifCount(
    filePath
) {

    try {

        const gifs =
            JSON.parse(
                fs.readFileSync(
                    filePath,
                    'utf8'
                )
            );

        return gifs.length;

    } catch {

        return 0;

    }

}
module.exports = {
    getRandomGif,
    addGifToFile,
    getGifList,
    getGifCount,
    findGifInData
};
