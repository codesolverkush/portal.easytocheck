const NodeCache = require("node-cache");
const myCache = new NodeCache(); // Initialize cache

const getAllCache = async (req, res) => {
    try {
        const keys = myCache.keys(); // Get all cache keys
        const cacheData = keys.map(key => ({ key, value: myCache.get(key) })); // Fetch values for each key

        if (cacheData.length > 0) {
            return res.status(200).json({ cache: cacheData });
        } else {
            return res.status(404).json({ message: "No cache data found" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = getAllCache;
