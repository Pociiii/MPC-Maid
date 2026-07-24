#!/usr/bin/env node

const assert =
    require('node:assert/strict');

const fs =
    require('node:fs');

const os =
    require('node:os');

const path =
    require('node:path');

const originalDirectory =
    process.cwd();

const testDirectory =
    fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            'mpc-pregnancy-'
        )
    );

process.chdir(
    testDirectory
);

const db =
    require('../database/database');

const {
    addDailyPartner,
    getActivePregnancy,
    getPregnancyMilestones,
    getPregnancyStatus,
    processPregnancyChecks
} = require('../database/pregnancy');

const {
    buildPregnancyAnnouncementPayload
} = require('../features/pregnancy/pregnancyAnnouncements');

const carrierId =
    '100000000000000001';

const fatherId =
    '100000000000000002';

const checkDate =
    '2026-07-23';

const originalRandom =
    Math.random;

function closeDatabase() {

    return new Promise(
        (resolve, reject) =>
            db.close(
                (error) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve()
            )
    );

}

async function run() {

    await db.ready;

    Math.random =
        () => 0;

    const accepted =
        await addDailyPartner(
            carrierId,
            fatherId,
            checkDate
        );

    assert.equal(
        accepted.added,
        true,
        'An accepted breed request should add the partner to the daily roll.'
    );

    const duplicate =
        await addDailyPartner(
            carrierId,
            fatherId,
            checkDate
        );

    assert.equal(
        duplicate.added,
        false,
        'The same partner should only be recorded once per pregnancy day.'
    );

    const results =
        await processPregnancyChecks(
            checkDate
        );

    assert.equal(
        results.length,
        1
    );
    assert.equal(
        results[0].success,
        true,
        'A deterministic successful roll should create a pregnancy.'
    );
    assert.equal(
        results[0].pregnancy.carrier_id,
        carrierId
    );
    assert.equal(
        results[0].pregnancy.father_id,
        fatherId
    );

    const pregnancy =
        await getActivePregnancy(
            carrierId
        );

    const startedAt =
        new Date(
            pregnancy.started_at
        );

    assert.equal(
        new Date(
            pregnancy.due_at
        ).getTime() - startedAt.getTime(),
        29 * 24 * 60 * 60 * 1000,
        'The stored due date should match the start of Day 30.'
    );

    const announcement =
        buildPregnancyAnnouncementPayload(
            pregnancy,
            {
                title:
                    'Test Embed'
            }
        );

    assert.equal(
        announcement.content,
        `<@${carrierId}> <@${fatherId}>`
    );
    assert.deepEqual(
        announcement.allowedMentions,
        {
            users: [
                carrierId,
                fatherId
            ]
        },
        'Pregnancy posts should ping both participants above the embed.'
    );

    const revealMilestones =
        await getPregnancyMilestones(
            new Date(
                startedAt.getTime() +
                6 * 24 * 60 * 60 * 1000
            )
        );

    assert.equal(
        revealMilestones.reveals.length,
        1,
        'The gender reveal should be emitted on Day 7.'
    );
    assert.equal(
        revealMilestones.births.length,
        0
    );

    const birthMilestones =
        await getPregnancyMilestones(
            new Date(
                startedAt.getTime() +
                29 * 24 * 60 * 60 * 1000
            )
        );

    assert.equal(
        birthMilestones.reveals.length,
        0
    );
    assert.equal(
        birthMilestones.births.length,
        1,
        'The birth should be emitted on Day 30.'
    );

    const completedStatus =
        await getPregnancyStatus(
            carrierId
        );

    assert.equal(
        completedStatus.activePregnancy,
        undefined
    );
    assert.equal(
        completedStatus.children,
        1,
        'A completed birth should update the carrier child count.'
    );

    const repeatedCheck =
        await processPregnancyChecks(
            checkDate
        );

    assert.equal(
        repeatedCheck.length,
        0,
        'A pregnancy roll should not be processed twice for the same date.'
    );

}

run()
    .then(
        async () => {

            Math.random =
                originalRandom;

            await closeDatabase();

            process.chdir(
                originalDirectory
            );

            fs.rmSync(
                testDirectory,
                {
                    recursive:
                        true,
                    force:
                        true
                }
            );

            console.log(
                'Pregnancy system tests passed.'
            );

        }
    )
    .catch(
        async (error) => {

            Math.random =
                originalRandom;

            await closeDatabase()
                .catch(
                    () => {}
                );

            process.chdir(
                originalDirectory
            );

            fs.rmSync(
                testDirectory,
                {
                    recursive:
                        true,
                    force:
                        true
                }
            );

            console.error(
                error
            );
            process.exitCode =
                1;

        }
    );
