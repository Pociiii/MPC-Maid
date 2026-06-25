const db =
    require('../database/database');

const ROLES =
    require('../data/roles.json');

const requestExpiryMs =
    24 * 60 * 60 * 1000;

const mutualTypes =
    new Set([
        'sibling',
        'marriage',
        'dating',
        'bestie'
    ]);

const familyTypes =
    new Set([
        'mother',
        'father',
        'sibling'
    ]);

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

function normalizeMutualPair(
    firstId,
    secondId
) {

    return [
        String(
            firstId
        ),
        String(
            secondId
        )
    ].sort();

}

function normalizeRelationshipPair(
    type,
    firstId,
    secondId
) {

    if (
        mutualTypes.has(
            type
        )
    )
        return normalizeMutualPair(
            firstId,
            secondId
        );

    return [
        String(
            firstId
        ),
        String(
            secondId
        )
    ];

}

function getRelationshipGender(
    member
) {

    const hasMale =
        member.roles.cache.has(
            ROLES.MALE
        );

    const hasFemale =
        member.roles.cache.has(
            ROLES.FEMALE
        );

    if (
        hasMale === hasFemale
    )
        throw new Error(
            'You need one clear gender role before using this relationship command.'
        );

    return hasMale
        ? 'male'
        : 'female';

}

function getParentTypeForMember(
    member
) {

    return getRelationshipGender(
        member
    ) === 'female'
        ? 'mother'
        : 'father';

}

function getRomanticLabelForTarget(
    member,
    relationshipKind
) {

    const gender =
        getRelationshipGender(
            member
        );

    if (
        relationshipKind === 'marriage'
    )
        return gender === 'female'
            ? 'Wife'
            : 'Husband';

    return gender === 'female'
        ? 'Girlfriend'
        : 'Boyfriend';

}

function formatDate(
    dateText
) {

    if (
        !dateText
    )
        return null;

    return new Intl.DateTimeFormat(
        'en-US',
        {
            day:
                'numeric',
            month:
                'short',
            year:
                'numeric',
            timeZone:
                'UTC'
        }
    ).format(
        new Date(
            `${dateText}T00:00:00.000Z`
        )
    );

}

function parseRelationshipDate(
    day,
    month,
    year
) {

    const values =
        [
            day,
            month,
            year
        ];

    const provided =
        values.filter(
            (value) =>
                value !== null &&
                value !== undefined
        ).length;

    if (
        provided > 0 &&
        provided < 3
    )
        throw new Error(
            'Provide day, month, and year together, or leave all date fields empty.'
        );

    const now =
        new Date();

    if (
        provided === 0
    )
        return now
            .toISOString()
            .slice(
                0,
                10
            );

    if (
        year < 2020
    )
        throw new Error(
            'Relationship dates cannot be before 2020.'
        );

    const date =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        );

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    )
        throw new Error(
            'That relationship date is not real.'
        );

    if (
        date > now
    )
        throw new Error(
            'Relationship dates cannot be in the future.'
        );

    return date
        .toISOString()
        .slice(
            0,
            10
        );

}

async function hasParent(
    childId,
    type
) {

    return Boolean(
        await dbGet(
            `SELECT id
             FROM relationships
             WHERE user_b_id = ?
             AND type = ?`,
            [
                childId,
                type
            ]
        )
    );

}

async function hasSpouse(
    userId
) {

    return Boolean(
        await dbGet(
            `SELECT id
             FROM relationships
             WHERE type = 'marriage'
             AND (user_a_id = ? OR user_b_id = ?)`,
            [
                userId,
                userId
            ]
        )
    );

}

async function countBesties(
    userId
) {

    const row =
        await dbGet(
            `SELECT COUNT(*) AS count
             FROM relationships
             WHERE type = 'bestie'
             AND (user_a_id = ? OR user_b_id = ?)`,
            [
                userId,
                userId
            ]
        );

    return Number(
        row?.count ?? 0
    );

}

async function relationshipExists(
    type,
    firstId,
    secondId
) {

    const [
        userAId,
        userBId
    ] =
        normalizeRelationshipPair(
            type,
            firstId,
            secondId
        );

    return Boolean(
        await dbGet(
            `SELECT id
             FROM relationships
             WHERE type = ?
             AND user_a_id = ?
             AND user_b_id = ?`,
            [
                type,
                userAId,
                userBId
            ]
        )
    );

}

async function familyRelationshipExistsBetween(
    firstId,
    secondId
) {

    return Boolean(
        await dbGet(
            `SELECT id
             FROM relationships
             WHERE type IN ('mother', 'father', 'sibling')
             AND (
                (user_a_id = ? AND user_b_id = ?)
                OR (user_a_id = ? AND user_b_id = ?)
             )`,
            [
                firstId,
                secondId,
                secondId,
                firstId
            ]
        )
    );

}

async function assertNoFamilyRelationshipBetween(
    firstId,
    secondId
) {

    if (
        await familyRelationshipExistsBetween(
            firstId,
            secondId
        )
    )
        throw new Error(
            'You already have a family link with that user. Romantic links are still available.'
        );

}

