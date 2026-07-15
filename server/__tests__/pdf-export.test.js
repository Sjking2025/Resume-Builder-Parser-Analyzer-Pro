const request = require('supertest')
const app = require('../index')

describe('PDF Export', () => {
    it('POST /api/pdf/export without html returns 400', async () => {
        const res = await request(app).post('/api/pdf/export').send({})
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
    })

    it('POST /api/pdf/export with html returns 200 (HTML fallback when puppeteer unavailable)', async () => {
        const res = await request(app).post('/api/pdf/export').send({
            html: '<html><body><h1>Test Resume</h1></body></html>'
        })
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('html')
        expect(res.body).toHaveProperty('suggestion')
    })
})
