// frontendService.js
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000;

// Base URL of the catalog service
const CATALOG_SERVICE_URL = 'http://localhost:3000';

app.use(express.json());

// Endpoint to search for books by topic (mirrors catalog's /search/:topic)
app.get('/search/:topic', async (req, res) => {
    try {
        const response = await axios.get(`${CATALOG_SERVICE_URL}/search/${req.params.topic}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error fetching books by topic from catalog service" });
    }
});

// Endpoint to get book information by item number (mirrors catalog's /info/:item_number)
app.get('/info/:item_number', async (req, res) => {
    try {
        const response = await axios.get(`${CATALOG_SERVICE_URL}/info/${req.params.item_number}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error fetching book info from catalog service" });
    }
});

// Endpoint to update book quantity and price by item number (mirrors catalog's /update)
app.put('/update', async (req, res) => {
    try {
        const response = await axios.put(`${CATALOG_SERVICE_URL}/update`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error updating book in catalog service" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Frontend service running on port ${PORT}`);
});
