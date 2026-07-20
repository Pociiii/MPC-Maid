#!/usr/bin/env node

const assert =
    require('node:assert/strict');

const fs =
    require('node:fs');

const os =
    require('node:os');

const path =
    require('node:path');

const testDirectory =
    fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            'mpc-social-interaction-'
        )
    );

process.env.MPC_DATA_DIR =
    testDirectory;

const cooldownModulePath =
    require.resolve(
        '../utils/socialInteractionCooldown'
    );

function reloadCooldown() {

    delete require.cache[
        cooldownModulePath
    ];

    return require(
        '../utils/socialInteractionCooldown'
    );

}

let cooldown =
    reloadCooldown();

assert.equal(
    cooldown.reserveSocialInteraction(
        'fast-clicker'
    ).allowed,
    true
);

assert.equal(
    cooldown.reserveSocialInteraction(
        'fast-clicker'
    ).reason,
    'processing',
    'Concurrent interaction clicks should be rejected.'
);

cooldown.recordSuccessfulSocialInteraction(
    'fast-clicker'
);

assert.equal(
    cooldown.reserveSocialInteraction(
        'fast-clicker'
    ).reason,
    'cooldown',
    'A successful interaction should start the shared cooldown.'
);

assert.equal(
    cooldown.reserveSocialInteraction(
        'another-user'
    ).allowed,
    true,
    'Other users should remain eligible.'
);

cooldown.releaseSocialInteractionReservation(
    'another-user'
);

cooldown =
    reloadCooldown();

assert.equal(
    cooldown.reserveSocialInteraction(
        'fast-clicker'
    ).reason,
    'cooldown',
    'The cooldown should survive a restart.'
);

fs.writeFileSync(
    path.join(
        testDirectory,
        'social-interaction-cooldowns.json'
    ),
    JSON.stringify([
        [
            'fast-clicker',
            Date.now() - 1000
        ]
    ])
);

cooldown =
    reloadCooldown();

assert.equal(
    cooldown.reserveSocialInteraction(
        'fast-clicker'
    ).allowed,
    true,
    'Expired cooldowns should not block an interaction.'
);

console.log(
    'Social interaction cooldown tests passed.'
);
