const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

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

    db.exec(usersSchema, (err) => {

        if (err) {
            console.error(err);
            return;
        }

        console.log('Database tables ready.');
    });
});

module.exports = db;