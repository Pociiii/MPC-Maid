const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const originalDirectory = process.cwd();
const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'mpc-maid-studios-')
);

process.chdir(temporaryDirectory);

const db = require('../database/database');

const {
    attachSceneToOpenStudio,
    beginStudioPurchase,
    completeStudioScene,
    finishStudioPurchase,
    getStudioStaffByOwner,
    getStudioByOwner,
    getStudioScene,
    hasActiveStudioNpc,
    hireStudioNpc,
    markMirrorPosted,
    processStudioStaffUpkeep,
    processStudioUpkeep,
    queueMirror,
    reactivateStudioNpc,
    reopenStudio
} = require('../database/studios');

function run(sql, params = []) {
    return new Promise((resolve, reject) =>
        db.run(sql, params, function onRun(error) {
            error ? reject(error) : resolve({ changes: this.changes });
        })
    );
}

function closeDatabase() {
    return new Promise((resolve, reject) =>
        db.close((error) => error ? reject(error) : resolve())
    );
}

(async () => {
    await db.ready;

    await run(
        `INSERT INTO users (id, coins) VALUES ('owner', 12000)`
    );

    const purchase = await beginStudioPurchase(
        'owner',
        10000,
        '2026-07-29',
        'Owner'
    );
    assert.equal(purchase.ok, true);

    const duplicate = await beginStudioPurchase(
        'owner',
        10000,
        '2026-07-29',
        'Owner'
    );
    assert.deepEqual(duplicate, { ok: false, reason: 'exists' });

    const studio = await finishStudioPurchase(
        purchase.studio.id,
        'thread',
        'overview'
    );
    assert.equal(studio.status, 'open');

    await run(`UPDATE users SET coins = 7000 WHERE id = 'owner'`);
    const hired = await hireStudioNpc(
        'owner',
        'personal_agent',
        5000,
        '2026-07-29'
    );
    assert.equal(hired.ok, true);
    assert.equal(
        await hasActiveStudioNpc('owner', 'personal_agent'),
        true
    );
    assert.deepEqual(
        await hireStudioNpc(
            'owner',
            'personal_agent',
            5000,
            '2026-07-29'
        ),
        { ok: false, reason: 'exists' }
    );

    await run(
        `INSERT INTO active_scenes (
            scene_type, status, channel_id, owner_id, target_id, category,
            parts_json, title, author_json, interval_ms, next_part_at,
            created_at, updated_at
         ) VALUES (
            'porn', 'running', 'channel', 'owner', 'partner', 'wm_wf',
            '["finale"]', 'Test Movie', '{}', 1000, 1, 1, 1
         )`
    );

    const studioScene = await attachSceneToOpenStudio(
        1,
        'owner',
        'Test Movie',
        1
    );
    assert.equal(studioScene.thread_id, 'thread');

    const mirror = await queueMirror(
        studioScene.id,
        'part:0',
        { title: 'Test Movie' }
    );
    await markMirrorPosted(mirror.id, 'message');

    const sameMirror = await queueMirror(
        studioScene.id,
        'part:0',
        { title: 'Changed' }
    );
    assert.equal(sameMirror.status, 'posted');
    assert.equal(JSON.parse(sameMirror.embed_json).title, 'Test Movie');

    assert.equal(
        await completeStudioScene(1, 5000, 'Viral Hit', 'Test Movie'),
        true
    );
    assert.equal(
        await completeStudioScene(1, 5000, 'Viral Hit', 'Test Movie'),
        false
    );

    const completed = await getStudioByOwner('owner');
    assert.equal(completed.movies_produced, 1);
    assert.equal(completed.total_viewers, 5000);
    assert.equal(completed.viral_hits, 1);

    const upkeep = await processStudioUpkeep(
        completed.id,
        'owner',
        500,
        '2026-07-30'
    );
    assert.equal(upkeep.closed, false);

    const [agent] = await getStudioStaffByOwner('owner');
    const agentUpkeep = await processStudioStaffUpkeep(
        agent.id,
        'owner',
        750,
        '2026-07-30'
    );
    assert.equal(agentUpkeep.suspended, false);

    await run(`UPDATE users SET coins = 0 WHERE id = 'owner'`);
    const closure = await processStudioUpkeep(
        completed.id,
        'owner',
        500,
        '2026-07-31'
    );
    assert.equal(closure.closed, true);
    assert.equal(
        await hasActiveStudioNpc('owner', 'personal_agent'),
        false
    );

    const stillAttached = await getStudioScene(1);
    assert.equal(stillAttached.status, 'completed');

    await run(`UPDATE users SET coins = 1000 WHERE id = 'owner'`);
    const reopened = await reopenStudio(
        'owner',
        1000,
        '2026-07-31'
    );
    assert.equal(reopened.ok, true);
    assert.equal(reopened.studio.status, 'open');
    assert.equal(
        await hasActiveStudioNpc('owner', 'personal_agent'),
        true
    );

    await run(`UPDATE users SET coins = 0 WHERE id = 'owner'`);
    const suspension = await processStudioStaffUpkeep(
        agent.id,
        'owner',
        750,
        '2026-08-01'
    );
    assert.equal(suspension.suspended, true);
    assert.equal(
        (await getStudioByOwner('owner')).status,
        'open'
    );
    assert.equal(
        await hasActiveStudioNpc('owner', 'personal_agent'),
        false
    );

    await run(`UPDATE users SET coins = 750 WHERE id = 'owner'`);
    const reactivated = await reactivateStudioNpc(
        'owner',
        'personal_agent',
        750,
        '2026-08-01'
    );
    assert.equal(reactivated.ok, true);
    assert.equal(
        await hasActiveStudioNpc('owner', 'personal_agent'),
        true
    );

    await closeDatabase();
    process.chdir(originalDirectory);
    fs.rmSync(temporaryDirectory, {
        recursive: true,
        force: true
    });

    console.log('Player Studio persistence tests passed.');
})().catch(async (error) => {
    console.error(error);
    await closeDatabase().catch(() => null);
    process.chdir(originalDirectory);
    process.exitCode = 1;
});
