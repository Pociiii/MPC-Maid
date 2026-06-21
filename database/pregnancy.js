const db =
    require('./database');

const {
    DEFAULT_PARTNER_FERTILITY,
    PREGNANCY
} = require('../data/pregnancyConfig');

const {
    calculatePregnancyChance,
    getBestPartnerCandidates,
    getCarrierFertility,
    getPartnerFertility,
    pickRandomPartner,
    rollCarrierFertility
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
            user_id,
            partner_fertility
        ) VALUES (?, ?)`,
        [
            userId,
            DEFAULT_PARTNER_FERTILITY
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

async function getDailyCarrierFertility(
    userId,
    date = getPregnancyDate()
) {

    const profile =
        await getOrCreatePregnancyProfile(
            userId
        );

    if (
        profile.carrier_fertility &&
        profile.fertility_date === date
    )
        return profile.carrier_fertility;

    const fertility =
        rollCarrierFertility();

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

async function getPartnerFertilityKey(
    userId
) {

    const profile =
        await getOrCreatePregnancyProfile(
            userId
        );

    return profile.partner_fertility ??
        DEFAULT_PARTNER_FERTILITY;

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

async function addDailyPartner(
    carrierId,
    partnerId,
    date = getPregnancyDate()
) {

    const partnerFertility =
        await getPartnerFertilityKey(
            partnerId
        );

    const partnerChance =
        getPartnerFertility(
            partnerFertility
        ).chance;

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
        childrenRow
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
            )
        ]);

    return {
        activePregnancy,
        children:
            childrenRow?.count ?? 0,
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
            PREGNANCY.DURATION_DAYS
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
            PREGNANCY.DURATION_DAYS
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

    return dbGet(
        `SELECT *
         FROM pregnancies
         WHERE id = ?`,
        [
            result.lastID
        ]
    );

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
        `SELECT partner_id AS userId,
                partner_fertility AS fertilityKey
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
    fatherId = null
) {

    await dbRun(
        `INSERT OR IGNORE INTO pregnancy_daily_checks (
            carrier_id,
            check_date,
            rolled_chance,
            success,
            father_id
        ) VALUES (?, ?, ?, ?, ?)`,
        [
            carrierId,
            date,
            chance,
            success
                ? 1
                : 0,
            fatherId
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

        const partners =
            await getDailyPartners(
                carrierId,
                date
            );

        const bestPartners =
            getBestPartnerCandidates(
                partners
            );

        if (
            bestPartners.length === 0
        )
            continue;

        const father =
            pickRandomPartner(
                bestPartners
            );

        const carrierFertility =
            await getDailyCarrierFertility(
                carrierId,
                date
            );

        const chance =
            calculatePregnancyChance(
                carrierFertility,
                father.fertilityKey
            );

        const success =
            Math.random() * 100 < chance;

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
                : null
        );

        results.push({
            carrierFertility,
            chance,
            fatherId:
                father.userId,
            pregnancy,
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

            await dbRun(
                `UPDATE pregnancies
                 SET birth_announced = 1,
                     status = 'born'
                 WHERE id = ?`,
                [
                    pregnancy.id
                ]
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
    getNextPregnancyCheckTimestamp,
    getPartnerFertilityKey,
    getPregnancyDate,
    getPregnancyDay,
    getPregnancyMilestones,
    getPregnancyStatus,
    getPreviousPregnancyDate,
    processPregnancyChecks,
    resetDailyCheck,
    resetDailyPartners
};
