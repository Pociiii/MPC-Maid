#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
    spawnSync
} = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');

const {
    runMigrations
} = require('../database/migrations');

const root = path.join(
    __dirname,
    '..'
);

const dotenvPath = path.join(
    root,
    '.env'
);

if (
    fs.existsSync(
        dotenvPath
    )
) {

    dotenv.config({
        path:
            dotenvPath,
        quiet:
            true
    });

}

const failures = [];
const warnings = [];
const notes = [];
const reminders = [];

function rel(
    filePath
) {

    return path.relative(
        root,
        filePath
    ).replace(
        /\\/g,
        '/'
    );

}

function exists(
    filePath
) {

    return fs.existsSync(
        path.join(
            root,
            filePath
        )
    );

}

function addFailure(
    message
) {

    failures.push(
        message
    );

}

function addWarning(
    message
) {

    warnings.push(
        message
    );

}

function addNote(
    message
) {

    notes.push(
        message
    );

}

function addReminder(
    message
) {

    reminders.push(
        message
    );

}

function plural(
    count,
    singular,
    pluralText
) {

    return count === 1
        ? singular
        : pluralText;

}

function isPlaceholder(
    value
) {

    return !value ||
        value.startsWith(
            'PASTE_'
        ) ||
        value.startsWith(
            'YOUR_'
        );

}

function isSnowflake(
    value
) {

    return /^\d{17,20}$/.test(
        String(
            value ?? ''
        )
    );

}

function readJson(
    filePath
) {

    return JSON.parse(
        fs.readFileSync(
            filePath,
            'utf8'
        )
    );

}

function walk(
    folder,
    predicate,
    skip = new Set()
) {

    if (
        !fs.existsSync(
            folder
        )
    )
        return [];

    const entries =
        fs.readdirSync(
            folder,
            {
                withFileTypes:
                    true
            }
        );

    return entries.flatMap(
        (entry) => {

            const entryPath =
                path.join(
                    folder,
                    entry.name
                );

            if (
                entry.isDirectory()
            ) {

                if (
                    skip.has(
                        entry.name
                    )
                )
                    return [];

                return walk(
                    entryPath,
                    predicate,
                    skip
                );

            }

            if (
                entry.isFile() &&
                predicate(
                    entryPath
                )
            )
                return [
                    entryPath
                ];

            return [];

        }
    );

}

function checkNodeVersion() {

    const major =
        Number(
            process.versions.node.split(
                '.'
            )[0]
        );

    if (
        major < 22 ||
        major >= 25
    ) {

        addFailure(
            `Node.js must be >=22 <25. Current: ${process.versions.node}`
        );

        return;

    }

    addNote(
        `Node.js ${process.versions.node} is in the supported range.`
    );

}

function checkRequiredFiles() {

    const requiredFiles = [
        'package.json',
        'package-lock.json',
        'index.js',
        '.env.example',
        'DEPLOYMENT.md',
        'TODO.md',
        'VERSION.txt'
    ];

    for (
        const filePath of requiredFiles
    ) {

        if (
            !exists(
                filePath
            )
        )
            addFailure(
                `Missing required project file: ${filePath}`
            );

    }

    if (
        !exists(
            '.env'
        )
    )
        addFailure(
            'Missing .env. Copy .env.example and fill the live bot values before hosting.'
        );

    if (
        !exists(
            'database.db'
        )
    )
        addFailure(
            'Missing database.db. Copy the live database before hosting.'
        );
    else {

        const size =
            fs.statSync(
                path.join(
                    root,
                    'database.db'
                )
            ).size;

        if (
            size === 0
        )
            addFailure(
                'database.db exists but is empty.'
            );

    }

    if (
        !exists(
            'backups'
        )
    )
        addWarning(
            'No backups folder found. The bot can create one, but make a server-level backup too.'
        );

    const gitignorePath =
        path.join(
            root,
            '.gitignore'
        );

    if (
        fs.existsSync(
            gitignorePath
        )
    ) {

        const gitignore =
            fs.readFileSync(
                gitignorePath,
                'utf8'
            );

        for (
            const privateEntry of [
                '.env',
                'database.db',
                'node_modules',
                'backups/'
            ]
        ) {

            if (
                !gitignore.includes(
                    privateEntry
                )
            )
                addFailure(
                    `.gitignore should include ${privateEntry}.`
                );

        }

    }
    else {

        addFailure(
            'Missing .gitignore.'
        );

    }

}

