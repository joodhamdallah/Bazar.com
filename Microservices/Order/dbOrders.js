// dbOrders.js
const db = require('./dbConnection');

// Function to record and track the purchase
function recordPurchase(item_number, callback) {
    const sql = `INSERT INTO purchases (item_number) VALUES (?)`;
    db.run(sql, [item_number], function (err) {
        callback(err);
    });
}

// Export the function
module.exports = {
    recordPurchase
};

// Initialize the purchases table if it doesn't exist
const createPurchasesTable = `
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number TEXT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

db.run(createPurchasesTable, (err) => {
    if (err) {
        console.error("Error creating purchases table:", err.message);
    } else {
        console.log("Purchases table initialized.");
    }
});
