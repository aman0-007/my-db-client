const db = require('../config/db');

exports.getDbName = async (req, res) => {
    try {
        const result = await db.query('SELECT current_database() AS db_name;');
        res.json({ dbName: result.rows[0].db_name });
    } catch (err) {
        console.error('Error fetching DB name:', err);
        res.status(500).json({ error: 'Failed to fetch database name.' });
    }
};

exports.getTables = async (req, res) => {
    try {
        const query = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        const result = await db.query(query);
        res.json(result.rows.map(row => row.table_name));
    } catch (err) {
        console.error('Error fetching tables:', err);
        res.status(500).json({ error: 'Failed to fetch database schema.' });
    }
};

exports.getColumns = async (req, res) => {
    try {
        const { table } = req.params;
        const query = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = $1 
            ORDER BY ordinal_position;
        `;
        
        // Uses your existing db.query setup
        const result = await db.query(query, [table]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching columns:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.executeQuery = async (req, res) => {
    const { sql } = req.body;
    
    if (!sql) {
        return res.status(400).json({ error: "No SQL provided" });
    }

    try {
        const result = await db.query(sql);
        res.json({ results: result.rows });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
