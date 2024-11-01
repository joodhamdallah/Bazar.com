// catalogService.js
const express = require('express'); //Import Express framework to create a web server and handle routes
const dbQueries = require('./dbQueries'); //Import dbQueries module which contains functions to interact with catalog DB
const app = express(); //Initialize an Express application
const PORT = 3000; // Define the port the catalogService will listen on

app.use(express.json()); //Use express.json() middleware to parse JSON bodies in requests

// Endpoint to search for books by topic
app.get('/search/:topic', (req, res) => {
    const topic = req.params.topic; // Extract the topic parameter from the URL
    
    // Call the dbQueries function to find books by the specified topic
    dbQueries.queryBooksByTopic(topic, (err, rows) => {
        if (err) {
            const errorMessage = { error: "Error querying books by topic" };
            console.log("Search by topic Response:", errorMessage); // Log error response
            res.status(500).json(errorMessage);
        } else if (rows.length === 0) {
            const notFoundMessage = { message: `No books found for topic: ${topic}` };
            console.log("Search by topic Response:", notFoundMessage); // Log no books found response
            res.status(404).json(notFoundMessage);
        } else {
            console.log("Search by topic Response:", rows); // Log successful response
            res.status(200).json(rows); // Successfully found books
        }
    });
});

// Endpoint to get book information by item number
app.get('/info/:item_number', (req, res) => {
    const item_number = req.params.item_number; // Extract the item_number parameter from the URL
    
    // Call the dbQueries function to get information about the specified book
    dbQueries.queryBookById(item_number, (err, row) => {
        if (err) {
            const errorMessage = { error: "Error querying book by item number" };
            console.log("Item info Response:", errorMessage); // Log error response
            res.status(500).json(errorMessage);
        } else if (!row) {
            const notFoundMessage = { error: `Book with item number ${item_number} not found` };
            console.log("Item info Response:", notFoundMessage); // Log book not found response
            res.status(404).json(notFoundMessage);
        } else {
            console.log("Item info Response:", row); // Log successful response
            res.status(200).json(row); // Successfully found book
        }
    });
});

// Endpoint to update book quantity and price by item number
app.put('/update', (req, res) => {
    const { item_number, newStock, newPrice } = req.body; // Extract the item_number, newStock, and newPrice values from the request body

    // Call the dbQueries function to update the book's quantity and price
    dbQueries.updateBook(item_number, newStock, newPrice, (err, changes) => {
        if (err) {
            const errorMessage = { error: "Error updating book" };
            console.log("Update item Response:", errorMessage); // Log error response
            res.status(500).json(errorMessage);
        } else if (changes === 0) {
            const notFoundMessage = { error: "Book not found" };
            console.log("Update item Response:", notFoundMessage); // Log book not found response
            res.status(404).json(notFoundMessage);
        } else {
            const successMessage = { message: "Book updated successfully" };
            console.log("Update item Response:", successMessage); // Log successful response
            res.json(successMessage);
        }
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Catalog service running on port ${PORT}`);
});