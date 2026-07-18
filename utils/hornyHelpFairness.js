const fs =
    require('fs');

const path =
    require('path');

const {
    getRuntimeDataPath
} = require('./runtimeData');

const restrictionMs =
    30 * 60 * 1000;

const reservationMs =
    60 * 1000;

const statePath =
    getRuntimeDataPath(
        'horny-help-fairness.json'
    );

function loadState() {

    try {

        const stored =
            JSON.parse(
                fs.readFileSync(
                    statePath,
                    'utf8'
                )
            );

        if (
            typeof stored?.helperId === 'string' &&
            Number.isFinite(
                stored.expiresAt
            )
        )
            return stored;

    }
    catch (error) {

        if (
            error.code !== 'ENOENT'
        )
            console.error(
                'HORNY HELP FAIRNESS RESTORE ERROR',
                error
            );

    }

    return null;

}

let lastSuccessfulHelp =
    loadState();

const reservations =
    new Map();

function persistState() {

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
            lastSuccessfulHelp,
            null,
            2
        )
    );

}

function reserveHornyHelp(
    helperId
) {

    const now =
        Date.now();

    const reservationExpiresAt =
        reservations.get(
            helperId
        );

    if (
        reservationExpiresAt &&
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
        helperId
    );

    if (
        lastSuccessfulHelp?.expiresAt <= now
    )
        lastSuccessfulHelp = null;

    if (
        lastSuccessfulHelp?.helperId === helperId
    )
        return {
            allowed:
                false,
            reason:
                'consecutive',
            expiresAt:
                lastSuccessfulHelp.expiresAt
        };

    reservations.set(
        helperId,
        now + reservationMs
    );

    return {
        allowed:
            true
    };

}

function releaseHornyHelpReservation(
    helperId
) {

    reservations.delete(
        helperId
    );

}

function recordSuccessfulHornyHelp(
    helperId
) {

    lastSuccessfulHelp = {
        helperId,
        expiresAt:
            Date.now() + restrictionMs
    };

    releaseHornyHelpReservation(
        helperId
    );

    persistState();

}

module.exports = {
    recordSuccessfulHornyHelp,
    releaseHornyHelpReservation,
    reserveHornyHelp,
    restrictionMs
};
