// frontendService.js
const express = require('express');
const axios = require('axios'); // Import Axios to make HTTP requests to other services
const app = express();
const PORT = 4000; // Define the port on which this frontend service will run

// Base URL of the catalog service, where requests will be forwarded
const CATALOG_SERVICE_URL = 'http://localhost:3000';

app.use(express.json()); //Use express.json() middleware to parse JSON bodies in incoming requests

// Endpoint to search for books by topic, forwarding requests to the catalog service
app.get('/search/:topic', async (req, res) => {
    try {
        const response = await axios.get(`${CATALOG_SERVICE_URL}/search/${req.params.topic}`);
        res.status(response.status).json(response.data); //Respond to the client with the same status code and data received from the catalog service
    } catch (error) {
        if (error.response) {
            // If the catalog service responded with an error, forward its status and data to the client
            res.status(error.response.status).json(error.response.data);
        } else {
            // In case of other errors (e.g., network error), return a generic error message
            res.status(500).json({ error: "Error fetching books by topic from catalog service" });
        }
    }
});


// Endpoint to get book information by item number, forwarding requests to the catalog service
app.get('/info/:item_number', async (req, res) => {
    try {
         // Make a GET request to the catalog service's /info endpoint
        const response = await axios.get(`${CATALOG_SERVICE_URL}/info/${req.params.item_number}`);
        res.status(response.status).json(response.data);  // Forward the status and data as-is
    } catch (error) {
        if (error.response) {
            // Forward the exact status and response data from the catalog service
            res.status(error.response.status).json(error.response.data);
        } else {
            // In case of other errors (e.g., network error), return a generic error message
            res.status(500).json({ error: "Error fetching book info from catalog service" });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Frontend service running on port ${PORT}`);
});
