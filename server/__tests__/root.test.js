const request = require('supertest')
const app = require('../index')

describe('Root Endpoint', () => {
    it('GET / returns API info', async () => {
        const res = await request(app).get('/')
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message')
        expect(res.body).toHaveProperty('endpoints')
        expect(Array.isArray(res.body.endpoints)).toBe(true)
    })
})
