// dbConnection.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize the SQLite database 
const dbPath = path.join(__dirname, 'orders.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the orders database:', err.message);
    } else {
        console.log('Connected to the orders database.');
    }
});

// Export the db instance for use in other files
module.exports = db;
