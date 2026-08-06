const db = require('./database');

function run(sql, params = []) {
    return new Promise((resolve, reject) =>
        db.run(sql, params, function onRun(error) {
            error ? reject(error) : resolve({ changes: this.changes, lastID: this.lastID });
        })
    );
}

function get(sql, params = []) {
    return new Promise((resolve, reject) =>
        db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))
    );
}

function all(sql, params = []) {
    return new Promise((resolve, reject) =>
        db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))
    );
}

async function getStudioByOwner(ownerId) {
    return get('SELECT * FROM studios WHERE owner_id = ?', [ownerId]);
}

async function getStudioById(studioId) {
    return get('SELECT * FROM studios WHERE id = ?', [studioId]);
}

async function getStudioStaff(studioId) {
    return all(
        `SELECT * FROM studio_staff
         WHERE studio_id = ?
         ORDER BY hired_at, id`,
        [studioId]
    );
}

async function getStudioStaffByOwner(ownerId) {
    return all(
        `SELECT ss.*
         FROM studio_staff ss
         JOIN studios s ON s.id = ss.studio_id
         WHERE s.owner_id = ?
         ORDER BY ss.hired_at, ss.id`,
        [ownerId]
    );
}

async function hasActiveStudioNpc(ownerId, npcKey) {
    const row = await get(
        `SELECT 1 AS active
         FROM studio_staff ss
         JOIN studios s ON s.id = ss.studio_id
         WHERE s.owner_id = ?
         AND s.status = 'open'
         AND ss.npc_key = ?
         AND ss.status = 'active'`,
        [ownerId, npcKey]
    );

    return Boolean(row?.active);
}

async function hireStudioNpc(ownerId, npcKey, cost, resetDate, staffSlots = 1) {
    await run('BEGIN IMMEDIATE');

    try {
        const studio = await getStudioByOwner(ownerId);

        if (!studio || studio.status !== 'open') {
            await run('COMMIT');
            return { ok: false, reason: 'studio' };
        }

        const existing = await get(
            'SELECT * FROM studio_staff WHERE studio_id = ? AND npc_key = ?',
            [studio.id, npcKey]
        );

        if (existing) {
            await run('COMMIT');
            return { ok: false, reason: 'exists' };
        }

        const activeCount = await get(
            `SELECT COUNT(*) AS count FROM studio_staff
             WHERE studio_id = ? AND status = 'active'`,
            [studio.id]
        );

        if (activeCount.count >= staffSlots) {
            await run('COMMIT');
            return { ok: false, reason: 'slots' };
        }

        const spent = await run(
            'UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?',
            [cost, ownerId, cost]
        );

        if (!spent.changes) {
            await run('COMMIT');
            return { ok: false, reason: 'coins' };
        }

        const now = Date.now();
        await run(
            `INSERT INTO studio_staff (
                studio_id, npc_key, status, hired_at,
                last_upkeep_date, updated_at
             ) VALUES (?, ?, 'active', ?, ?, ?)`,
            [studio.id, npcKey, now, resetDate, now]
        );

        await run('COMMIT');
        return { ok: true };
    }
    catch (error) {
        await run('ROLLBACK').catch(() => null);
        throw error;
    }
}

async function reactivateStudioNpc(ownerId, npcKey, cost, resetDate, staffSlots = 1) {
    await run('BEGIN IMMEDIATE');

    try {
        const studio = await getStudioByOwner(ownerId);

        if (!studio || studio.status !== 'open') {
            await run('COMMIT');
            return { ok: false, reason: 'studio' };
        }

        const staff = await get(
            `SELECT * FROM studio_staff
             WHERE studio_id = ? AND npc_key = ?`,
            [studio.id, npcKey]
        );

        if (!staff || staff.status !== 'suspended') {
            await run('COMMIT');
            return { ok: false, reason: 'status' };
        }

        const activeCount = await get(
            `SELECT COUNT(*) AS count FROM studio_staff
             WHERE studio_id = ? AND status = 'active'`,
            [studio.id]
        );

        if (activeCount.count >= staffSlots) {
            await run('COMMIT');
            return { ok: false, reason: 'slots' };
        }

        const spent = await run(
            'UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?',
            [cost, ownerId, cost]
        );

        if (!spent.changes) {
            await run('COMMIT');
            return { ok: false, reason: 'coins' };
        }

        await run(
            `UPDATE studio_staff
             SET status = 'active', last_upkeep_date = ?,
                 suspended_at = NULL, updated_at = ?
             WHERE id = ? AND status = 'suspended'`,
            [resetDate, Date.now(), staff.id]
        );

        await run('COMMIT');
        return { ok: true };
    }
    catch (error) {
        await run('ROLLBACK').catch(() => null);
        throw error;
    }
}

