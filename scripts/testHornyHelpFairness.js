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
            'mpc-horny-help-'
        )
    );

process.env.MPC_DATA_DIR =
    testDirectory;

const fairnessModulePath =
    require.resolve(
        '../utils/hornyHelpFairness'
    );

function reloadFairness() {

    delete require.cache[
        fairnessModulePath
    ];

    return require(
        '../utils/hornyHelpFairness'
    );

}

let fairness =
    reloadFairness();

assert.equal(
    fairness.reserveHornyHelp(
        'camper'
    ).allowed,
    true
);

assert.equal(
    fairness.reserveHornyHelp(
        'camper'
    ).allowed,
    false,
    'Concurrent clicks from the same helper should be rejected.'
);

fairness.recordSuccessfulHornyHelp(
    'camper'
);

assert.equal(
    fairness.reserveHornyHelp(
        'camper'
    ).allowed,
    false,
    'The last successful helper should not help twice consecutively.'
);

assert.equal(
    fairness.reserveHornyHelp(
        'another-helper'
    ).allowed,
    true,
    'A different helper should still be allowed.'
);

fairness.recordSuccessfulHornyHelp(
    'another-helper'
);

assert.equal(
    fairness.reserveHornyHelp(
        'camper'
    ).allowed,
    true,
    'The previous helper should be eligible after somebody else helps.'
);

fairness.releaseHornyHelpReservation(
    'camper'
);

fairness =
    reloadFairness();

assert.equal(
    fairness.reserveHornyHelp(
        'another-helper'
    ).allowed,
    false,
    'The last-helper restriction should survive a restart.'
);

const expiredStatePath =
    path.join(
        testDirectory,
        'horny-help-fairness.json'
    );

fs.writeFileSync(
    expiredStatePath,
    JSON.stringify({
        helperId:
            'another-helper',
        expiresAt:
            Date.now() - 1000
    })
);

fairness =
    reloadFairness();

assert.equal(
    fairness.reserveHornyHelp(
        'another-helper'
    ).allowed,
    true,
    'The restriction should expire after the fairness window.'
);

console.log(
    'Horny help fairness tests passed.'
);
