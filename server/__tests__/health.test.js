const request = require('supertest')
const app = require('../index')

describe('Health Endpoint', () => {
    it('GET /health returns status healthy', async () => {
        const res = await request(app).get('/health')
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('status', 'healthy')
        expect(res.body).toHaveProperty('service', 'resume-builder-backend')
    })
})
