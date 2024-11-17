process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const LRU = require('lru-cache');
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000;

// Cache configuration
const CACHE_MAX_ITEMS = 100;
const CACHE_TTL = 300 * 1000; //5 minutes

const cache = new LRU({
    max: CACHE_MAX_ITEMS,
    ttl: CACHE_TTL,
});

const catalogReplicas = [
    'http://catalog_1:3000', // First replica
    'http://catalog_2:3000', // Second replica
];

const orderReplicas = [
    'http://order_1:3001', // First replica
    'http://order_2:3001', // Second replica
];


// Indexes to track the next replica in the round-robin
let catalogIndex = 0;
let orderIndex = 0;

//round robin
function getNextReplica(replicas, isCatalog = true) {
    const index = isCatalog ? catalogIndex : orderIndex;
    const replica = replicas[index];
    if (isCatalog) {
        catalogIndex = (catalogIndex + 1) % replicas.length; // Increment catalog index
    } else {
        orderIndex = (orderIndex + 1) % replicas.length; // Increment order index
    }
    return replica;
}

app.use(express.json());

// Middleware to log after each response
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log('---------------------------------------------------------------------');
    });
    next();
});

// Endpoint to search for books by topic
app.get('/search/:topic', async (req, res) => {
    const topic = req.params.topic;

    // Check the cache
    const cachedData = cache.get(topic);
    if (cachedData) {
        console.log(`Cache hit for topic: ${topic}`);
        console.log('Cached Response:', cachedData);
        return res.status(200).json({
            source: "cache",
            data: cachedData,
        });
    }

    // Round-robin load balancing for catalog replicas
    const replica = getNextReplica(catalogReplicas, true);
    try {
        const response = await axios.get(`${replica}/search/${topic}`);
        console.log(`Cache miss for topic: ${topic}. Data fetched from replica: ${replica}`, response.data);

        // Cache the response
        cache.set(topic, response.data);

        res.status(response.status).json({
            source: replica,
            data: response.data,
        });
    } catch (error) {
        const errorMessage = error.response
            ? error.response.data
            : `Error fetching books for topic ${topic}`;
        console.error(`Error fetching topic ${topic}:`, error.message);
        const errorStatus = error.response ? error.response.status : 500;
        res.status(errorStatus).json({ error: errorMessage });
    }
});



// Endpoint to get book information by item number
app.get('/info/:item_number', async (req, res) => {
    const item_number = String(req.params.item_number); // Normalize key to string

    // Check the cache
    const cachedData = cache.get(item_number);
    if (cachedData) {
        console.log(`Cache hit for item number: ${item_number}`);
        console.log('Cached Response:', cachedData);
        return res.status(200).json({
            source: "cache",
            data: cachedData,
        });
    }

    // Fetch from catalog service on cache miss
    const replica = getNextReplica(catalogReplicas, true);
    try {
        const response = await axios.get(`${replica}/info/${item_number}`);
        console.log(`Cache miss for item number: ${item_number}. Data fetched from replica: ${replica}`, response.data);

        // Update the cache with the new data
        cache.set(item_number, response.data);
        console.log(`Cache updated for item number: ${item_number}, Cache size: ${cache.size}`);

        res.status(response.status).json({
            source: replica,
            data: response.data,
        });
    } catch (error) {
        const errorMessage = error.response
            ? error.response.data
            : `Error fetching book information for item number ${item_number}`;
        console.error(`Error fetching book information for item number ${item_number}:`, error.message);
        const errorStatus = error.response ? error.response.status : 500;
        res.status(errorStatus).json({ error: errorMessage });
    }
});

// Endpoint to process purchase requests
app.post('/purchase', async (req, res) => {
    // Round-robin load balancing for order replicas
    const replica = getNextReplica(orderReplicas,false);
    console.log(`Forwarding purchase request to replica: ${replica}`);

    try {
        const response = await axios.post(`${replica}/purchase`, req.body);
        console.log(`Purchase request forwarded to order replica: ${replica}`);
        res.status(response.status).json(response.data);
    } catch (error) {
        const errorMessage = error.response
            ? error.response.data
            : 'Error processing purchase through order service';
        console.error('Error processing purchase:', error.message);
        const errorStatus = error.response ? error.response.status : 500;
        res.status(errorStatus).json({ error: errorMessage });
    }
});

app.post('/invalidate-cache', (req, res) => {
    const item_number = String(req.body.item_number); // Normalize key to string

    // Log the current cache state before invalidation
    console.log(`Cache before invalidation for item: ${item_number}`, cache.peek(item_number));

    if (cache.has(item_number)) {
        cache.del(item_number);
        console.log(`Cache invalidated for item: ${item_number}`);
    } else {
        console.log(`Cache entry for item: ${item_number} does not exist.`);
    }

    // Log the cache state after invalidation
    console.log(`Cache after invalidation for item: ${item_number}`, cache.peek(item_number));

    res.status(200).json({ message: `Cache invalidation processed for item: ${item_number}` });
});



// Start the server
app.listen(PORT, () => {
    console.log(`Frontend service running on port ${PORT}`);
});
