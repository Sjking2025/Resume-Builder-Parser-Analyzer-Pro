/**
 * Resume Builder Express Backend Server
 * Proxies requests to Python AI service and handles PDF generation
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})

module.exports = app
