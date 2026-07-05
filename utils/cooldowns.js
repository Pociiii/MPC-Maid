const cooldowns =
    new Map();

const {
    cooldownFlavor,
    pickOne
} = require('./flavorText');

function checkCooldown(
    userId,
    command,
    seconds
) {

    const key =
        `${userId}-${command}`;

    const now =
        Date.now();

    const expiresAt =
        cooldowns.get(
            key
        );

    if (
        expiresAt &&
        now < expiresAt
    )
        return Math.ceil(
            (expiresAt - now) / 1000
        );

    cooldowns.set(
        key,
        now + seconds * 1000
    );

    return 0;

}

function getCooldownRemaining(
    userId,
    command
) {

    const key =
        `${userId}-${command}`;

    const now =
        Date.now();

    const expiresAt =
        cooldowns.get(
            key
        );

    if (
        expiresAt &&
        now < expiresAt
    )
        return Math.ceil(
            (expiresAt - now) / 1000
        );

    return 0;

}

function startCooldown(
    userId,
    command,
    seconds
) {

    cooldowns.set(
        `${userId}-${command}`,
        Date.now() + seconds * 1000
    );

}

function formatCooldownTimestamp(
    remaining
) {

    const unlockAt =
        Math.floor(
            (Date.now() + remaining * 1000) / 1000
        );

    return `<t:${unlockAt}:R>`;

}

async function handleCooldown(
    interaction,
    command,
    seconds
) {

    const remaining =
        checkCooldown(
            interaction.user.id,
            command,
            seconds
        );

    if (
        remaining <= 0
    )
        return false;

    const minutes =
        Math.floor(
            remaining / 60
        );

    const secs =
        remaining % 60;

    await interaction.reply({
        content:
            `\u23F3 /${command} is still on cooldown. ${pickOne(
                cooldownFlavor
            )} Try again ${formatCooldownTimestamp(
                remaining
            )}. (${minutes}m ${secs}s)`,
        flags:
            64
    });

    return true;

}

module.exports = {
    checkCooldown,
    formatCooldownTimestamp,
    getCooldownRemaining,
    startCooldown,
    handleCooldown
};
