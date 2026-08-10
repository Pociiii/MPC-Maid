const db =
    require('./database');

const {
    randomUUID
} = require('node:crypto');

const {
    PREGNANCY
} = require('../data/pregnancyConfig');

const {
    calculatePregnancyChance,
    generateDailyFertility,
    getUniquePartnerCandidates,
    pickRandomPartner
} = require('../utils/pregnancy');

const RESET_HOUR_UTC =
    12;

const DAY_MS =
    24 * 60 * 60 * 1000;

function dbAll(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.all(
                sql,
                params,
                (error, rows) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            rows
                        )
            )
    );

}

function dbGet(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.get(
                sql,
                params,
                (error, row) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            row
                        )
            )
    );

}

function dbRun(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) =>
            db.run(
                sql,
                params,
                function(error) {
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            this
                        );
                }
            )
    );

}

function getPregnancyDate(
    now = new Date()
) {

    const date =
        new Date(
            now
        );

    if (
        date.getUTCHours() < RESET_HOUR_UTC
    )
        date.setUTCDate(
            date.getUTCDate() - 1
        );

    return date
        .toISOString()
        .slice(
            0,
            10
        );

}

function getPreviousPregnancyDate(
    now = new Date()
) {

    const date =
        new Date(
            now
        );

    date.setUTCDate(
        date.getUTCDate() - 1
    );

    return getPregnancyDate(
        date
    );

}

function getNextPregnancyCheckTimestamp(
    now = new Date()
) {

    const next =
        new Date(
            now
        );

    next.setUTCHours(
        RESET_HOUR_UTC,
        5,
        0,
        0
    );

    if (
        next <= now
    )
        next.setUTCDate(
            next.getUTCDate() + 1
        );

    return Math.floor(
        next.getTime() / 1000
    );

}

function getNextPregnancyResetTimestamp(
    now = new Date()
) {

    const next =
        new Date(now);

    next.setUTCHours(
        RESET_HOUR_UTC,
        0,
        0,
        0
    );

    if (next <= now)
        next.setUTCDate(
            next.getUTCDate() + 1
        );

    return Math.floor(
        next.getTime() / 1000
    );

}

function addDays(
    date,
    days
) {

    return new Date(
        date.getTime() + days * DAY_MS
    );

}

function isoDaysAgo(
    days
) {

    return addDays(
        new Date(),
        -days
    ).toISOString();

}

async function getOrCreatePregnancyProfile(
    userId
) {

    await dbRun(
        `INSERT OR IGNORE INTO pregnancy_profiles (
            user_id
        ) VALUES (?)`,
        [
            userId
        ]
    );

    return dbGet(
        `SELECT *
         FROM pregnancy_profiles
         WHERE user_id = ?`,
        [
            userId
        ]
    );

}

async function markPregnancyStarted(
    carrierId,
    fatherId,
    startedAt
) {

    await Promise.all([
        getOrCreatePregnancyProfile(
            carrierId
        ),
        getOrCreatePregnancyProfile(
            fatherId
        )
    ]);

    await Promise.all([
        dbRun(
            `UPDATE pregnancy_profiles
             SET pregnancy_count = COALESCE(pregnancy_count, 0) + 1,
                 last_pregnancy_at = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            [
                startedAt,
                carrierId
            ]
        ),
        dbRun(
            `UPDATE pregnancy_profiles
             SET pregnancy_partner_count = COALESCE(pregnancy_partner_count, 0) + 1,
                 last_pregnancy_at = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            [
                startedAt,
                fatherId
            ]
        )
    ]);

}

async function markBirthComplete(
    carrierId,
    birthAt
) {

    await getOrCreatePregnancyProfile(
        carrierId
    );

    await dbRun(
        `UPDATE pregnancy_profiles
         SET children_born = COALESCE(children_born, 0) + 1,
             last_birth_at = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
            birthAt,
            carrierId
        ]
    );

}

async function getDailyCarrierFertility(
    userId,
    date = getPregnancyDate()
) {

    const profile =
        await getOrCreatePregnancyProfile(
            userId
        );

    const storedFertility =
        Number(
            profile.carrier_fertility
        );

    if (
        profile.fertility_date === date &&
        Number.isInteger(
            storedFertility
        ) &&
        storedFertility >= PREGNANCY.MIN_DAILY_FERTILITY &&
        storedFertility <= PREGNANCY.MAX_DAILY_FERTILITY
    )
        return storedFertility;

    const fertility =
        generateDailyFertility();

    await dbRun(
        `UPDATE pregnancy_profiles
         SET carrier_fertility = ?,
             fertility_date = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
            fertility,
            date,
            userId
        ]
    );

    return fertility;

}

