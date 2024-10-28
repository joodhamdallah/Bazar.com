// frontendService.js
const express = require('express');
const axios = require('axios'); // Import Axios to make HTTP requests to other services
const app = express();
const PORT = 4000; // Define the port on which this frontend service will run

// Base URLs of the catalog and order service, where requests will be forwarded
const CATALOG_SERVICE_URL = 'http://catalog:3000';
const ORDER_SERVICE_URL = 'http://order:3001';

app.use(express.json()); // Use express.json() middleware to parse JSON bodies in incoming requests

// Endpoint to search for books by topic, forwarding requests to the catalog service
app.get('/search/:topic', async (req, res) => {
    try {
        const response = await axios.get(`${CATALOG_SERVICE_URL}/search/${req.params.topic}`);
        console.log("Search by topic Response:", response.data); // Log successful search response
        res.status(response.status).json(response.data); // Respond to the client with the same status code and data received from the catalog service
    } catch (error) {
        if (error.response) {
            //console.log("Error Response:", error.response.data); // Log error response from catalog service
            res.status(error.response.status).json(error.response.data);
        } else {
            const genericError = { error: "Error fetching books by topic from catalog service" };
           // console.log("General Search Error:", genericError); // Log general search error
            res.status(500).json(genericError);
        }
    }
});

// Endpoint to get book information by item number, forwarding requests to the catalog service
app.get('/info/:item_number', async (req, res) => {
    try {
        // Make a GET request to the catalog service's /info endpoint
        const response = await axios.get(`${CATALOG_SERVICE_URL}/info/${req.params.item_number}`);
        //console.log("Book Info Response:", response.data); // Log successful book info response
        res.status(response.status).json(response.data);  // Forward the status and data as-is
    } catch (error) {
        if (error.response) {
            //console.log("Book Info Error Response:", error.response.data); // Log error response from catalog service
            res.status(error.response.status).json(error.response.data);
        } else {
            const genericError = { error: "Error fetching book info from catalog service" };
            //console.log("General Book Info Error:", genericError); // Log general book info error
            res.status(500).json(genericError);
        }
    }
});

// Endpoint to process purchase requests
app.post('/purchase', async (req, res) => {
    try {
        // Forward the request to the order service
        const response = await axios.post(`${ORDER_SERVICE_URL}/purchase`, req.body);
        //console.log("Purchase Response:", response.data); // Log successful purchase response
        res.status(response.status).json(response.data); // Respond with the same status and data received from the order service
    } catch (error) {
        if (error.response) {
            //console.log("Error Response:", error.response.data); // Log error response from order service
            res.status(error.response.status).json(error.response.data);
        } else {
            const genericError = { error: "Error processing purchase through order service" };
           // console.log("General Purchase Error:", genericError); // Log general purchase error
            res.status(500).json(genericError);
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Frontend service running on port ${PORT}`);
});
