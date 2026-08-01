const fs =
    require('fs');

const path =
    require('path');

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ThreadAutoArchiveDuration
} = require('discord.js');

const db =
    require('../../database/database');

const {
    CHANNELS,
    ECONOMY,
    getRandomColor
} = require('../../data/constants');

const {
    createEmbed
} = require('../../utils/embeds');

const {
    addCoins,
    addXP,
    getOrCreateUser
} = require('../../utils/users');

const {
    logBotEvent,
    logError,
    logWarning
} = require('../../utils/inboxLogger');

const {
    getDailyQuestDate,
    getNextResetTimestamp
} = require('../daily-quests/dailyQuests');

const {
    setAchievementProgress,
    syncUserAchievementCounters
} = require('../achievements/achievements');

const resetHourUtc =
    12;

const recentQuestionBuffer =
    100;

const postClaimTtlMs =
    5 * 60 * 1000;

const questionsPath =
    path.join(
        __dirname,
        '..',
        '..',
        'data',
        'wyr',
        'questions.json'
    );

let dailyWyrTimer =
    null;

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
                        : resolve({
                            changes:
                                this.changes,
                            lastID:
                                this.lastID
                        });
                }
            )
    );

}

function readQuestions() {

    const questions =
        JSON.parse(
            fs.readFileSync(
                questionsPath,
                'utf8'
            )
        );

    return questions.filter(
        (question) =>
            question?.id &&
            question?.optionA &&
            question?.optionB
    );

}

function randomItem(
    items
) {

    return items[
        Math.floor(
            Math.random() * items.length
        )
    ];

}

function addDays(
    dateText,
    amount
) {

    const date =
        new Date(
            `${dateText}T00:00:00.000Z`
        );

    date.setUTCDate(
        date.getUTCDate() + amount
    );

    return date
        .toISOString()
        .slice(
            0,
            10
        );

}

function getCloseTimestamp(
    questionDate
) {

    return new Date(
        `${addDays(
            questionDate,
            1
        )}T${String(
            resetHourUtc
        ).padStart(
            2,
            '0'
        )}:00:00.000Z`
    ).toISOString();

}

function toUnixTimestamp(
    timestamp
) {

    return Math.floor(
        new Date(
            timestamp
        ).getTime() / 1000
    );

}

function createPostClaimToken() {

    return `${process.pid}:${Date.now()}:${Math.random()
        .toString(
            36
        )
        .slice(
            2
        )}`;

}

function getStalePostClaimCutoff() {

    return new Date(
        Date.now() - postClaimTtlMs
    ).toISOString();

}

function hasFreshPostClaim(
    session
) {

    if (
        !session?.post_claim_token ||
        !session.post_claimed_at
    )
        return false;

    return new Date(
        session.post_claimed_at
    ).getTime() > Date.now() - postClaimTtlMs;

}

function formatThreadDate(
    questionDate
) {

    return new Intl.DateTimeFormat(
        'en-US',
        {
            day:
                'numeric',
            month:
                'long',
            timeZone:
                'UTC'
        }
    ).format(
        new Date(
            `${questionDate}T12:00:00.000Z`
        )
    );

}

function buildVoteRow(
    session,
    disabled = false
) {

    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(
                    `daily_wyr_vote:${session.id}:a`
                )
                .setLabel(
                    'Option A'
                )
                .setStyle(
                    ButtonStyle.Primary
                )
                .setDisabled(
                    disabled
                ),
            new ButtonBuilder()
                .setCustomId(
                    `daily_wyr_vote:${session.id}:b`
                )
                .setLabel(
                    'Option B'
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
                .setDisabled(
                    disabled
                )
        );

}

function buildOpenEmbed(
    session
) {

    const closeTimestamp =
        toUnixTimestamp(
            session.closes_at
        );

    return createEmbed({
        color:
            getRandomColor(),
        title:
            'Daily Would You Rather',
        description:
`Would you rather...

**Option A:** ${session.option_a}

**OR**

**Option B:** ${session.option_b}

Vote below, then join the thread and explain why.
Voting reward: **${ECONOMY.DAILY_WYR_VOTE_COINS} coins** + **${ECONOMY.DAILY_WYR_VOTE_XP} XP**.
Voting closes <t:${closeTimestamp}:R>.`,
        footerText:
            'Daily WYR',
        timestamp:
            true
    });

}

