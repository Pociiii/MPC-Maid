const sqlite3 = require('sqlite3').verbose();

// Open database (creates it if it doesn't exist)
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database.');

        // Create users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                coins INTEGER DEFAULT 0
            )
        `);

        // Create pregnancies table
        db.run(`
            CREATE TABLE IF NOT EXISTS pregnancies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mother_id TEXT NOT NULL,
                father_id TEXT,
                gestation_day INTEGER DEFAULT 1,
                created_at INTEGER NOT NULL
            )
        `);

        // Create relationships table
        db.run(`
            CREATE TABLE IF NOT EXISTS relationships (
                user1 TEXT NOT NULL,
                user2 TEXT NOT NULL,
                married INTEGER DEFAULT 0,
                PRIMARY KEY (user1, user2)
            )
        `);

        console.log('Database tables ready.');
    }
});

module.exports = db;