async function fireStudioNpc(ownerId, npcKey) {
    const removed = await run(
        `DELETE FROM studio_staff
         WHERE studio_id = (SELECT id FROM studios WHERE owner_id = ?)
         AND npc_key = ?`,
        [ownerId, npcKey]
    );

    return removed.changes
        ? { ok: true }
        : { ok: false, reason: 'missing' };
}

async function upgradeStudio(ownerId, expectedTier, cost) {
    await run('BEGIN IMMEDIATE');

    try {
        const studio = await getStudioByOwner(ownerId);

        if (!studio || studio.status !== 'open' || studio.tier !== expectedTier) {
            await run('COMMIT');
            return { ok: false, reason: 'status' };
        }

        const spent = await run(
            'UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?',
            [cost, ownerId, cost]
        );

        if (!spent.changes) {
            await run('COMMIT');
            return { ok: false, reason: 'coins' };
        }

        await run(
            'UPDATE studios SET tier = tier + 1, updated_at = ? WHERE id = ?',
            [Date.now(), studio.id]
        );
        await run('COMMIT');
        return { ok: true, studio: await getStudioById(studio.id) };
    }
    catch (error) {
        await run('ROLLBACK').catch(() => null);
        throw error;
    }
}

async function getOpenStudios() {
    return all(
        `SELECT * FROM studios
         WHERE status = 'open' AND thread_id IS NOT NULL
         ORDER BY total_viewers DESC, movies_produced DESC, opened_at`
    );
}

async function getProvisioningStudios() {
    return all(
        `SELECT * FROM studios
         WHERE status = 'provisioning'
         ORDER BY created_at`
    );
}

async function beginStudioPurchase(ownerId, cost, resetDate, displayName) {
    await run('BEGIN IMMEDIATE');

    try {
        if (await getStudioByOwner(ownerId)) {
            await run('COMMIT');
            return { ok: false, reason: 'exists' };
        }

        const spent = await run(
            'UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?',
            [cost, ownerId, cost]
        );

        if (!spent.changes) {
            await run('COMMIT');
            return { ok: false, reason: 'coins' };
        }

        const now = Date.now();
        const created = await run(
            `INSERT INTO studios (
                owner_id, status, display_name, opened_at, last_upkeep_date,
                created_at, updated_at
             ) VALUES (?, 'provisioning', ?, ?, ?, ?, ?)`,
            [ownerId, displayName, now, resetDate, now, now]
        );

        await run('COMMIT');
        return { ok: true, studio: await getStudioById(created.lastID) };
    }
    catch (error) {
        await run('ROLLBACK').catch(() => null);
        throw error;
    }
}

async function finishStudioPurchase(studioId, threadId, overviewMessageId) {
    await run(
        `UPDATE studios
         SET status = 'open', thread_id = ?, overview_message_id = ?, updated_at = ?
         WHERE id = ? AND status = 'provisioning'`,
        [threadId, overviewMessageId, Date.now(), studioId]
    );

    return getStudioById(studioId);
}

async function saveProvisioningThread(studioId, threadId) {
    await run(
        `UPDATE studios SET thread_id = ?, updated_at = ?
         WHERE id = ? AND status = 'provisioning'`,
        [threadId, Date.now(), studioId]
    );
}

async function cancelStudioPurchase(studioId, ownerId, cost) {
    await run('BEGIN IMMEDIATE');

    try {
        const removed = await run(
            `DELETE FROM studios
             WHERE id = ? AND owner_id = ? AND status = 'provisioning'`,
            [studioId, ownerId]
        );

        if (removed.changes)
            await run(
                'UPDATE users SET coins = coins + ? WHERE id = ?',
                [cost, ownerId]
            );

        await run('COMMIT');
        return Boolean(removed.changes);
    }
    catch (error) {
        await run('ROLLBACK').catch(() => null);
        throw error;
    }
}

async function closeStudio(ownerId) {
    const result = await run(
        `UPDATE studios
         SET status = 'closed', closed_at = ?, updated_at = ?
         WHERE owner_id = ? AND status = 'open'`,
        [Date.now(), Date.now(), ownerId]
    );

    return result.changes
        ? { ok: true, studio: await getStudioByOwner(ownerId) }
        : { ok: false, reason: 'status' };
}

