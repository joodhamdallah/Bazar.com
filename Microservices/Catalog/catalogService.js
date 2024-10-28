// catalogService.js
const express = require('express');
const dbQueries = require('./dbQueries');
const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint to search for books by topic
app.get('/search/:topic', (req, res) => {
    const topic = req.params.topic;
    dbQueries.queryBooksByTopic(topic, (err, rows) => {
        if (err) {
            res.status(500).json({ error: "Error querying books by topic" });
        } else {
            res.json(rows);
        }
    });
});

// Endpoint to get book information by item number
app.get('/info/:item_number', (req, res) => {
    const item_number = req.params.item_number;
    dbQueries.queryBookById(item_number, (err, row) => {
        if (err) {
            res.status(500).json({ error: "Error querying book by item number" });
        } else if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: "Book not found" });
        }
    });
});

// Endpoint to update book quantity and price by item number
app.put('/update', (req, res) => {
    const { item_number, newStock, newPrice } = req.body;
    dbQueries.updateBook(item_number, newStock, newPrice, (err, changes) => {
        if (err) {
            res.status(500).json({ error: "Error updating book" });
        } else if (changes === 0) {
            res.status(404).json({ error: "Book not found" });
        } else {
            res.json({ message: "Book updated successfully" });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Catalog service running on port ${PORT}`);
});
