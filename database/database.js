const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const {
    runMigrations
} = require('./migrations');

const db = new sqlite3.Database('./database.db', (err) => {

    if (err) {
        console.error(err);
        return;
    }

    console.log('Connected to SQLite database.');

    const usersSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'users.sql'),
        'utf8'
    );

    const boostersSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'boosters.sql'),
        'utf8'
    );

    const dailyQuestsSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'daily_quests.sql'),
        'utf8'
    );

    const achievementsSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'achievements.sql'),
        'utf8'
    );

    const pregnancySchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'pregnancy.sql'),
        'utf8'
    );

    db.exec(`${usersSchema}\n${boostersSchema}\n${dailyQuestsSchema}\n${achievementsSchema}\n${pregnancySchema}`, async (err) => {

        if (err) {
            console.error(err);
            return;
        }

        await runMigrations(
            db
        );

        console.log('Database tables ready.');
    });
});

module.exports = db;