function checkEnv() {

    const requiredEnv = [
        'TOKEN',
        'CLIENT_ID',
        'GUILD_ID'
    ];

    for (
        const key of requiredEnv
    ) {

        if (
            isPlaceholder(
                process.env[key]
            )
        )
            addFailure(
                `.env is missing a real ${key} value.`
            );

    }

    for (
        const key of [
            'CLIENT_ID',
            'GUILD_ID'
        ]
    ) {

        if (
            process.env[key] &&
            !isSnowflake(
                process.env[key]
            )
        )
            addFailure(
                `${key} should be a Discord snowflake ID.`
            );

    }

    const ownerIds =
        (process.env.OWNER_IDS ?? '')
            .split(
                /[\s,;]+/
            )
            .filter(
                Boolean
            );

    if (
        ownerIds.length === 0 ||
        ownerIds.some(
            (id) =>
                isPlaceholder(
                    id
                )
        )
    )
        addWarning(
            'OWNER_IDS is empty or still a placeholder. Recovery and botcontrol will only allow the server owner/admin fallback.'
        );
    else if (
        ownerIds.some(
            (id) =>
                !isSnowflake(
                    id
                )
        )
    )
        addFailure(
            'OWNER_IDS should contain only Discord snowflake IDs separated by commas, spaces, or semicolons.'
        );

    addReminder(
        'Rotate the Discord bot token before final hosting, even if this file passes.'
    );

}

function checkConfiguredIds() {

    const {
        CHANNELS
    } = require('../data/constants');
    const roles = require('../data/roles.json');

    for (
        const [
            key,
            id
        ] of Object.entries(
            CHANNELS
        )
    ) {

        if (
            !isSnowflake(
                id
            )
        )
            addFailure(
                `CHANNELS.${key} is not a valid Discord snowflake.`
            );

    }

    for (
        const [
            key,
            id
        ] of Object.entries(
            roles
        )
    ) {

        if (
            !isSnowflake(
                id
            )
        )
            addFailure(
                `ROLES.${key} is not a valid Discord snowflake.`
            );

    }

    const duplicateChannelIds =
        findDuplicates(
            Object.values(
                CHANNELS
            )
        );

    if (
        duplicateChannelIds.length
    )
        addWarning(
            `Duplicate channel IDs configured: ${duplicateChannelIds.join(', ')}`
        );

    const duplicateRoleIds =
        findDuplicates(
            Object.values(
                roles
            )
        );

    if (
        duplicateRoleIds.length
    )
        addWarning(
            `Duplicate role IDs configured: ${duplicateRoleIds.join(', ')}`
        );

    addNote(
        `Configured ${Object.keys(CHANNELS).length} channels and ${Object.keys(roles).length} roles.`
    );

}

function findDuplicates(
    values
) {

    const seen =
        new Set();
    const duplicates =
        new Set();

    for (
        const value of values
    ) {

        if (
            seen.has(
                value
            )
        )
            duplicates.add(
                value
            );

        seen.add(
            value
        );

    }

    return [
        ...duplicates
    ];

}

function checkJavaScriptSyntax() {

    const files =
        walk(
            root,
            (filePath) =>
                filePath.endsWith(
                    '.js'
                ),
            new Set([
                '.git',
                '.npm-cache',
                'backups',
                'node_modules'
            ])
        );

    for (
        const filePath of files
    ) {

        const result =
            spawnSync(
                process.execPath,
                [
                    '--check',
                    filePath
                ],
                {
                    cwd:
                        root,
                    encoding:
                        'utf8'
                }
            );

        if (
            result.status !== 0
        )
            addFailure(
                `Syntax check failed for ${rel(filePath)}: ${(result.stderr || result.stdout).trim().split('\n')[0]}`
            );

    }

    addNote(
        `Checked JavaScript syntax for ${files.length} files.`
    );

}

function checkJsonData() {

    const jsonFiles = [
        path.join(
            root,
            'package.json'
        ),
        path.join(
            root,
            'package-lock.json'
        ),
        ...walk(
            path.join(
                root,
                'data'
            ),
            (filePath) =>
                filePath.endsWith(
                    '.json'
                )
        )
    ];

    for (
        const filePath of jsonFiles
    ) {

        try {

            readJson(
                filePath
            );

        }
        catch (error) {

            addFailure(
                `Invalid JSON in ${rel(filePath)}: ${error.message}`
            );

        }

    }

    addNote(
        `Parsed ${jsonFiles.length} JSON files.`
    );

}

