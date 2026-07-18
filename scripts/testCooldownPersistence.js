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
            'mpc-cooldowns-'
        )
    );

process.env.MPC_DATA_DIR =
    testDirectory;

const cooldownModulePath =
    require.resolve(
        '../utils/cooldowns'
    );

function reloadCooldowns() {

    delete require.cache[
        cooldownModulePath
    ];

    return require(
        '../utils/cooldowns'
    );

}

let cooldowns =
    reloadCooldowns();

cooldowns.startCooldown(
    'restart-user',
    'horny',
    60
);

assert.ok(
    cooldowns.getCooldownRemaining(
        'restart-user',
        'horny'
    ) > 0,
    'A newly started cooldown should be active.'
);

cooldowns =
    reloadCooldowns();

assert.ok(
    cooldowns.getCooldownRemaining(
        'restart-user',
        'horny'
    ) > 0,
    'An active cooldown should survive a module reload.'
);

cooldowns.clearCooldown(
    'restart-user',
    'horny'
);

cooldowns =
    reloadCooldowns();

assert.equal(
    cooldowns.getCooldownRemaining(
        'restart-user',
        'horny'
    ),
    0,
    'A cleared cooldown must stay cleared after a module reload.'
);

fs.writeFileSync(
    path.join(
        testDirectory,
        'command-cooldowns.json'
    ),
    JSON.stringify([
        [
            'expired-user-drop',
            Date.now() - 1000
        ]
    ])
);

cooldowns =
    reloadCooldowns();

assert.equal(
    cooldowns.getCooldownRemaining(
        'expired-user',
        'drop'
    ),
    0,
    'Expired cooldowns should not be restored.'
);

console.log(
    'Command cooldown persistence tests passed.'
);
