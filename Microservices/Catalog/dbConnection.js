const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbQueries = require('./dbQueries');



// Path to the SQLite database file
const dbPath = path.join(__dirname, 'catalog.db');

// Create a database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    } else {
        console.log('Connected to the catalog.db database');
    }
});


module.exports = db;