async function createRelationship(
    type,
    firstId,
    secondId,
    startedAt = null
) {

    if (
        familyTypes.has(
            type
        )
    )
        await assertNoFamilyRelationshipBetween(
            firstId,
            secondId
        );

    const [
        userAId,
        userBId
    ] =
        normalizeRelationshipPair(
            type,
            firstId,
            secondId
        );

    await dbRun(
        `INSERT OR IGNORE INTO relationships (
            user_a_id,
            user_b_id,
            type,
            started_at
        ) VALUES (?, ?, ?, ?)`,
        [
            userAId,
            userBId,
            type,
            startedAt
        ]
    );

}

async function removeRelationship(
    type,
    firstId,
    secondId
) {

    const [
        userAId,
        userBId
    ] =
        normalizeRelationshipPair(
            type,
            firstId,
            secondId
        );

    const result =
        await dbRun(
            `DELETE FROM relationships
             WHERE type = ?
             AND user_a_id = ?
             AND user_b_id = ?`,
            [
                type,
                userAId,
                userBId
            ]
        );

    return result.changes > 0;

}

async function removeAllRelationshipsBetween(
    firstId,
    secondId
) {

    const result =
        await dbRun(
            `DELETE FROM relationships
             WHERE (
                user_a_id = ?
                AND user_b_id = ?
             )
             OR (
                user_a_id = ?
                AND user_b_id = ?
             )`,
            [
                firstId,
                secondId,
                secondId,
                firstId
            ]
        );

    return result.changes;

}

async function getChildrenOfParent(
    parentId,
    type = null
) {

    return dbAll(
        `SELECT *
         FROM relationships
         WHERE user_a_id = ?
         AND type IN ('mother', 'father')
         ${type ? 'AND type = ?' : ''}`,
        type
            ? [
                parentId,
                type
            ]
            : [
                parentId
            ]
    );

}

async function createSiblingLinksForNewChild(
    parentId,
    childId,
    parentType
) {

    const children =
        await getChildrenOfParent(
            parentId,
            parentType
        );

    for (
        const child of children
    ) {

        if (
            child.user_b_id === childId
        )
            continue;

        if (
            await familyRelationshipExistsBetween(
                child.user_b_id,
                childId
            )
        )
            continue;

        await createRelationship(
            'sibling',
            child.user_b_id,
            childId
        );

    }

}

async function createRelationshipRequest(
    guildId,
    requesterId,
    targetId,
    type,
    startedAt = null
) {

    const mutualRequest =
        mutualTypes.has(
            type
        );

    const duplicate =
        await dbGet(
            mutualRequest
                ? `SELECT id
                   FROM relationship_requests
                   WHERE guild_id = ?
                   AND type = ?
                   AND status = 'pending'
                   AND (
                       (requester_id = ? AND target_id = ?)
                       OR (requester_id = ? AND target_id = ?)
                   )`
                : `SELECT id
                   FROM relationship_requests
                   WHERE guild_id = ?
                   AND requester_id = ?
                   AND target_id = ?
                   AND type = ?
                   AND status = 'pending'`,
            mutualRequest
                ? [
                    guildId,
                    type,
                    requesterId,
                    targetId,
                    targetId,
                    requesterId
                ]
                : [
                    guildId,
                    requesterId,
                    targetId,
                    type
                ]
        );

    if (
        duplicate
    )
        throw new Error(
            'You already have a pending request like this with that user.'
        );

    const expiresAt =
        new Date(
            Date.now() + requestExpiryMs
        ).toISOString();

    const result =
        await dbRun(
        `INSERT INTO relationship_requests (
                guild_id,
                requester_id,
                target_id,
                type,
                started_at,
                expires_at
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                guildId,
                requesterId,
                targetId,
                type,
                startedAt,
                expiresAt
            ]
        );

    return result.lastID;

}

async function getRelationshipRequest(
    requestId
) {

    return dbGet(
        `SELECT *
         FROM relationship_requests
         WHERE id = ?`,
        [
            requestId
        ]
    );

}

async function setRelationshipRequestStatus(
    requestId,
    status
) {

    await dbRun(
        `UPDATE relationship_requests
         SET status = ?
         WHERE id = ?`,
        [
            status,
            requestId
        ]
    );

}

async function getRelationshipsForUser(
    userId
) {

    return dbAll(
        `SELECT *
         FROM relationships
         WHERE user_a_id = ?
         OR user_b_id = ?
         ORDER BY created_at ASC`,
        [
            userId,
            userId
        ]
    );

}

module.exports = {
    assertNoFamilyRelationshipBetween,
    countBesties,
    createRelationship,
    createRelationshipRequest,
    createSiblingLinksForNewChild,
    formatDate,
    getChildrenOfParent,
    getRelationshipGender,
    getRelationshipRequest,
    getRelationshipsForUser,
    familyRelationshipExistsBetween,
    getParentTypeForMember,
    getRomanticLabelForTarget,
    hasParent,
    hasSpouse,
    parseRelationshipDate,
    relationshipExists,
    removeAllRelationshipsBetween,
    removeRelationship,
    setRelationshipRequestStatus
};
