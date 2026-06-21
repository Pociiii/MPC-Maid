const requiredEnv = [
    'TOKEN',
    'CLIENT_ID',
    'GUILD_ID'
];

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

}

module.exports = {
    validateEnv
};
