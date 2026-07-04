const fs =
    require('fs');

const path =
    require('path');

const repoRoot =
    path.join(
        __dirname,
        '..'
    );

const seedDataDir =
    path.join(
        repoRoot,
        'data'
    );

const defaultRuntimeDataDir =
    path.join(
        repoRoot,
        'runtime-data'
    );

const runtimeFolders = [
    'gifs',
    'scenes',
    'scenes_mfm',
    'scenes_fmf',
    'scenes_fff'
];

function getRuntimeDataDir() {

    const configuredDir =
        process.env.MPC_DATA_DIR?.trim();

    if (
        configuredDir
    )
        return path.resolve(
            configuredDir
        );

    return defaultRuntimeDataDir;

}

function getRuntimeDataPath(
    ...parts
) {

    return path.join(
        getRuntimeDataDir(),
        ...parts
    );

}

function getSeedDataPath(
    ...parts
) {

    return path.join(
        seedDataDir,
        ...parts
    );

}

function copyMissingFiles(
    source,
    destination
) {

    if (
        !fs.existsSync(
            source
        )
    )
        return;

    const stats =
        fs.statSync(
            source
        );

    if (
        stats.isDirectory()
    ) {

        fs.mkdirSync(
            destination,
            {
                recursive:
                    true
            }
        );

        for (
            const entry of fs.readdirSync(
                source
            )
        )
            copyMissingFiles(
                path.join(
                    source,
                    entry
                ),
                path.join(
                    destination,
                    entry
                )
            );

        return;

    }

    if (
        fs.existsSync(
            destination
        )
    )
        return;

    fs.mkdirSync(
        path.dirname(
            destination
        ),
        {
            recursive:
                true
        }
    );

    fs.copyFileSync(
        source,
        destination
    );

}

function ensureRuntimeData() {

    const runtimeDataDir =
        getRuntimeDataDir();

    fs.mkdirSync(
        runtimeDataDir,
        {
            recursive:
                true
        }
    );

    for (
        const folder of runtimeFolders
    ) {

        const destination =
            path.join(
                runtimeDataDir,
                folder
            );

        fs.mkdirSync(
            destination,
            {
                recursive:
                    true
            }
        );

        copyMissingFiles(
            path.join(
                seedDataDir,
                folder
            ),
            destination
        );

    }

    return runtimeDataDir;

}

module.exports = {
    defaultRuntimeDataDir,
    ensureRuntimeData,
    getRuntimeDataDir,
    getRuntimeDataPath,
    getSeedDataPath,
    runtimeFolders,
    seedDataDir
};
