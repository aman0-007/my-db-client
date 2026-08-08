const { Pool } = require('pg');

let pool = null;

const connect = async (config) => {
    // Destroy existing pool if one exists
    if (pool) await pool.end();
    
    // Determine configuration style (URI vs standard)
    const poolConfig = config.connectionString 
        ? { connectionString: config.connectionString }
        : {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
        };

    pool = new Pool(poolConfig);

    // Test the connection immediately
    const client = await pool.connect();
    client.release();
    
    pool.on('error', (err) => {
        console.error('❌ Unexpected error on idle client', err);
    });
    
    console.log('🐘 Connected to the PostgreSQL database dynamically.');
};

const disconnect = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('🐘 Disconnected from the database.');
    }
};

const query = (text, params) => {
    if (!pool) throw new Error("Database not connected. Please connect first.");
    return pool.query(text, params);
};

module.exports = {
    connect,
    disconnect,
    query,
};