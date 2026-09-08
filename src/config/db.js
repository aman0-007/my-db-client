const { Pool } = require('pg');
const { createTunnel } = require('tunnel-ssh');

let pool = null;
let sshTunnelServer = null; // Track the SSH tunnel so we can close it later

const connect = async (config) => {
    // Destroy existing connections cleanly
    await disconnect();
    
    let poolConfig = {};

    if (config.ssh) {
        // Generate a random local port between 10000 and 65000 to prevent conflicts
        // with any local Postgres instances you might have running.
        const localPort = Math.floor(Math.random() * (65000 - 10000) + 10000); 
        
        const tunnelOptions = { autoClose: false };
        const serverOptions = { port: localPort };
        const sshOptions = {
            host: config.ssh.host,
            port: config.ssh.port,
            username: config.ssh.user,
            password: config.ssh.password,
            keepaliveInterval: 10000,
            keepaliveCountMax: 3
        };
        const forwardOptions = {
            srcAddr: '127.0.0.1',
            srcPort: localPort,
            dstAddr: config.host || '127.0.0.1', // The DB Host inside the VPS (usually localhost)
            dstPort: config.port || 5432
        };

        try {
            console.log(`🔒 Establishing SSH Tunnel to ${config.ssh.host}...`);
            // createTunnel returns an array [server, client]
            const [server] = await createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);
            sshTunnelServer = server;
            
            // Re-route the Postgres connection through our new secure tunnel
            poolConfig = {
                host: '127.0.0.1',
                port: localPort,
                user: config.user,
                password: config.password,
                database: config.database
            };
            console.log(`✅ SSH Tunnel established on local port ${localPort}`);
        } catch (err) {
            throw new Error(`SSH Tunnel Failed: ${err.message}`);
        }
    } else if (config.connectionString) {
        poolConfig = { connectionString: config.connectionString };
    } else {
        // Standard direct connection
        poolConfig = {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
        };
    }

    // Initialize Postgres Pool
    pool = new Pool(poolConfig);

    // Test the connection immediately
    const client = await pool.connect();
    client.release();
    
    pool.on('error', (err) => {
        console.error('❌ Unexpected error on idle client', err);
    });
    
    console.log('🐘 Connected to the PostgreSQL database successfully.');
};

const disconnect = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('🐘 Disconnected from the database.');
    }
    // Teardown the SSH tunnel if it exists
    if (sshTunnelServer) {
        sshTunnelServer.close();
        sshTunnelServer = null;
        console.log('🔒 SSH Tunnel closed.');
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