async function reopenStudio(ownerId, cost, resetDate) {
    await run('BEGIN IMMEDIATE');

    try {
        const studio = await getStudioByOwner(ownerId);

        if (!studio || studio.status !== 'closed') {
            await run('COMMIT');
            return { ok: false, reason: 'status' };
        }

        const spent = await run(
            'UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?',
            [cost, ownerId, cost]
        );

        if (!spent.changes) {
            await run('COMMIT');
            return { ok: false, reason: 'coins' };
        }

        await run(
            `UPDATE studios
             SET status = 'open', closed_at = NULL, last_upkeep_date = ?, updated_at = ?
             WHERE id = ? AND status = 'closed'`,
            [resetDate, Date.now(), studio.id]
        );

        await run(
            `UPDATE studio_staff
             SET last_upkeep_date = ?, updated_at = ?
             WHERE studio_id = ? AND status = 'active'`,
            [resetDate, Date.now(), studio.id]
        );

        await run('COMMIT');
        return { ok: true, studio: await getStudioById(studio.id) };
    }
    catch (error) {
        await run('ROLLBACK').catch(() => null);
        throw error;
    }
}

async function processStudioUpkeep(studioId, ownerId, cost, resetDate) {
    await run('BEGIN IMMEDIATE');

    try {
        const studio = await get(
            `SELECT * FROM studios
             WHERE id = ? AND owner_id = ? AND status = 'open'`,
            [studioId, ownerId]
        );

        if (!studio || studio.last_upkeep_date >= resetDate) {
            await run('COMMIT');
            return { changed: false, studio };
        }

        const spent = await run(
            'UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?',
            [cost, ownerId, cost]
        );
        const now = Date.now();

        if (spent.changes)
            await run(
                'UPDATE studios SET last_upkeep_date = ?, updated_at = ? WHERE id = ?',
                [resetDate, now, studioId]
            );
        else
            await run(
                `UPDATE studios
                 SET status = 'closed', closed_at = ?, last_upkeep_date = ?, updated_at = ?
                 WHERE id = ?`,
                [now, resetDate, now, studioId]
            );

        await run('COMMIT');
        return {
            changed: true,
            closed: !spent.changes,
            studio: await getStudioById(studioId)
        };
    }
    catch (error) {
        await run('ROLLBACK').catch(() => null);
        throw error;
    }
}

async function getStudiosDueUpkeep(resetDate) {
    return all(
        `SELECT * FROM studios
         WHERE status = 'open' AND last_upkeep_date < ?`,
        [resetDate]
    );
}

async function getStudioStaffDueUpkeep(resetDate) {
    return all(
        `SELECT ss.*, s.owner_id
         FROM studio_staff ss
         JOIN studios s ON s.id = ss.studio_id
         WHERE ss.status = 'active'
         AND ss.last_upkeep_date < ?
         AND s.status = 'open'
         ORDER BY ss.last_upkeep_date, ss.id`,
        [resetDate]
    );
}

async function processStudioStaffUpkeep(
    staffId,
    ownerId,
    cost,
    resetDate
) {
    await run('BEGIN IMMEDIATE');

    try {
        const staff = await get(
            `SELECT ss.*, s.status AS studio_status
             FROM studio_staff ss
             JOIN studios s ON s.id = ss.studio_id
             WHERE ss.id = ? AND s.owner_id = ?`,
            [staffId, ownerId]
        );

        if (
            !staff ||
            staff.status !== 'active' ||
            staff.studio_status !== 'open' ||
            staff.last_upkeep_date >= resetDate
        ) {
            await run('COMMIT');
            return { changed: false, staff };
        }

        const spent = await run(
            'UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?',
            [cost, ownerId, cost]
        );
        const now = Date.now();

        if (spent.changes)
            await run(
                `UPDATE studio_staff
                 SET last_upkeep_date = ?, updated_at = ?
                 WHERE id = ?`,
                [resetDate, now, staffId]
            );
        else
            await run(
                `UPDATE studio_staff
                 SET status = 'suspended', suspended_at = ?,
                     last_upkeep_date = ?, updated_at = ?
                 WHERE id = ?`,
                [now, resetDate, now, staffId]
            );

        await run('COMMIT');
        return {
            changed: true,
            suspended: !spent.changes,
            staff: await get(
                'SELECT * FROM studio_staff WHERE id = ?',
                [staffId]
            )
        };
    }
    catch (error) {
        await run('ROLLBACK').catch(() => null);
        throw error;
    }
}

