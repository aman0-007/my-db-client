// src/app.js
const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

module.exports = app;