function checkCommands() {

    const commandRoot =
        path.join(
            root,
            'commands'
        );

    const commandFiles =
        walk(
            commandRoot,
            (filePath) =>
                filePath.endsWith(
                    '.js'
                )
        );

    const commandNames =
        new Map();

    for (
        const filePath of commandFiles
    ) {

        const source =
            fs.readFileSync(
                filePath,
                'utf8'
            );

        if (
            !/\bdata\s*:/.test(
                source
            )
        )
            addFailure(
                `${rel(filePath)} does not expose command data.`
            );

        if (
            !/\bexecute\s*\(/.test(
                source
            )
        )
            addFailure(
                `${rel(filePath)} does not expose an execute function.`
            );

        const nameMatch =
            source.match(
                /\.setName\(\s*['"]([^'"]+)['"]\s*\)/
            );

        if (
            nameMatch
        ) {

            const commandName =
                nameMatch[1];

            if (
                commandNames.has(
                    commandName
                )
            )
                addFailure(
                    `Duplicate slash command name "${commandName}" in ${rel(filePath)} and ${rel(commandNames.get(commandName))}.`
                );

            commandNames.set(
                commandName,
                filePath
            );

        }
        else {

            addWarning(
                `Could not statically read slash command name from ${rel(filePath)}.`
            );

        }

    }

    if (
        commandFiles.length === 0
    )
        addFailure(
            'No command files found.'
        );

    addNote(
        `Found ${commandFiles.length} command files and ${commandNames.size} slash command names.`
    );

}

function checkAssets() {

    const requiredAssets = [
        'assets/member-card.png',
        'assets/mpcCrew-card.png',
        'assets/stilettoGang-card.png',
        'assets/tailoredFew-card.png',
        'assets/midnightCircle-card.png',
        'assets/ADP_logo.png'
    ];

    for (
        const asset of requiredAssets
    ) {

        if (
            !exists(
                asset
            )
        )
            addFailure(
                `Missing asset: ${asset}`
            );

    }

}

function summarizeArrayContent(
    folder,
    label
) {

    const folderPath =
        path.join(
            root,
            folder
        );

    const jsonFiles =
        walk(
            folderPath,
            (filePath) =>
                filePath.endsWith(
                    '.json'
                )
        );

    let files = 0;
    let total = 0;
    const emptyFiles = [];
    const badEntries = [];

    for (
        const filePath of jsonFiles
    ) {

        let data;

        try {

            data =
                readJson(
                    filePath
                );

        }
        catch {

            continue;

        }

        if (
            !Array.isArray(
                data
            )
        )
            continue;

        files += 1;
        total += data.length;

        if (
            data.length === 0
        )
            emptyFiles.push(
                rel(
                    filePath
                )
            );

        for (
            const [
                index,
                value
            ] of data.entries()
        ) {

            if (
                typeof value !== 'string' ||
                value.trim() === ''
            )
                badEntries.push(
                    `${rel(filePath)}[${index}]`
                );

        }

    }

    addNote(
        `${label}: ${total} ${plural(total, 'entry', 'entries')} across ${files} ${plural(files, 'file', 'files')}.`
    );

    return {
        emptyFiles,
        files,
        total,
        badEntries
    };

}

function checkContent() {

    const gifSummary =
        summarizeArrayContent(
            'data/gifs',
            'Interaction and horny GIFs'
        );

    if (
        gifSummary.files === 0 ||
        gifSummary.total === 0
    )
        addFailure(
            'No interaction GIF content found under data/gifs.'
        );

    for (
        const filePath of gifSummary.emptyFiles
    )
        addFailure(
            `Core GIF list is empty: ${filePath}`
        );

    for (
        const entry of gifSummary.badEntries
    )
        addFailure(
            `Core GIF list has a blank/non-string entry: ${entry}`
        );

    const coreSceneSummary =
        summarizeArrayContent(
            'data/scenes',
            'Core two-person scene GIFs'
        );

    if (
        coreSceneSummary.files === 0 ||
        coreSceneSummary.total === 0
    )
        addFailure(
            'No core two-person scene content found under data/scenes.'
        );

    for (
        const filePath of coreSceneSummary.emptyFiles
    )
        addFailure(
            `Core scene list is empty: ${filePath}`
        );

    for (
        const entry of coreSceneSummary.badEntries
    )
        addFailure(
            `Core scene list has a blank/non-string entry: ${entry}`
        );

    for (
        const [
            folder,
            label
        ] of [
            [
                'data/scenes_mfm',
                'Future MFM threesome scene GIFs'
            ],
            [
                'data/scenes_fmf',
                'Future FMF threesome scene GIFs'
            ],
            [
                'data/scenes_fff',
                'Future FFF threesome scene GIFs'
            ]
        ]
    ) {

        const summary =
            summarizeArrayContent(
                folder,
                label
            );

        if (
            summary.emptyFiles.length
        )
            addWarning(
                `${label} still has ${summary.emptyFiles.length} empty files. This matches parked TODO work, not current live commands.`
            );

    }

    checkSceneSubmitGroups();
    checkDailyWyrQuestions();
    checkSceneTitles();

}

function checkSceneTitles() {

    const filePath =
        path.join(
            root,
            'data',
            'scenes',
            'sceneNamesByCast.json'
        );

    if (
        !fs.existsSync(
            filePath
        )
    ) {

        addFailure(
            'Missing scene title data: data/scenes/sceneNamesByCast.json'
        );

        return;

    }

    const titleData =
        readJson(
            filePath
        );

    const requiredPools = [
        'mf',
        'ff',
        'shared'
    ];

    const seen =
        new Map();

    for (
        const pool of requiredPools
    ) {

        if (
            !Array.isArray(
                titleData[pool]
            )
        ) {

            addFailure(
                `Scene title pool ${pool} must be a list.`
            );

            continue;

        }

        for (
            const [
                index,
                title
            ] of titleData[pool].entries()
        ) {

            const normalized =
                String(
                    title ?? ''
                ).trim()
                    .toLowerCase();

            if (
                typeof title !== 'string' ||
                !normalized
            ) {

                addFailure(
                    `Scene title ${pool}[${index}] is blank or not a string.`
                );

                continue;

            }

            if (
                seen.has(
                    normalized
                )
            )
                addWarning(
                    `Duplicate scene title "${title}" appears in ${seen.get(normalized)} and ${pool}.`
                );
            else
                seen.set(
                    normalized,
                    pool
                );

        }

    }

    addNote(
        `Scene titles: ${seen.size} unique titles across ${requiredPools.length} pools.`
    );

}

function checkDailyWyrQuestions() {

    const filePath =
        path.join(
            root,
            'data',
            'wyr',
            'questions.json'
        );

    if (
        !fs.existsSync(
            filePath
        )
    ) {

        addFailure(
            'Missing Daily WYR question bank: data/wyr/questions.json'
        );

        return;

    }

    const questions =
        readJson(
            filePath
        );

    if (
        !Array.isArray(
            questions
        )
    ) {

        addFailure(
            'Daily WYR questions must be a JSON list.'
        );

        return;

    }

    if (
        questions.length === 0
    )
        addFailure(
            'Daily WYR question bank is empty.'
        );

    if (
        questions.length < 20
    )
        addWarning(
            'Daily WYR has fewer than 20 questions; repeats will happen quickly.'
        );

    const ids =
        new Set();

    questions.forEach(
        (question, index) => {

            const label =
                `data/wyr/questions.json[${index}]`;

            if (
                !question?.id ||
                typeof question.id !== 'string'
            )
                addFailure(
                    `${label} is missing a string id.`
                );
            else if (
                ids.has(
                    question.id
                )
            )
                addFailure(
                    `${label} has duplicate id ${question.id}.`
                );
            else
                ids.add(
                    question.id
                );

            if (
                !question?.optionA ||
                typeof question.optionA !== 'string'
            )
                addFailure(
                    `${label} is missing string optionA.`
                );

            if (
                !question?.optionB ||
                typeof question.optionB !== 'string'
            )
                addFailure(
                    `${label} is missing string optionB.`
                );

        }
    );

    addNote(
        `Daily WYR questions: ${questions.length} prompts.`
    );

}

function checkSceneSubmitGroups() {

    const {
        sceneGroups
    } = require('../data/sceneSubmitGroups');

    for (
        const [
            groupKey,
            group
        ] of Object.entries(
            sceneGroups
        )
    ) {

        for (
            const category of Object.keys(
                group.categories
            )
        ) {

            for (
                const sceneType of group.types
            ) {

                const filePath =
                    path.join(
                        root,
                        'data',
                        group.folder,
                        category,
                        `${sceneType}.json`
                    );

                if (
                    !fs.existsSync(
                        filePath
                    )
                ) {

                    addFailure(
                        `Scene submit group ${groupKey} points to missing file: ${rel(filePath)}`
                    );

                    continue;

                }

                const data =
                    readJson(
                        filePath
                    );

                if (
                    !Array.isArray(
                        data
                    )
                )
                    addFailure(
                        `Scene submit group ${groupKey} points to a non-list JSON file: ${rel(filePath)}`
                    );

            }

        }

    }

}

function checkDatabase() {

    const dbPath =
        path.join(
            root,
            'database.db'
        );

    if (
        !fs.existsSync(
            dbPath
        )
    )
        return Promise.resolve();

    const expectedTables = [
        'users',
        'user_boosters',
        'daily_quests',
        'daily_quest_bonus',
        'daily_quest_weekly_streaks',
        'daily_wyr_sessions',
        'daily_wyr_votes',
        'profile_likes',
        'user_achievements',
        'achievement_progress',
        'pregnancy_profiles',
        'pregnancy_daily_partners',
        'pregnancy_daily_checks',
        'pregnancies',
        'relationships',
        'relationship_requests',
        'spank_dilli_state',
        'user_activity_period_stats',
        'user_activity_moment_posts'
    ];

    const schemaFiles = [
        'users.sql',
        'boosters.sql',
        'daily_quests.sql',
        'daily_wyr.sql',
        'profile_likes.sql',
        'achievements.sql',
        'pregnancy.sql',
        'relationships.sql',
        'spank_dilli.sql'
    ];

    const schemaSql =
        schemaFiles.map(
            (fileName) =>
                fs.readFileSync(
                    path.join(
                        root,
                        'database',
                        'schemas',
                        fileName
                    ),
                    'utf8'
                )
        ).join(
            '\n'
        );

    return new Promise(
        (resolve) => {

            const db =
                new sqlite3.Database(
                    dbPath,
                    (error) => {

                        if (
                            error
                        ) {

                            addFailure(
                                `database.db could not be opened: ${error.message}`
                            );
                            resolve();

                        }

                    }
                );

            db.exec(
                schemaSql,
                async (schemaError) => {

                    if (
                        schemaError
                    ) {

                        addFailure(
                            `database.db schema preparation failed: ${schemaError.message}`
                        );
                        db.close(
                            () =>
                                resolve()
                        );
                        return;

                    }

                    try {

                        await runMigrations(
                            db
                        );

                    }
                    catch (migrationError) {

                        addFailure(
                            `database.db migration check failed: ${migrationError.message}`
                        );
                        db.close(
                            () =>
                                resolve()
                        );
                        return;

                    }

                    db.all(
                        `SELECT name
                         FROM sqlite_master
                         WHERE type = 'table'`,
                        (error, rows) => {

                            if (
                                error
                            ) {

                                addFailure(
                                    `database.db table check failed: ${error.message}`
                                );
                                db.close(
                                    () =>
                                        resolve()
                                );
                                return;

                            }

                            const existingTables =
                                new Set(
                                    rows.map(
                                        (row) =>
                                            row.name
                                    )
                                );

                            const missingTables =
                                expectedTables.filter(
                                    (table) =>
                                        !existingTables.has(
                                            table
                                        )
                                );

                            if (
                                missingTables.length
                            )
                                addFailure(
                                    `database.db is missing expected tables: ${missingTables.join(', ')}`
                                );

                            addNote(
                                `database.db schema is prepared and contains ${existingTables.size} tables.`
                            );

                            db.close(
                                () =>
                                    resolve()
                            );

                        }
                    );

                }
            );

        }
    );

}

function printReport() {

    console.log(
        'MPC Maid preflight'
    );
    console.log(
        '=================='
    );

    if (
        notes.length
    ) {

        console.log(
            '\nReady checks:'
        );

        for (
            const note of notes
        )
            console.log(
                `  [OK] ${note}`
            );

    }

    if (
        warnings.length
    ) {

        console.log(
            '\nWarnings:'
        );

        for (
            const warning of warnings
        )
            console.log(
                `  [WARN] ${warning}`
            );

    }

    if (
        reminders.length
    ) {

        console.log(
            '\nReminders:'
        );

        for (
            const reminder of reminders
        )
            console.log(
                `  [INFO] ${reminder}`
            );

    }

    if (
        failures.length
    ) {

        console.log(
            '\nFailures:'
        );

        for (
            const failure of failures
        )
            console.log(
                `  [FAIL] ${failure}`
            );

        console.log(
            '\nPreflight failed. Fix the failures before moving the bot to a server.'
        );
        process.exitCode = 1;
        return;

    }

    console.log(
        '\nPreflight passed. Stop the local bot, back up database.db, rotate the token, then move .env and database.db by hand.'
    );

}

async function main() {

    checkNodeVersion();
    checkRequiredFiles();
    checkEnv();
    checkConfiguredIds();
    checkJavaScriptSyntax();
    checkJsonData();
    checkCommands();
    checkAssets();
    checkContent();
    await checkDatabase();
    printReport();

}

main().catch(
    (error) => {

        console.error(
            error
        );
        process.exitCode = 1;

    }
);
