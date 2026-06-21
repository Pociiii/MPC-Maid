const fs =
    require('fs');

const path =
    require('path');

const versionPath =
    path.join(
        __dirname,
        '..',
        'VERSION.txt'
    );

function getVersion() {

    return fs.readFileSync(
        versionPath,
        'utf8'
    )
        .trim();

}

function commandFooter(
    command,
    detail = null
) {

    return [
        command,
        detail,
        `v${getVersion()}`
    ]
        .filter(Boolean)
        .join(' • ');

}

module.exports = {
    commandFooter,
    getVersion
};
