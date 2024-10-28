// orderService.js
const express = require('express');
const axios = require('axios'); // Used for passing HTTP requests to the frontend 
const dbOrders = require('./dbOrders'); 
const app = express();
const PORT = 3001;

app.use(express.json());

// Endpoint to handle purchase requests
app.post('/purchase', async (req, res) => {
    const { item_number } = req.body;

    try {
        //Query the catalog service to check if the book is in stock
        const catalogResponse = await axios.get(`http://localhost:3000/info/${item_number}`);
        const book = catalogResponse.data;

        if (book.quantity > 0) {
            //  Decrement the quantity in the catalog by 1
            const newStock = book.quantity - 1;

            // Update the catalogstock
            await axios.put(`http://localhost:3000/update`, {
                item_number,
                newStock,
                newPrice: book.price // Price remains unchanged
            });

            //  Record purchase in the orders table
            dbOrders.recordPurchase(item_number, (err) => {
                if (err) {
                    console.error("Error recording purchase:", err.message);
                } else {
                    console.log("Purchase recorded successfully.");
                }
            });

            res.json({ message: "Purchase successful!", item: book.title });
        } else {
            res.status(400).json({ error: "Item is out of stock" });
        }
    } catch (error) {
        console.error("Error processing purchase:", error.message);
        res.status(500).json({ error: "Error processing purchase" });
    }
});

// here to start the server
app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
});
