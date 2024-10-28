const sqlite3 = require('sqlite3').verbose(); // Import the sqlite3 with verbose  for more detailed error messages
const path = require('path');  //// Import the 'path' module to handle and manipulate file paths
const dbQueries = require('./dbQueries'); //Import the dbQueries module for executing  catalog SQL statements



// Path to the SQLite database file + OPEN_READWRITE allows reading and writing to the database
const dbPath = path.join(__dirname, 'catalog.db');

// Create a database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message); //Error message if the connection fails
    } else {
        console.log('Connected to the catalog.db database'); //Successful connection to the database
    }
});


module.exports = db; //Export db module to be used in other modules
