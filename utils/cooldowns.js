const cooldowns = new Map();

function checkCooldown(userId, command, seconds) {

    const key = `${userId}-${command}`;

    const now = Date.now();

    const expiresAt = cooldowns.get(key);

    if (expiresAt && now < expiresAt) {

        return Math.ceil(
            (expiresAt - now) / 1000
        );

    }

    cooldowns.set(
        key,
        now + (seconds * 1000)
    );

    return 0;
}

module.exports = {
    checkCooldown
};