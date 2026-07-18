const fs =
    require('fs');

const path =
    require('path');

const {
    getRuntimeDataPath
} = require('./runtimeData');

const cooldownsPath =
    getRuntimeDataPath(
        'command-cooldowns.json'
    );

function loadCooldowns() {

    try {

        const stored =
            JSON.parse(
                fs.readFileSync(
                    cooldownsPath,
                    'utf8'
                )
            );

        const now =
            Date.now();

        return new Map(
            (Array.isArray(
                stored
            )
                ? stored
                : []
            ).filter(
                (entry) =>
                    Array.isArray(
                        entry
                    ) &&
                    typeof entry[0] === 'string' &&
                    Number.isFinite(
                        entry[1]
                    ) &&
                    entry[1] > now
            )
        );

    }
    catch (error) {

        if (
            error.code !== 'ENOENT'
        )
            console.error(
                'COMMAND COOLDOWN RESTORE ERROR',
                error
            );

        return new Map();

    }

}

const cooldowns =
    loadCooldowns();

function persistCooldowns() {

    fs.mkdirSync(
        path.dirname(
            cooldownsPath
        ),
        {
            recursive:
                true
        }
    );

    fs.writeFileSync(
        cooldownsPath,
        JSON.stringify(
            Array.from(
                cooldowns.entries()
            ),
            null,
            2
        )
    );

}

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

    persistCooldowns();

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

    if (
        expiresAt
    ) {

        cooldowns.delete(
            key
        );

        persistCooldowns();

    }

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

    persistCooldowns();

}

function clearCooldown(
    userId,
    command
) {

    const removed =
        cooldowns.delete(
            `${userId}-${command}`
        );

    if (
        removed
    )
        persistCooldowns();

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

    const payload = {
        content:
            `\u23F3 /${command} is still on cooldown. ${pickOne(
                cooldownFlavor
            )} Try again ${formatCooldownTimestamp(
                remaining
            )}. (${minutes}m ${secs}s)`,
        flags:
            64
    };

    if (
        interaction.replied
    )
        await interaction.followUp(
            payload
        );
    else if (
        interaction.deferred
    )
        await interaction.editReply(
            payload
        );
    else
        await interaction.reply(
            payload
        );

    return true;

}

module.exports = {
    checkCooldown,
    clearCooldown,
    formatCooldownTimestamp,
    getCooldownRemaining,
    startCooldown,
    handleCooldown
};