async function getActivePregnancy(
    carrierId
) {

    return dbGet(
        `SELECT *
         FROM pregnancies
         WHERE carrier_id = ?
         AND status = 'pregnant'
         ORDER BY id DESC
         LIMIT 1`,
        [
            carrierId
        ]
    );

}

async function getFertilityPillActivation(
    userId,
    date = getPregnancyDate()
) {

    return dbGet(
        `SELECT *
         FROM fertility_pill_activations
         WHERE user_id = ?
         AND active_date = ?`,
        [
            userId,
            date
        ]
    );

}

function purchaseFertilityPill(
    userId,
    date = getPregnancyDate()
) {

    if (!/^\d+$/.test(userId) || !/^\d{4}-\d{2}-\d{2}$/.test(date))
        return Promise.reject(
            new Error('Invalid fertility pill purchase identity or date.')
        );

    const token =
        randomUUID();

    return new Promise(
        (resolve, reject) => {

            db.exec(
                `BEGIN IMMEDIATE;
                 INSERT OR IGNORE INTO users (id) VALUES ('${userId}');
                 INSERT OR IGNORE INTO fertility_pill_activations
                    (user_id, active_date, cost_paid, purchase_token)
                 SELECT '${userId}', '${date}', ${PREGNANCY.FERTILITY_PILL_COST}, '${token}'
                 WHERE NOT EXISTS (
                    SELECT 1 FROM pregnancies
                    WHERE carrier_id = '${userId}' AND status = 'pregnant'
                 )
                 AND (SELECT coins FROM users WHERE id = '${userId}') >= ${PREGNANCY.FERTILITY_PILL_COST};
                 UPDATE users
                 SET coins = coins - ${PREGNANCY.FERTILITY_PILL_COST}
                 WHERE id = '${userId}' AND changes() = 1;
                 COMMIT;`,
                async (error) => {

                    if (error) {
                        db.run(
                            'ROLLBACK',
                            () => reject(error)
                        );
                        return;
                    }

                    try {
                        const [activation, pregnancy] = await Promise.all([
                            getFertilityPillActivation(userId, date),
                            getActivePregnancy(userId)
                        ]);

                        resolve({
                            status: activation?.purchase_token === token
                                ? 'purchased'
                                : activation
                                    ? 'active'
                                    : pregnancy
                                        ? 'pregnant'
                                        : 'insufficient'
                        });
                    }
                    catch (lookupError) {
                        reject(lookupError);
                    }

                }
            );

        }
    );

}