function percent(
    count,
    total
) {

    if (
        total === 0
    )
        return '0%';

    return `${Math.round(
        (count / total) * 100
    )}%`;

}

function buildClosedEmbed(
    session,
    counts,
    threadReplyCount
) {

    const total =
        counts.a + counts.b;

    const embed =
        createEmbed({
            color:
                getRandomColor(),
            title:
                'Daily Would You Rather',
            description:
`Voting closed.

**Option A:** ${session.option_a}
**Option B:** ${session.option_b}`,
            footerText:
                'Daily WYR',
            timestamp:
                true
        });

    embed.addFields(
        {
            name:
                'Option A',
            value:
                `${counts.a} vote${counts.a === 1 ? '' : 's'} - ${percent(
                    counts.a,
                    total
                )}`,
            inline:
                true
        },
        {
            name:
                'Option B',
            value:
                `${counts.b} vote${counts.b === 1 ? '' : 's'} - ${percent(
                    counts.b,
                    total
                )}`,
            inline:
                true
        },
        {
            name:
                'Total Votes',
            value:
                String(
                    total
                ),
            inline:
                true
        },
        {
            name:
                'Thread Replies',
            value:
                String(
                    threadReplyCount
                ),
            inline:
                true
        }
    );

    return embed;

}

async function pickQuestion() {

    const questions =
        readQuestions();

    if (
        questions.length === 0
    )
        throw new Error(
            'No Daily WYR questions are available.'
        );

    const recentRows =
        await dbAll(
            `SELECT question_id
             FROM daily_wyr_sessions
             ORDER BY question_date DESC, id DESC
             LIMIT ?`,
            [
                recentQuestionBuffer
            ]
        );

    const recentIds =
        new Set(
            recentRows.map(
                (row) =>
                    row.question_id
            )
        );

    const candidates =
        questions.filter(
            (question) =>
                !recentIds.has(
                    question.id
                )
        );

    return randomItem(
        candidates.length
            ? candidates
            : questions
    );

}

async function getSession(
    sessionId
) {

    return dbGet(
        `SELECT *
         FROM daily_wyr_sessions
         WHERE id = ?`,
        [
            sessionId
        ]
    );

}

async function getActiveSession() {

    return dbGet(
        `SELECT *
         FROM daily_wyr_sessions
         WHERE status = 'active'
         ORDER BY id DESC
         LIMIT 1`
    );

}

async function getSessionForDate(
    questionDate
) {

    return dbGet(
        `SELECT *
         FROM daily_wyr_sessions
         WHERE question_date = ?`,
        [
            questionDate
        ]
    );

}

async function getVoteCounts(
    sessionId
) {

    const rows =
        await dbAll(
            `SELECT vote,
                    COUNT(*) AS count
             FROM daily_wyr_votes
             WHERE session_id = ?
             GROUP BY vote`,
            [
                sessionId
            ]
        );

    return rows.reduce(
        (counts, row) => ({
            ...counts,
            [row.vote]:
                row.count
        }),
        {
            a:
                0,
            b:
                0
        }
    );

}

async function getThread(
    client,
    threadId
) {

    if (
        !threadId
    )
        return null;

    return client.channels.cache.get(
        threadId
    ) ||
        await client.channels.fetch(
            threadId
        ).catch(
            () => null
        );

}

async function getThreadReplyCount(
    client,
    session
) {

    const thread =
        await getThread(
            client,
            session.thread_id
        );

    return Number(
        thread?.messageCount ?? 0
    );

}

async function archiveThread(
    client,
    session
) {

    const thread =
        await getThread(
            client,
            session.thread_id
        );

    if (
        !thread?.setArchived
    )
        return;

    await thread.setArchived(
        true,
        'Daily WYR closed'
    ).catch(
        () => null
    );

}

async function editClosedMessage(
    client,
    session,
    counts,
    threadReplyCount
) {

    if (
        !session.channel_id ||
        !session.message_id
    )
        return;

    const channel =
        client.channels.cache.get(
            session.channel_id
        ) ||
        await client.channels.fetch(
            session.channel_id
        ).catch(
            () => null
        );

    const message =
        await channel?.messages?.fetch(
            session.message_id
        ).catch(
            () => null
        );

    if (
        !message?.edit
    )
        return;

    await message.edit({
        embeds: [
            buildClosedEmbed(
                session,
                counts,
                threadReplyCount
            )
        ],
        components: [
            buildVoteRow(
                session,
                true
            )
        ]
    });

}

