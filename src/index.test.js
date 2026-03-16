const request = require('supertest');
const app = require('./index');

describe('API Tests', () => {
    test('GET / gibt 200 zurück', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Demo API läuft!');
    });

    test('GET /health gibt ok zurück', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    test('GET /users gibt Liste zurück', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(3);
    });
});