async function addDailyPartner(
    carrierId,
    partnerId,
    date = getPregnancyDate()
) {

    const partnerFertility =
        await getDailyCarrierFertility(
            partnerId,
            date
        );

    const partnerChance =
        partnerFertility;

    const result =
        await dbRun(
            `INSERT OR IGNORE INTO pregnancy_daily_partners (
                carrier_id,
                partner_id,
                partner_fertility,
                partner_chance,
                partner_date
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                carrierId,
                partnerId,
                partnerFertility,
                partnerChance,
                date
            ]
        );

    return {
        added:
            result.changes > 0,
        partnerChance,
        partnerFertility
    };

}

async function getPregnancyStatus(
    userId
) {

    const [
        activePregnancy,
        profile,
        childrenRow,
        fertilityPill
    ] =
        await Promise.all([
            getActivePregnancy(
                userId
            ),
            getOrCreatePregnancyProfile(
                userId
            ),
            dbGet(
                `SELECT COUNT(*) AS count
                 FROM pregnancies
                 WHERE carrier_id = ?
                 AND status = 'born'`,
                [
                    userId
                ]
            ),
            getFertilityPillActivation(userId)
        ]);

    return {
        activePregnancy,
        children:
            Math.max(
                profile.children_born ?? 0,
                childrenRow?.count ?? 0
            ),
        fertilityPill,
        profile
    };

}

function getPregnancyDay(
    pregnancy,
    now = new Date()
) {

    if (
        !pregnancy
    )
        return null;

    const started =
        new Date(
            pregnancy.started_at
        );

    return Math.min(
        PREGNANCY.DURATION_DAYS,
        Math.max(
            1,
            Math.floor(
                (now - started) / DAY_MS
            ) + 1
        )
    );

}

async function createPregnancy(
    carrierId,
    fatherId,
    now = new Date()
) {

    const startedAt =
        now.toISOString();

    const dueAt =
        addDays(
            now,
            PREGNANCY.DURATION_DAYS - 1
        ).toISOString();

    const babyGender =
        Math.random() < 0.5
            ? 'Girl'
            : 'Boy';

    const result =
        await dbRun(
            `INSERT INTO pregnancies (
                carrier_id,
                father_id,
                started_at,
                due_at,
                baby_gender
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                carrierId,
                fatherId,
                startedAt,
                dueAt,
                babyGender
            ]
        );

    await markPregnancyStarted(
        carrierId,
        fatherId,
        startedAt
    );

    return dbGet(
        `SELECT *
         FROM pregnancies
         WHERE id = ?`,
        [
            result.lastID
        ]
    );

}

async function clearActivePregnancy(
    carrierId
) {

    const result =
        await dbRun(
            `UPDATE pregnancies
             SET status = 'cleared',
                 birth_announced = 1
             WHERE carrier_id = ?
             AND status = 'pregnant'`,
            [
                carrierId
            ]
        );

    return result.changes;

}

