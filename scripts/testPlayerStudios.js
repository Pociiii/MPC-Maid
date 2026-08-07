const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const originalDirectory = process.cwd();
const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'mpc-maid-studios-')
);

process.chdir(temporaryDirectory);
process.env.MPC_DATA_DIR = temporaryDirectory;

const db = require('../database/database');

const {
    attachSceneToOpenStudio,
    beginStudioPurchase,
    closeStudio,
    completeStudioScene,
    fireStudioNpc,
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
    reopenStudio,
    upgradeStudio
} = require('../database/studios');

const {
    getStudioUpkeepCost
} = require('../features/player-studios/studios');

const {
    resolvePendingRequest
} = require('../features/porn-career/pendingSceneRequests');

const {
    addPendingRequest,
    getPendingRequest
} = require('../utils/pornScenes');

const {
    getUserBoosters
} = require('../utils/boosters');

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
    assert.equal(studio.tier, 1);
    assert.equal(getStudioUpkeepCost(500, false), 500);
    assert.equal(getStudioUpkeepCost(500, true), 375);
    assert.equal(getStudioUpkeepCost(750, true), 563);
    assert.equal(getStudioUpkeepCost(1000, true), 750);
    assert.equal(getStudioUpkeepCost(1250, true), 938);

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

    assert.deepEqual(
        await hireStudioNpc('owner', 'extra_staff', 1, '2026-07-29', 1),
        { ok: false, reason: 'slots' }
    );

    await run(`UPDATE users SET coins = 20000 WHERE id = 'owner'`);
    const upgraded = await upgradeStudio('owner', 1, 20000);
    assert.equal(upgraded.ok, true);
    assert.equal(upgraded.studio.tier, 2);
    assert.deepEqual(
        await upgradeStudio('owner', 1, 20000),
        { ok: false, reason: 'status' }
    );

    await run(`UPDATE users SET coins = 1 WHERE id = 'owner'`);
    assert.equal(
        (await hireStudioNpc('owner', 'extra_staff', 1, '2026-07-29', 2)).ok,
        true
    );
    assert.equal((await fireStudioNpc('owner', 'extra_staff')).ok, true);
    assert.deepEqual(
        await fireStudioNpc('owner', 'extra_staff'),
        { ok: false, reason: 'missing' }
    );

    addPendingRequest('owner', 'target', {
        messageId: 'request-message',
        expiresAt: null,
        createdAt: Date.now(),
        booster: { stat: 'fame', tier: 1 }
    });
    let editedRequest = null;
    const requestClient = {
        users: {
            fetch: async () => ({
                createDM: async () => ({
                    messages: {
                        fetch: async () => ({
                            edit: async (payload) => {
                                editedRequest = payload;
                            }
                        })
                    }
                })
            })
        }
    };
    const cancelled = await resolvePendingRequest(
        requestClient,
        'owner',
        'target',
        'Scene request cancelled by the requester.'
    );
    assert.equal(cancelled.expiresAt, null);
    assert.equal(getPendingRequest('owner', 'target'), undefined);
    assert.equal(editedRequest.content, 'Scene request cancelled by the requester.');
    assert.equal(
        (await getUserBoosters('owner')).find(
            (booster) => booster.stat === 'fame' && booster.tier === 1
        ).quantity,
        1
    );
    await run(`UPDATE users SET coins = 7000 WHERE id = 'owner'`);

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

    const manualClosure = await closeStudio('owner');
    assert.equal(manualClosure.ok, true);
    assert.equal(
        await hasActiveStudioNpc('owner', 'personal_agent'),
        false
    );
    assert.equal(
        (await processStudioUpkeep(
            completed.id,
            'owner',
            500,
            '2026-08-02'
        )).changed,
        false
    );
    assert.equal(
        (await processStudioStaffUpkeep(
            agent.id,
            'owner',
            750,
            '2026-08-02'
        )).changed,
        false
    );

    await run(`UPDATE users SET coins = 1000 WHERE id = 'owner'`);
    const reopenedAfterManualClose = await reopenStudio(
        'owner',
        1000,
        '2026-08-02'
    );
    assert.equal(reopenedAfterManualClose.ok, true);
    assert.equal(
        await hasActiveStudioNpc('owner', 'personal_agent'),
        true
    );

    await run(`UPDATE users SET coins = 0 WHERE id = 'owner'`);
    const suspension = await processStudioStaffUpkeep(
        agent.id,
        'owner',
        750,
        '2026-08-03'
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
        '2026-08-03'
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