async function closeDailyWyrSession(
    client,
    session
) {

    if (
        !session ||
        session.status === 'closed'
    )
        return false;

    const counts =
        await getVoteCounts(
            session.id
        );

    const threadReplyCount =
        await getThreadReplyCount(
            client,
            session
        );

    await editClosedMessage(
        client,
        session,
        counts,
        threadReplyCount
    ).catch(
        () => null
    );

    await archiveThread(
        client,
        session
    );

    const result =
        await dbRun(
            `UPDATE daily_wyr_sessions
             SET status = 'closed',
                 closed_at = CURRENT_TIMESTAMP,
                 thread_reply_count = ?
             WHERE id = ?
             AND status = 'active'`,
            [
                threadReplyCount,
                session.id
            ]
        );

    return result.changes > 0;

}

async function closeOverdueDailyWyr(
    client
) {

    await closeBlockingDailyWyrSessions(
        client,
        new Date()
    );

}

async function closeBlockingDailyWyrSessions(
    client,
    now
) {

    const sessions =
        await dbAll(
            `SELECT *
             FROM daily_wyr_sessions
             WHERE status = 'active'
             AND closes_at <= ?
             ORDER BY closes_at ASC`,
            [
                now.toISOString()
            ]
        );

    for (
        const session of sessions
    )
        await closeDailyWyrSession(
            client,
            session
        );

}

async function createSession(
    questionDate
) {

    const question =
        await pickQuestion();

    const result =
        await dbRun(
            `INSERT INTO daily_wyr_sessions (
                question_date,
                question_id,
                option_a,
                option_b,
                closes_at
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                questionDate,
                question.id,
                question.optionA,
                question.optionB,
                getCloseTimestamp(
                    questionDate
                )
            ]
        );

    return getSession(
        result.lastID
    );

}

async function markSessionClosedAfterPostFailure(
    session
) {

    await dbRun(
        `UPDATE daily_wyr_sessions
         SET status = 'closed',
             closed_at = CURRENT_TIMESTAMP,
             post_claim_token = NULL,
             post_claimed_at = NULL
         WHERE id = ?`,
        [
            session.id
        ]
    );

}

async function claimSessionForPost(
    session
) {

    const claimToken =
        createPostClaimToken();

    const claimedAt =
        new Date().toISOString();

    const result =
        await dbRun(
            `UPDATE daily_wyr_sessions
             SET post_claim_token = ?,
                 post_claimed_at = ?
             WHERE id = ?
             AND posted_at IS NULL
             AND message_id IS NULL
             AND (
                 post_claim_token IS NULL
                 OR post_claimed_at IS NULL
                 OR post_claimed_at <= ?
             )`,
            [
                claimToken,
                claimedAt,
                session.id,
                getStalePostClaimCutoff()
            ]
        );

    if (
        result.changes === 0
    )
        return null;

    return getSession(
        session.id
    );

}

async function createThreadForMessage(
    message,
    questionDate
) {

    if (
        !message?.startThread
    )
        return null;

    return message.startThread({
        name:
            `Daily WYR - ${formatThreadDate(
                questionDate
            )}`,
        autoArchiveDuration:
            ThreadAutoArchiveDuration.OneDay,
        reason:
            'Daily Would You Rather discussion'
    }).catch(
        () => null
    );

}

async function updatePostedSession(
    session,
    message,
    thread
) {

    await dbRun(
        `UPDATE daily_wyr_sessions
         SET channel_id = ?,
             message_id = ?,
             thread_id = ?,
             post_claim_token = NULL,
             post_claimed_at = NULL,
             posted_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
            message.channelId,
            message.id,
            thread?.id ?? null,
            session.id
        ]
    );

    return getSession(
        session.id
    );

}

