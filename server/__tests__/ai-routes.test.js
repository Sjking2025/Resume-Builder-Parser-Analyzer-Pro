const request = require('supertest')
const app = require('../index')

describe('AI Routes Proxy', () => {
    it('GET /api/ai/health returns 503 when AI service is down', async () => {
        const res = await request(app).get('/api/ai/health')
        expect(res.status).toBe(503)
        expect(res.body).toHaveProperty('status', 'unhealthy')
    })

    it('POST /api/ai/import-resume without file returns 400', async () => {
        const res = await request(app).post('/api/ai/import-resume')
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
    })

    it('POST /api/ai/analyze handles missing body gracefully', async () => {
        const res = await request(app).post('/api/ai/analyze').send({})
        expect([500, 503]).toContain(res.status)
    })
})
