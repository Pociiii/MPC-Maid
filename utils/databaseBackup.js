const fs =
    require('fs');

const path =
    require('path');

const db =
    require('../database/database');

const {
    logBotEvent,
    logError
} = require('./inboxLogger');

const backupFolder =
    path.join(
        __dirname,
        '..',
        'backups'
    );

const backupTimeUtc = {
    hour:
        12,
    minute:
        5
};

let backupTimer =
    null;

function ensureBackupFolder() {

    fs.mkdirSync(
        backupFolder,
        {
            recursive:
                true
        }
    );

}

function timestamp() {

    return new Date()
        .toISOString()
        .replace(
            /[:.]/g,
            '-'
        );

}

function escapeSqlString(
    value
) {

    return value.replace(
        /'/g,
        "''"
    );

}

function createDatabaseBackup() {

    ensureBackupFolder();

    const filePath =
        path.join(
            backupFolder,
            `database-${timestamp()}.db`
        );

    return new Promise(
        (resolve, reject) =>
            db.exec(
                `VACUUM INTO '${escapeSqlString(
                    filePath
                )}'`,
                (error) =>
                    error
                        ? reject(
                            error
                        )
                        : resolve(
                            filePath
                        )
            )
    );

}

function getNextBackupDelay() {

    const now =
        new Date();

    const next =
        new Date(
            now
        );

    next.setUTCHours(
        backupTimeUtc.hour,
        backupTimeUtc.minute,
        0,
        0
    );

    if (
        next <= now
    ) {

        next.setUTCDate(
            next.getUTCDate() + 1
        );

    }

    return next.getTime() - now.getTime();

}

function scheduleNextBackup(
    client
) {

    backupTimer =
        setTimeout(
            async () => {

                try {

                    const filePath =
                        await createDatabaseBackup();

                    await logBotEvent(
                        client,
                        {
                            title:
                                'Database Backup Created',
                            description:
                                path.basename(
                                    filePath
                                )
                        }
                    );

                }
                catch (error) {

                    await logError(
                        client,
                        {
                            title:
                                'Database Backup Failed',
                            error
                        }
                    );

                }
                finally {

                    scheduleNextBackup(
                        client
                    );

                }

            },
            getNextBackupDelay()
        );

}

function startDatabaseBackups(
    client
) {

    if (
        backupTimer
    )
        return;

    scheduleNextBackup(
        client
    );

}

module.exports = {
    createDatabaseBackup,
    startDatabaseBackups
};
