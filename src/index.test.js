const request = require('supertest');

jest.mock('redis', () => ({
    createClient: () => ({
        connect: jest.fn().mockResolvedValue(null),
        get: jest.fn().mockResolvedValue(null),
        setEx: jest.fn().mockResolvedValue(null),
        on: jest.fn()
    })
}));

jest.mock('minio', () => ({
    Client: jest.fn().mockImplementation(() => ({
        putObject: jest.fn().mockResolvedValue(null),
        listObjects: jest.fn().mockReturnValue({
            on: jest.fn().mockImplementation(function(event, cb) {
                if (event === 'end') cb();
                return this;
            })
        })
    }))
}));

const app = require('./index');

describe('API Tests', () => {
    test('GET /health gibt ok zurück', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    test('GET /data gibt 200 zurück', async () => {
        const res = await request(app).get('/data');
        expect(res.statusCode).toBe(200);
    });

    test('GET /files gibt 200 zurück', async () => {
        const res = await request(app).get('/files');
        expect(res.statusCode).toBe(200);
    });
});