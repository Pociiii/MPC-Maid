const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const {
    runMigrations
} = require('./migrations');

let resolveReady;
let rejectReady;

const ready =
    new Promise(
        (resolve, reject) => {
            resolveReady = resolve;
            rejectReady = reject;
        }
    );

const db = new sqlite3.Database('./database.db', (err) => {

    if (err) {
        console.error(err);
        rejectReady(err);
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

    const dailyWyrSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'daily_wyr.sql'),
        'utf8'
    );

    const profileLikesSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'profile_likes.sql'),
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

    const relationshipsSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'relationships.sql'),
        'utf8'
    );

    const spankDilliSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'spank_dilli.sql'),
        'utf8'
    );

    const giftsSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'gifts.sql'),
        'utf8'
    );

    const lotterySchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'lottery.sql'),
        'utf8'
    );

    const commandGuideSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'command_guide.sql'),
        'utf8'
    );

    const memberCardPanelSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'member_card_panel.sql'),
        'utf8'
    );

    const gifSubmissionPanelSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'gif_submission_panel.sql'),
        'utf8'
    );

    const activeScenesSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'active_scenes.sql'),
        'utf8'
    );

    const communityProductionsSchema = fs.readFileSync(
        path.join(__dirname, 'schemas', 'community_productions.sql'),
        'utf8'
    );

    db.exec(`${usersSchema}\n${boostersSchema}\n${dailyQuestsSchema}\n${dailyWyrSchema}\n${profileLikesSchema}\n${achievementsSchema}\n${pregnancySchema}\n${relationshipsSchema}\n${spankDilliSchema}\n${giftsSchema}\n${lotterySchema}\n${commandGuideSchema}\n${memberCardPanelSchema}\n${gifSubmissionPanelSchema}\n${activeScenesSchema}\n${communityProductionsSchema}`, async (err) => {

        if (err) {
            console.error(err);
            rejectReady(err);
            return;
        }

        try {

            await runMigrations(
                db
            );

        }
        catch (error) {

            console.error(error);
            rejectReady(error);
            return;

        }

        console.log('Database tables ready.');
        resolveReady();
    });
});

db.ready =
    ready;

module.exports = db;
