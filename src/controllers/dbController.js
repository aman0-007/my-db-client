const db = require('../config/db');

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