async function forcePregnancy(
    carrierId,
    fatherId,
    day = 1
) {

    await clearActivePregnancy(
        carrierId
    );

    const safeDay =
        Math.min(
            PREGNANCY.DURATION_DAYS,
            Math.max(
                1,
                day
            )
        );

    const startedAt =
        isoDaysAgo(
            safeDay - 1
        );

    const dueAt =
        addDays(
            new Date(
                startedAt
            ),
            PREGNANCY.DURATION_DAYS - 1
        ).toISOString();

    const babyGender =
        Math.random() < 0.5
            ? 'Girl'
            : 'Boy';

    const result =
        await dbRun(
            `INSERT INTO pregnancies (
                carrier_id,
                father_id,
                started_at,
                due_at,
                baby_gender,
                gender_revealed
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                carrierId,
                fatherId,
                startedAt,
                dueAt,
                babyGender,
                safeDay >= PREGNANCY.GENDER_REVEAL_DAY
                    ? 1
                    : 0
            ]
        );

    await markPregnancyStarted(
        carrierId,
        fatherId,
        startedAt
    );

    return dbGet(
        `SELECT *
         FROM pregnancies
         WHERE id = ?`,
        [
            result.lastID
        ]
    );

}

async function scheduleForcedPregnancy(
    carrierId,
    fatherId,
    date = getPregnancyDate()
) {

    await dbRun(
        `INSERT INTO pregnancy_forced_queue (
            carrier_id,
            father_id,
            scheduled_date
        ) VALUES (?, ?, ?)
        ON CONFLICT(carrier_id) DO UPDATE SET
            father_id = excluded.father_id,
            scheduled_date = excluded.scheduled_date,
            queued_at = CURRENT_TIMESTAMP`,
        [
            carrierId,
            fatherId,
            date
        ]
    );

    return dbGet(
        `SELECT *
         FROM pregnancy_forced_queue
         WHERE carrier_id = ?`,
        [
            carrierId
        ]
    );

}

async function processScheduledPregnancies(
    date = getPreviousPregnancyDate()
) {

    const queued =
        await dbAll(
            `SELECT *
             FROM pregnancy_forced_queue
             WHERE scheduled_date <= ?
             ORDER BY queued_at ASC`,
            [
                date
            ]
        );

    const results = [];

    for (
        const entry of queued
    ) {

        const carrierFertility =
            await getDailyCarrierFertility(
                entry.carrier_id,
                entry.scheduled_date
            );

        const partnerFertility =
            await getDailyCarrierFertility(
                entry.father_id,
                entry.scheduled_date
            );

        const [
            carrierPill,
            partnerPill
        ] = await Promise.all([
            getFertilityPillActivation(entry.carrier_id, entry.scheduled_date),
            getFertilityPillActivation(entry.father_id, entry.scheduled_date)
        ]);

        const carrierPillBonus =
            carrierPill ? PREGNANCY.FERTILITY_PILL_BONUS : 0;

        const partnerPillBonus =
            partnerPill ? PREGNANCY.FERTILITY_PILL_BONUS : 0;

        const chance =
            calculatePregnancyChance(
                carrierFertility,
                partnerFertility,
                carrierPillBonus,
                partnerPillBonus
            );

        const roll =
            Math.floor(
                Math.random() * chance
            ) + 1;

        const pregnancy =
            await forcePregnancy(
                entry.carrier_id,
                entry.father_id,
                1
            );

        await dbRun(
            `DELETE FROM pregnancy_forced_queue
             WHERE carrier_id = ?
             AND scheduled_date = ?`,
            [
                entry.carrier_id,
                entry.scheduled_date
            ]
        );

        results.push({
            carrierFertility,
            carrierPillBonus,
            chance,
            date:
                entry.scheduled_date,
            fatherId:
                entry.father_id,
            partnerFertility,
            partnerPillBonus,
            pregnancy,
            roll,
            success:
                true,
            carrierId:
                entry.carrier_id
        });

    }

    return results;

}

async function forceGenderReveal(
    carrierId
) {

    const result =
        await dbRun(
            `UPDATE pregnancies
             SET gender_revealed = 1
             WHERE carrier_id = ?
             AND status = 'pregnant'`,
            [
                carrierId
            ]
        );

    return result.changes;

}

async function forceBirth(
    carrierId
) {

    const birthAt =
        new Date().toISOString();

    const result =
        await dbRun(
            `UPDATE pregnancies
             SET birth_announced = 1,
                 status = 'born'
             WHERE carrier_id = ?
             AND status = 'pregnant'`,
            [
                carrierId
            ]
        );

    if (
        result.changes > 0
    )
        await markBirthComplete(
            carrierId,
            birthAt
        );

    return result.changes;

}

async function resetDailyPartners(
    carrierId,
    date = getPregnancyDate()
) {

    const result =
        await dbRun(
            `DELETE FROM pregnancy_daily_partners
             WHERE carrier_id = ?
             AND partner_date = ?`,
            [
                carrierId,
                date
            ]
        );

    return result.changes;

}

async function resetDailyCheck(
    carrierId,
    date = getPreviousPregnancyDate()
) {

    const result =
        await dbRun(
            `DELETE FROM pregnancy_daily_checks
             WHERE carrier_id = ?
             AND check_date = ?`,
            [
                carrierId,
                date
            ]
        );

    return result.changes;

}

async function getUncheckedCarriers(
    date
) {

    return dbAll(
        `SELECT DISTINCT carrier_id
         FROM pregnancy_daily_partners
         WHERE partner_date = ?
         AND carrier_id NOT IN (
             SELECT carrier_id
             FROM pregnancy_daily_checks
             WHERE check_date = ?
         )`,
        [
            date,
            date
        ]
    );

}

async function getDailyPartners(
    carrierId,
    date
) {

    return dbAll(
        `SELECT partner_id AS userId
         FROM pregnancy_daily_partners
         WHERE carrier_id = ?
         AND partner_date = ?`,
        [
            carrierId,
            date
        ]
    );

}

async function markDailyCheck(
    carrierId,
    date,
    chance,
    success,
    fatherId = null,
    carrierPillBonus = 0,
    partnerPillBonus = 0
) {

    await dbRun(
        `INSERT OR IGNORE INTO pregnancy_daily_checks (
            carrier_id,
            check_date,
            rolled_chance,
            success,
            father_id,
            carrier_pill_bonus,
            partner_pill_bonus
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            carrierId,
            date,
            chance,
            success
                ? 1
                : 0,
            fatherId,
            carrierPillBonus,
            partnerPillBonus
        ]
    );

}

