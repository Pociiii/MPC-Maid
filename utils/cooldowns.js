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

    if (remaining <= 0)
        return false;

    const minutes =
        Math.floor(
            remaining / 60
        );

    const secs =
        remaining % 60;

    await interaction.reply({
        content:
            `⏳ You must wait ${minutes}m ${secs}s before using /${command} again.`,
        flags: 64
    });

    return true;
}

module.exports = {
    checkCooldown,
    handleCooldown
};