async function postDailyWyr(
    client,
    now = new Date()
) {

    if (
        now.getUTCHours() < resetHourUtc
    )
        return null;

    let session;

    const questionDate =
        getDailyQuestDate(
            now
        );

    const existingForDate =
        await getSessionForDate(
            questionDate
        );

    if (
        existingForDate
    ) {

        if (
            existingForDate.posted_at ||
            existingForDate.message_id
        )
            return existingForDate;

        if (
            hasFreshPostClaim(
                existingForDate
            )
        )
            return existingForDate;

        session =
            await retryUnpostedDailyWyrSession(
                questionDate
            );

        if (
            !session
        )
            return existingForDate;

    }
    else {

        await closeBlockingDailyWyrSessions(
            client,
            now
        );

        const activeSession =
            await getActiveSession();

        if (
            activeSession
        )
            return activeSession;

        session =
            await createSession(
                questionDate
            );

    }

    if (
        !session
    )
        return null;

    if (
        session.posted_at ||
        session.message_id
    )
        return session;

    session =
        await claimSessionForPost(
            session
        );

    if (
        !session
    )
        return getSessionForDate(
            questionDate
        );

    try {

        const channel =
            client.channels.cache.get(
                CHANNELS.GENERAL
            ) ||
            await client.channels.fetch(
                CHANNELS.GENERAL
            );

        if (
            !channel?.send
        )
            throw new Error(
                `General channel ${CHANNELS.GENERAL} is not sendable.`
            );

        const message =
            await channel.send({
                embeds: [
                    buildOpenEmbed(
                        session
                    )
                ],
                components: [
                    buildVoteRow(
                        session
                    )
                ]
            });

        const thread =
            await createThreadForMessage(
                message,
                questionDate
            );

        if (
            !thread
        )
            void logWarning(
                client,
                {
                    title:
                        'Daily WYR Thread Missing',
                    description:
                        `Daily WYR posted in <#${CHANNELS.GENERAL}>, but the discussion thread could not be created.`
                }
            );

        const postedSession =
            await updatePostedSession(
                session,
                message,
                thread
            );

        void logBotEvent(
            client,
            {
                title:
                    'Daily WYR Posted',
                description:
                    `Question ${postedSession.question_id} posted in <#${CHANNELS.GENERAL}>.`
            }
        );

        return postedSession;

    }
    catch (error) {

        await markSessionClosedAfterPostFailure(
            session
        );

        throw error;

    }

}

async function grantVoteReward(
    client,
    userId
) {

    await getOrCreateUser(
        userId
    );

    await Promise.all([
        addCoins(
            userId,
            ECONOMY.DAILY_WYR_VOTE_COINS,
            {
                source:
                    'daily_wyr'
            }
        ),
        addXP(
            userId,
            ECONOMY.DAILY_WYR_VOTE_XP
        )
    ]);

    await syncUserAchievementCounters(
        client,
        userId,
        [
            'wallet_coins',
            'xp_earned'
        ]
    );

}

async function updateDailyWyrVoteAchievement(
    client,
    userId
) {

    const row =
        await dbGet(
            `SELECT COUNT(*) AS count
             FROM daily_wyr_votes
             WHERE user_id = ?`,
            [
                userId
            ]
        );

    await setAchievementProgress(
        client,
        userId,
        'daily_wyr_votes',
        Number(
            row?.count ?? 0
        )
    );

}

async function recordVote(
    client,
    session,
    userId,
    vote
) {

    const insertResult =
        await dbRun(
            `INSERT OR IGNORE INTO daily_wyr_votes (
                session_id,
                user_id,
                vote,
                reward_claimed
            ) VALUES (?, ?, ?, 0)`,
            [
                session.id,
                userId,
                vote
            ]
        );

    if (
        insertResult.changes > 0
    ) {

        await grantVoteReward(
            client,
            userId
        );

        await dbRun(
            `UPDATE daily_wyr_votes
             SET reward_claimed = 1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE session_id = ?
             AND user_id = ?`,
            [
                session.id,
                userId
            ]
        );

        await updateDailyWyrVoteAchievement(
            client,
            userId
        );

        return {
            changed:
                true,
            firstVote:
                true,
            rewardGranted:
                true
        };

    }

    const existing =
        await dbGet(
            `SELECT *
             FROM daily_wyr_votes
             WHERE session_id = ?
             AND user_id = ?`,
            [
                session.id,
                userId
            ]
        );

    const changed =
        existing?.vote !== vote;

    if (
        changed
    )
        await dbRun(
            `UPDATE daily_wyr_votes
             SET vote = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE session_id = ?
             AND user_id = ?`,
            [
                vote,
                session.id,
                userId
            ]
        );

    let rewardGranted =
        false;

    if (
        existing &&
        !existing.reward_claimed
    ) {

        await grantVoteReward(
            client,
            userId
        );

        await dbRun(
            `UPDATE daily_wyr_votes
             SET reward_claimed = 1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE session_id = ?
             AND user_id = ?`,
            [
                session.id,
                userId
            ]
        );

        await updateDailyWyrVoteAchievement(
            client,
            userId
        );

        rewardGranted =
            true;

    }

    return {
        changed,
        firstVote:
            false,
        rewardGranted
    };

}

