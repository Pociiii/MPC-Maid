const fs =
    require('fs');

const path =
    require('path');

const {
    getRuntimeDataPath
} = require('./runtimeData');

const cooldownMs =
    5 * 60 * 1000;

const reservationMs =
    60 * 1000;

const statePath =
    getRuntimeDataPath(
        'social-interaction-cooldowns.json'
    );

function loadCooldowns() {

    try {

        const stored =
            JSON.parse(
                fs.readFileSync(
                    statePath,
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
                'SOCIAL INTERACTION COOLDOWN RESTORE ERROR',
                error
            );

        return new Map();

    }

}

const cooldowns =
    loadCooldowns();

const reservations =
    new Map();

function persistCooldowns() {

    fs.mkdirSync(
        path.dirname(
            statePath
        ),
        {
            recursive:
                true
        }
    );

    fs.writeFileSync(
        statePath,
        JSON.stringify(
            Array.from(
                cooldowns.entries()
            ),
            null,
            2
        )
    );

}

function reserveSocialInteraction(
    userId
) {

    const now =
        Date.now();

    const reservationExpiresAt =
        reservations.get(
            userId
        );

    if (
        reservationExpiresAt > now
    )
        return {
            allowed:
                false,
            reason:
                'processing',
            expiresAt:
                reservationExpiresAt
        };

    reservations.delete(
        userId
    );

    const expiresAt =
        cooldowns.get(
            userId
        );

    if (
        expiresAt > now
    )
        return {
            allowed:
                false,
            reason:
                'cooldown',
            expiresAt
        };

    if (
        expiresAt
    ) {

        cooldowns.delete(
            userId
        );

        persistCooldowns();

    }

    reservations.set(
        userId,
        now + reservationMs
    );

    return {
        allowed:
            true
    };

}

function releaseSocialInteractionReservation(
    userId
) {

    reservations.delete(
        userId
    );

}

function recordSuccessfulSocialInteraction(
    userId
) {

    cooldowns.set(
        userId,
        Date.now() + cooldownMs
    );

    releaseSocialInteractionReservation(
        userId
    );

    persistCooldowns();

}

function getCooldownMessage(
    reservation
) {

    if (
        reservation.reason === 'processing'
    )
        return 'Your previous interaction click is still being processed.';

    return `You recently used a Help, Spank, or Kiss button. Try again <t:${Math.floor(reservation.expiresAt / 1000)}:R>.`;

}

module.exports = {
    cooldownMs,
    getCooldownMessage,
    recordSuccessfulSocialInteraction,
    releaseSocialInteractionReservation,
    reserveSocialInteraction
};
