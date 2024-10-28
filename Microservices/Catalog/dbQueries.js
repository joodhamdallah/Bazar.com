const db = require('./dbConnection');

// Function to create the 'books' table if it doesn't exist
function createBooksTable() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY,
            title TEXT,
            topic TEXT,
            quantity INTEGER,
            price REAL
        )`;
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating books table:', err.message);
        }
    });
}

// Function to initialize the books table with data if empty
function initializeBooksData() {
    db.get("SELECT COUNT(*) AS count FROM books", (err, row) => {
        if (row.count === 0) {
            const insert = 'INSERT INTO books (title, topic, quantity, price) VALUES (?, ?, ?, ?)';
            db.run(insert, ['How to get a good grade in DOS in 40 minutes a day', 'distributed systems', 10, 30]);
            db.run(insert, ['RPCs for Noobs', 'distributed systems', 5, 45]);
            db.run(insert, ['Xen and the Art of Surviving Undergraduate School', 'undergraduate school', 8, 20]);
            db.run(insert, ['Cooking for the Impatient Undergrad', 'undergraduate school', 12, 15]);
            console.log("Inserted initial data into books table.");
        }
    });
}

// Function to query books by topic
function queryBooksByTopic(topic, callback) {
    const sql = "SELECT * FROM books WHERE topic = ?";
    db.all(sql, [topic], (err, rows) => {
        callback(err, rows);
    });
}

// Function to query a book by item number
function queryBookById(item_number, callback) {
    const sql = "SELECT * FROM books WHERE id = ?";
    db.get(sql, [item_number], (err, row) => {
        callback(err, row);
    });
}

// Function to update book quantity and price by item number
function updateBook(item_number, newStock, newPrice, callback) {
    const sql = "UPDATE books SET quantity = ?, price = ? WHERE id = ?";
    db.run(sql, [newStock, newPrice, item_number], function (err) {
        callback(err, this.changes);
    });
}

// Initialize database tables and data
createBooksTable();
initializeBooksData();


module.exports = {
    createBooksTable,
    initializeBooksData,
    queryBooksByTopic,
    queryBookById,
    updateBook
};