function voteLabel(
    vote
) {

    return vote === 'a'
        ? 'Option A'
        : 'Option B';

}

async function handleDailyWyrVote(
    interaction
) {

    const [
        ,
        sessionId,
        vote
    ] =
        interaction.customId.split(
            ':'
        );

    if (
        !sessionId ||
        ![
            'a',
            'b'
        ].includes(
            vote
        )
    ) {

        await interaction.reply({
            content:
                'That vote button is not valid anymore.',
            flags:
                64
        });

        return;

    }

    const session =
        await getSession(
            sessionId
        );

    if (
        !session
    ) {

        await interaction.reply({
            content:
                'That Daily WYR could not be found.',
            flags:
                64
        });

        return;

    }

    if (
        session.status !== 'active' ||
        new Date(
            session.closes_at
        ).getTime() <= Date.now()
    ) {

        await closeDailyWyrSession(
            interaction.client,
            session
        );

        await interaction.reply({
            content:
                'Voting is closed for this Daily WYR.',
            flags:
                64
        });

        return;

    }

    const result =
        await recordVote(
            interaction.client,
            session,
            interaction.user.id,
            vote
        );

    const lines = [
        result.firstVote
            ? `Vote counted for **${voteLabel(
                vote
            )}**.`
            : result.changed
                ? `Vote changed to **${voteLabel(
                    vote
                )}**.`
                : `You are still voting **${voteLabel(
                    vote
                )}**.`,
        result.rewardGranted
            ? `Reward claimed: **${ECONOMY.DAILY_WYR_VOTE_COINS} coins** + **${ECONOMY.DAILY_WYR_VOTE_XP} XP**.`
            : null
    ].filter(
        Boolean
    );

    await interaction.reply({
        content:
            lines.join(
                '\n'
            ),
        flags:
            64
    });

}

async function runDailyWyrTick(
    client
) {

    try {

        await closeOverdueDailyWyr(
            client
        );

        await postDailyWyr(
            client
        );

    }
    catch (error) {

        console.error(
            'DAILY WYR ERROR'
        );
        console.error(
            error
        );

        await logError(
            client,
            {
                title:
                    'Daily WYR Error',
                error
            }
        );

    }

}

function startDailyWyrScheduler(
    client
) {

    if (
        dailyWyrTimer
    )
        return;

    void runDailyWyrTick(
        client
    );

    scheduleNextDailyWyrTick(
        client
    );

    void logBotEvent(
        client,
        {
            title:
                'Daily WYR Scheduler Started',
            description:
                `Daily Would You Rather will post in <#${CHANNELS.GENERAL}> at 12:00 UTC.`
        }
    );

}

function scheduleNextDailyWyrTick(
    client
) {

    const nextResetMs =
        getNextResetTimestamp() * 1000;

    const delayMs =
        Math.max(
            1000,
            nextResetMs - Date.now()
        );

    dailyWyrTimer =
        setTimeout(
            async () => {

                await runDailyWyrTick(
                    client
                );

                scheduleNextDailyWyrTick(
                    client
                );

            },
            delayMs
        );

}

async function retryUnpostedDailyWyrSession(
    questionDate
) {

    const question =
        await pickQuestion();

    const result =
        await dbRun(
            `UPDATE daily_wyr_sessions
             SET question_id = ?,
                 option_a = ?,
                 option_b = ?,
                 channel_id = NULL,
                 message_id = NULL,
                 thread_id = NULL,
                 posted_at = NULL,
                 closes_at = ?,
                 closed_at = NULL,
                 status = 'active',
                 thread_reply_count = 0
             WHERE question_date = ?
             AND posted_at IS NULL
             AND message_id IS NULL
             AND (
                 post_claim_token IS NULL
                 OR post_claimed_at IS NULL
                 OR post_claimed_at <= ?
             )`,
            [
                question.id,
                question.optionA,
                question.optionB,
                getCloseTimestamp(
                    questionDate
                ),
                questionDate,
                getStalePostClaimCutoff()
            ]
        );

    if (
        result.changes === 0
    )
        return null;

    return getSessionForDate(
        questionDate
    );

}

module.exports = {
    closeDailyWyrSession,
    handleDailyWyrVote,
    postDailyWyr,
    runDailyWyrTick,
    startDailyWyrScheduler
};
