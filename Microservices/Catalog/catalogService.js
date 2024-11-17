const express = require('express');
const dbQueries = require('./dbQueries');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.json());

// Define replicas for synchronization
const replicas = [
    'http://catalog_1:3000', // First replica
    'http://catalog_2:3000', // Second replica
];

// Endpoint to search for books by topic
app.get('/search/:topic', (req, res) => {
    const topic = req.params.topic;

    dbQueries.queryBooksByTopic(topic, (err, rows) => {
        if (err) {
            console.error('Error querying books by topic:', err.message);
            res.status(500).json({ error: 'Error querying books by topic' });
        } else if (rows.length === 0) {
            res.status(404).json({ message: `No books found for topic: ${topic}` });
        } else {
            res.status(200).json(rows);
        }
    });
});

// Endpoint to get book information by item number
app.get('/info/:item_number', (req, res) => {
    const item_number = req.params.item_number;

    dbQueries.queryBookById(item_number, (err, row) => {
        if (err) {
            console.error('Error querying book by item number:', err.message);
            res.status(500).json({ error: 'Error querying book by item number' });
        } else if (!row) {
            res.status(404).json({ error: `Book with item number ${item_number} not found` });
        } else {
            res.status(200).json(row);
        }
    });
});

// Endpoint to update book quantity and price by item number
app.put('/update', async (req, res) => {
    const { item_number, newStock, newPrice, source } = req.body;
    console.log(`Received update request: item_number=${item_number}, newStock=${newStock}, newPrice=${newPrice}, source=${source || 'none'}`);

    try {
        // Update local database
        const changes = await new Promise((resolve, reject) => {
            dbQueries.updateBook(item_number, newStock, newPrice, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        if (changes === 0) {
            console.log(`Item not found: ${item_number}`);
            return res.status(404).json({ error: 'Book not found' });
        }

        console.log(`Book updated successfully in local database: item_number=${item_number}`);

        // Propagate update to all replicas, excluding the source
        for (const replica of replicas) {
            if (replica !== `http://${req.hostname}:${PORT}` && replica !== source) {
                try {
                    console.log(`Propagating update to replica: ${replica}`);
                    await axios.put(`${replica}/update`, {
                        item_number,
                        newStock,
                        newPrice,
                        source: `http://${req.hostname}:${PORT}` // Set current replica as the source
                    }, { timeout: 5000 });
                    console.log(`Successfully updated replica: ${replica}`);
                } catch (error) {
                    console.error(`Failed to update replica: ${replica}`, error.message);
                }
            }
        }

        // Invalidate cache in the frontend service
        try {
            console.log(`Invalidating cache for item_number: ${item_number} in frontend service`);
            await axios.post(`${frontendURL}/invalidate-cache`, { item_number });
            console.log(`Cache invalidated for item_number: ${item_number}`);
        } catch (error) {
            console.error(`Failed to invalidate cache for item_number: ${item_number} in frontend service`, error.message);
        }

        return res.json({ message: 'Book updated successfully on this replica' });
    } catch (error) {
        console.error('Error updating book:', error.message);
        return res.status(500).json({ error: 'Error updating book' });
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Catalog service running on port ${PORT}`);
});
