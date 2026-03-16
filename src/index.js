const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Demo API läuft!',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/users', (req, res) => {
    res.json([
        { id: 1, name: 'Jakub', role: 'admin' },
        { id: 2, name: 'Mario', role: 'user' },
        { id: 3, name: 'Alex', role: 'user' }
    ]);
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});

module.exports = app;