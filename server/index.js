/**
 * Resume Builder Express Backend Server
 * Proxies requests to Python AI service and handles PDF generation
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 5000

// Security headers
app.use(helmet())

// CORS — explicit origin only
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}))

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' }
})
app.use(globalLimiter)

app.use(express.json({ limit: '10mb' }))

// AI Service URL (from environment or default)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
console.log(`AI Service URL: ${AI_SERVICE_URL}`)

// Routes
const aiRoutes = require('./routes/ai')
const pdfRoutes = require('./routes/pdf')

app.use('/api/ai', aiRoutes)
app.use('/api/pdf', pdfRoutes)

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'resume-builder-backend',
        aiServiceUrl: AI_SERVICE_URL
    })
})

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Resume Builder Backend API',
        endpoints: ['/api/ai/health', '/api/ai/import-resume', '/api/pdf/export']
    })
})

// Start server (skip during tests)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`)
    })
}

module.exports = app
