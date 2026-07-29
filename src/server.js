// src/server.js
require('dotenv').config(); 
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Database Client UI running on port ${PORT}`);
    console.log(`➡️  Access the UI at http://localhost:${PORT}`);
});