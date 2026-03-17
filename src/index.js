const express = require('express');
const redis = require('redis');
const multer = require('multer');
const Minio = require('minio');

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = redis.createClient({
    socket: { host: process.env.REDIS_HOST || 'localhost', port: 6379 },
    password: process.env.REDIS_PASSWORD || ''
});
redisClient.connect().catch(console.error);

// MinIO Client
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_HOST || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9001,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'password'
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/data', async (req, res) => {
    try {
        const cached = await redisClient.get('data');
        if (cached) {
            return res.json({ source: 'cache', data: JSON.parse(cached) });
        }
        const data = { message: 'Fresh data', timestamp: new Date().toISOString() };
        await redisClient.setEx('data', 30, JSON.stringify(data));
        res.json({ source: 'fresh', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const fileName = `${Date.now()}-${req.file.originalname}`;
    try {
        await minioClient.putObject('public', fileName, req.file.buffer, req.file.size, {
            'Content-Type': req.file.mimetype
        });
        res.json({
            success: true,
            url: `https://cdn.oleeeedev.de/public/${fileName}`,
            fileName
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/files', async (req, res) => {
    try {
        const cached = await redisClient.get('files');
        if (cached) return res.json({ source: 'cache', files: JSON.parse(cached) });

        const files = [];
        const stream = minioClient.listObjects('public', '', true);
        stream.on('data', obj => files.push({ name: obj.name, size: obj.size, url: `https://cdn.oleeeedev.de/public/${obj.name}` }));
        stream.on('end', async () => {
            await redisClient.setEx('files', 10, JSON.stringify(files));
            res.json({ source: 'fresh', files });
        });
        stream.on('error', err => res.status(500).json({ error: err.message }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
module.exports = app;