async function processPregnancyChecks(
    date = getPreviousPregnancyDate()
) {

    const carriers =
        await getUncheckedCarriers(
            date
        );

    const results = [];

    for (
        const {
            carrier_id: carrierId
        } of carriers
    ) {

        const active =
            await getActivePregnancy(
                carrierId
            );

        if (
            active
        ) {

            await markDailyCheck(
                carrierId,
                date,
                0,
                false
            );

            continue;

        }

        const storedPartners =
            await getDailyPartners(
                carrierId,
                date
            );

        const partners =
            await Promise.all(
                storedPartners.map(
                    async (partner) => ({
                        ...partner,
                        dailyFertility:
                            await getDailyCarrierFertility(
                                partner.userId,
                                date
                            )
                    })
                )
            );

        const eligiblePartners =
            getUniquePartnerCandidates(
                partners
            );

        if (
            eligiblePartners.length === 0
        )
            continue;

        const father =
            pickRandomPartner(
                eligiblePartners
            );

        const carrierFertility =
            await getDailyCarrierFertility(
                carrierId,
                date
            );

        const [
            carrierPill,
            partnerPill
        ] = await Promise.all([
            getFertilityPillActivation(carrierId, date),
            getFertilityPillActivation(father.userId, date)
        ]);

        const carrierPillBonus =
            carrierPill ? PREGNANCY.FERTILITY_PILL_BONUS : 0;

        const partnerPillBonus =
            partnerPill ? PREGNANCY.FERTILITY_PILL_BONUS : 0;

        const chance =
            calculatePregnancyChance(
                carrierFertility,
                father.dailyFertility,
                carrierPillBonus,
                partnerPillBonus
            );

        const roll =
            Math.floor(
                Math.random() * 100
            ) + 1;

        const success =
            roll <= chance;

        const pregnancy =
            success
                ? await createPregnancy(
                    carrierId,
                    father.userId
                )
                : null;

        await markDailyCheck(
            carrierId,
            date,
            chance,
            success,
            success
                ? father.userId
                : null,
            carrierPillBonus,
            partnerPillBonus
        );

        results.push({
            carrierFertility,
            carrierPillBonus,
            chance,
            date,
            fatherId:
                father.userId,
            pregnancy,
            partnerFertility:
                father.dailyFertility,
            partnerPillBonus,
            roll,
            success,
            carrierId
        });

    }

    return results;

}

async function getPregnancyMilestones(
    now = new Date()
) {

    const active =
        await dbAll(
            `SELECT *
             FROM pregnancies
             WHERE status = 'pregnant'`
        );

    const reveals = [];
    const births = [];

    for (
        const pregnancy of active
    ) {

        const day =
            getPregnancyDay(
                pregnancy,
                now
            );

        if (
            day >= PREGNANCY.GENDER_REVEAL_DAY &&
            !pregnancy.gender_revealed
        ) {

            await dbRun(
                `UPDATE pregnancies
                 SET gender_revealed = 1
                 WHERE id = ?`,
                [
                    pregnancy.id
                ]
            );

            reveals.push({
                ...pregnancy,
                day
            });

        }

        if (
            day >= PREGNANCY.DURATION_DAYS &&
            !pregnancy.birth_announced
        ) {

            const birthAt =
                now.toISOString();

            await dbRun(
                `UPDATE pregnancies
                 SET birth_announced = 1,
                     status = 'born'
                 WHERE id = ?`,
                [
                    pregnancy.id
                ]
            );

            await markBirthComplete(
                pregnancy.carrier_id,
                birthAt
            );

            births.push({
                ...pregnancy,
                day
            });

        }

    }

    return {
        births,
        reveals
    };

}

module.exports = {
    addDailyPartner,
    clearActivePregnancy,
    forceBirth,
    forceGenderReveal,
    forcePregnancy,
    getActivePregnancy,
    getDailyCarrierFertility,
    getFertilityPillActivation,
    getNextPregnancyCheckTimestamp,
    getNextPregnancyResetTimestamp,
    getPregnancyDate,
    getPregnancyDay,
    getPregnancyMilestones,
    getPregnancyStatus,
    getPreviousPregnancyDate,
    processPregnancyChecks,
    processScheduledPregnancies,
    purchaseFertilityPill,
    resetDailyCheck,
    resetDailyPartners,
    scheduleForcedPregnancy
};
