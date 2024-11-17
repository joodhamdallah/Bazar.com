const express = require('express');
const axios = require('axios'); // For HTTP requests
const dbOrders = require('./dbOrders'); 
const app = express();
const PORT = 3001;

app.use(express.json());

// Catalog replicas for load balancing
const catalogReplicas = [
    'http://catalog_1:3000',
    'http://catalog_2:3000'
];

// Frontend service URL
const frontendURL = 'http://frontend:4000';

// Index for round-robin load balancing
let catalogIndex = 0;

// Helper function for round-robin load balancing
function getNextCatalogReplica() {
    const replica = catalogReplicas[catalogIndex];
    catalogIndex = (catalogIndex + 1) % catalogReplicas.length; // Increment and loop index
    return replica;
}

// Endpoint to handle purchase requests
app.post('/purchase', async (req, res) => {
    const { item_number } = req.body;
    console.log(`Processing purchase request for item_number: ${item_number}`);

    try {
        const catalogReplica = getNextCatalogReplica();
        console.log(`Fetching book info from catalog replica: ${catalogReplica}`);

        const catalogResponse = await axios.get(`${catalogReplica}/info/${item_number}`);
        const book = catalogResponse.data;

        console.log(`Fetched book info:`, book);

        if (book.quantity > 0) {
            const newStock = book.quantity - 1;

            for (const replica of catalogReplicas) {
                console.log(`Updating stock on catalog replica: ${replica}`);
                try {
                    await axios.put(`${replica}/update`, {
                        item_number,
                        newStock,
                        newPrice: book.price,
                    });
                    console.log(`Stock updated on catalog replica: ${replica}`);
                } catch (updateError) {
                    console.error(`Failed to update catalog replica: ${replica}`, updateError.message);
                }
            }

            // Notify frontend to invalidate cache
            try {
                console.log(`Notifying frontend to invalidate cache for item_number: ${item_number}`);
                await axios.post(`${frontendURL}/invalidate-cache`, { item_number });
                console.log(`Cache invalidation sent for item_number: ${item_number}`);
            } catch (invalidationError) {
                console.error(`Failed to invalidate cache for item_number: ${item_number}`, invalidationError.message);
            }

            // Record the purchase
            dbOrders.recordPurchase(item_number, (err) => {
                if (err) {
                    console.error("Error recording purchase:", err.message);
                } else {
                    console.log("Purchase recorded successfully.");
                }
            });

            return res.json({ message: "Purchase successful!", item: book.title });
        } else {
            console.log(`Item is out of stock: ${item_number}`);
            return res.status(400).json({ error: "Item is out of stock" });
        }
    } catch (mainError) {
        console.error(`Error processing purchase for item_number: ${item_number}`, mainError.message);
        return res.status(500).json({ error: "Error processing purchase" });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
});
