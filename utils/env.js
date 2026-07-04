const requiredEnv = [
    'TOKEN',
    'CLIENT_ID',
    'GUILD_ID'
];

const path =
    require('path');

function isPlaceholder(
    value
) {

    return !value ||
        value.startsWith(
            'PASTE_'
        ) ||
        value.startsWith(
            'YOUR_'
        );

}

function validateEnv() {

    const missing =
        requiredEnv.filter(
            (key) =>
                isPlaceholder(
                    process.env[key]
                )
        );

    if (
        missing.length
    ) {

        throw new Error(
            `Missing or placeholder environment values: ${missing.join(
                ', '
            )}`
        );

    }

    if (
        process.env.MPC_DATA_DIR?.trim() &&
        !path.isAbsolute(
            process.env.MPC_DATA_DIR.trim()
        )
    )
        throw new Error(
            'MPC_DATA_DIR must be an absolute path.'
        );

}

module.exports = {
    validateEnv
};
