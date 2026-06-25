const fs = require('fs');
const path = require('path');

const recentHistorySize =
    30;

const recentHistoryCategoryRatio =
    0.7;

const shuffleBags =
    new Map();

const userGifHistory =
    new Map();

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

function shuffle(
    items
) {

    const shuffled =
        [...items];

    for (
        let index = shuffled.length - 1;
        index > 0;
        index -= 1
    ) {

        const swapIndex =
            Math.floor(
                Math.random() * (index + 1)
            );

        [
            shuffled[index],
            shuffled[swapIndex]
        ] =
            [
                shuffled[swapIndex],
                shuffled[index]
            ];

    }

    return shuffled;

}

function normalizeUserIds(
    userIds
) {

    if (
        !userIds
    )
        return [];

    const ids =
        Array.isArray(
            userIds
        )
            ? userIds
            : [
                userIds
            ];

    return [
        ...new Set(
            ids
                .filter(
                    Boolean
                )
                .map(
                    String
                )
        )
    ];

}

function getRecentSet(
    userIds,
    limit = recentHistorySize
) {

    const recent =
        new Set();

    if (
        limit <= 0
    )
        return recent;

    for (
        const userId of normalizeUserIds(
            userIds
        )
    ) {

        for (
            const url of (
                userGifHistory.get(
                    userId
                ) ?? []
            ).slice(
                0,
                limit
            )
        )
            recent.add(
                url
            );

    }

    return recent;

}

function getEffectiveRecentHistorySize(
    total
) {

    if (
        total <= 1
    )
        return 0;

    return Math.min(
        recentHistorySize,
        Math.max(
            1,
            Math.floor(
                total * recentHistoryCategoryRatio
            )
        )
    );

}

function rememberGifForUsers(
    userIds,
    url
) {

    for (
        const userId of normalizeUserIds(
            userIds
        )
    ) {

        const history =
            userGifHistory.get(
                userId
            ) ?? [];

        const nextHistory = [
            url,
            ...history.filter(
                (seenUrl) =>
                    seenUrl !== url
            )
        ].slice(
            0,
            recentHistorySize
        );

        userGifHistory.set(
            userId,
            nextHistory
        );

    }

}

function buildBag(
    total
) {

    return shuffle(
        Array.from(
            {
                length:
                    total
            },
            (_, index) =>
                index
        )
    );

}

function getBag(
    bagKey,
    total
) {

    const existing =
        shuffleBags.get(
            bagKey
        );

    if (
        existing &&
        existing.total === total &&
        existing.indices.length > 0
    )
        return existing;

    const nextBag = {
        indices:
            buildBag(
                total
            ),
        total
    };

    shuffleBags.set(
        bagKey,
        nextBag
    );

    return nextBag;

}

function pickFromBag(
    bag,
    gifs,
    userIds
) {

    const recent =
        getRecentSet(
            userIds,
            getEffectiveRecentHistorySize(
                gifs.length
            )
        );

    const preferredIndex =
        bag.indices.findIndex(
            (gifIndex) =>
                !recent.has(
                    gifs[gifIndex]
                )
        );

    const bagIndex =
        preferredIndex >= 0
            ? preferredIndex
            : 0;

    const [
        gifIndex
    ] =
        bag.indices.splice(
            bagIndex,
            1
        );

    const url =
        gifs[gifIndex];

    rememberGifForUsers(
        userIds,
        url
    );

    return {
        url,
        index:
            gifIndex + 1,
        total:
            gifs.length
    };

}

function getSmartGifFromList(
    bagKey,
    gifs,
    userIds = []
) {

    if (
        gifs.length === 0
    )
        return {
            url:
                null,
            index:
                0,
            total:
                0
        };

    const bag =
        getBag(
            bagKey,
            gifs.length
        );

    return pickFromBag(
        bag,
        gifs,
        userIds
    );

}

function getSmartGifFromFile(
    filePath,
    userIds = []
) {

    const gifs =
        JSON.parse(
            fs.readFileSync(
                filePath,
                'utf8'
            )
        );

    return getSmartGifFromList(
        filePath,
        gifs,
        userIds
    );

}

function getRandomGif(
    category,
    userIds = []
) {

    const gifs =
        getGifList(category);

    return getSmartGifFromList(
        category,
        gifs,
        userIds
    );

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
    getSmartGifFromList,
    getSmartGifFromFile,
    addGifToFile,
    getGifList,
    getGifCount,
    findGifInData
};