async function attachSceneToOpenStudio(activeSceneId, requesterId, title, startedAt) {
    const studio = await getStudioByOwner(requesterId);

    if (!studio || studio.status !== 'open' || !studio.thread_id)
        return null;

    await run(
        `INSERT OR IGNORE INTO studio_scenes (
            studio_id, active_scene_id, title, requester_id, started_at
         ) VALUES (?, ?, ?, ?, ?)`,
        [studio.id, activeSceneId, title, requesterId, startedAt]
    );

    return getStudioScene(activeSceneId);
}

async function getStudioScene(activeSceneId) {
    return get(
        `SELECT ss.*, s.owner_id, s.thread_id, s.overview_message_id,
                s.opened_at, s.display_name, s.status AS studio_status
         FROM studio_scenes ss
         JOIN studios s ON s.id = ss.studio_id
         WHERE ss.active_scene_id = ?`,
        [activeSceneId]
    );
}

async function queueMirror(studioSceneId, mirrorKey, embed) {
    const now = Date.now();

    await run(
        `INSERT INTO studio_mirrors (
            studio_scene_id, mirror_key, embed_json, created_at
         ) VALUES (?, ?, ?, ?)
         ON CONFLICT(studio_scene_id, mirror_key)
         DO UPDATE SET embed_json = excluded.embed_json
         WHERE studio_mirrors.status = 'pending'`,
        [
            studioSceneId,
            mirrorKey,
            JSON.stringify(embed.toJSON ? embed.toJSON() : embed),
            now
        ]
    );

    return get(
        `SELECT * FROM studio_mirrors
         WHERE studio_scene_id = ? AND mirror_key = ?`,
        [studioSceneId, mirrorKey]
    );
}

async function markMirrorPosted(mirrorId, messageId) {
    await run(
        `UPDATE studio_mirrors
         SET status = 'posted', message_id = ?, posted_at = ?
         WHERE id = ? AND status = 'pending'`,
        [messageId, Date.now(), mirrorId]
    );
}

async function getPendingMirrors() {
    return all(
        `SELECT sm.*, s.thread_id
         FROM studio_mirrors sm
         JOIN studio_scenes ss ON ss.id = sm.studio_scene_id
         JOIN studios s ON s.id = ss.studio_id
         WHERE sm.status = 'pending' AND s.thread_id IS NOT NULL
         ORDER BY sm.created_at, sm.id`
    );
}

async function completeStudioScene(activeSceneId, viewers, outcome, title) {
    await run('BEGIN IMMEDIATE');

    try {
        const studioScene = await get(
            'SELECT * FROM studio_scenes WHERE active_scene_id = ?',
            [activeSceneId]
        );

        if (!studioScene || studioScene.status === 'completed') {
            await run('COMMIT');
            return false;
        }

        const now = Date.now();
        const completed = await run(
            `UPDATE studio_scenes
             SET status = 'completed', viewers = ?, outcome = ?, title = ?, completed_at = ?
             WHERE id = ? AND status = 'running'`,
            [viewers, outcome, title, now, studioScene.id]
        );

        if (completed.changes)
            await run(
                `UPDATE studios
                 SET movies_produced = movies_produced + 1,
                     total_viewers = total_viewers + ?,
                     viral_hits = viral_hits + ?,
                     latest_scene_title = ?, latest_scene_at = ?, updated_at = ?
                 WHERE id = ?`,
                [
                    viewers,
                    outcome === 'Viral Hit' ? 1 : 0,
                    title,
                    now,
                    now,
                    studioScene.studio_id
                ]
            );

        await run('COMMIT');
        return Boolean(completed.changes);
    }
    catch (error) {
        await run('ROLLBACK').catch(() => null);
        throw error;
    }
}

module.exports = {
    attachSceneToOpenStudio,
    beginStudioPurchase,
    cancelStudioPurchase,
    closeStudio,
    completeStudioScene,
    finishStudioPurchase,
    fireStudioNpc,
    getOpenStudios,
    getPendingMirrors,
    getProvisioningStudios,
    getStudioById,
    getStudioByOwner,
    getStudioScene,
    getStudioStaff,
    getStudioStaffByOwner,
    getStudioStaffDueUpkeep,
    getStudiosDueUpkeep,
    hasActiveStudioNpc,
    hireStudioNpc,
    markMirrorPosted,
    processStudioStaffUpkeep,
    processStudioUpkeep,
    queueMirror,
    reactivateStudioNpc,
    reopenStudio,
    saveProvisioningThread,
    upgradeStudio
};
