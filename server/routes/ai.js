/**
 * AI Service Routes - Proxy to Python AI service
 */

const express = require('express')
const multer = require('multer')
const FormData = require('form-data')
const axios = require('axios')
const router = express.Router()

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// Python AI service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

/**
 * GET /api/ai/health
 * Check AI service health
 */
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/health`)
        return res.json(response.data)
    } catch (error) {
        return res.status(503).json({
            status: 'unhealthy',
            error: 'AI service is not running',
            aiServiceUrl: AI_SERVICE_URL
        })
    }
})

/**
 * POST /api/ai/import-resume
 * Parse a PDF resume and extract structured data for form auto-fill
 */
router.post('/import-resume', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' })
    }

    try {
        // Use form-data + axios for reliable multipart handling
        const formData = new FormData()
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: 'application/pdf'
        })

        const response = await axios.post(`${AI_SERVICE_URL}/import-resume`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        })

        return res.json(response.data)
    } catch (error) {
        console.error('Import Resume Error:', error.message)

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'AI service is not running',
                message: 'Please start the Python AI service'
            })
        }

        // Forward error from Python service
        if (error.response) {
            return res.status(error.response.status).json(error.response.data)
        }

        return res.status(500).json({ error: error.message })
    }
})

/**
 * POST /api/ai/analyze
 * Analyze resume data with AI (from editor)
 */
router.post('/analyze', async (req, res) => {
    try {
        const { resume_data, job_description } = req.body

        const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
            resume_data,
            job_description
        })

        return res.json(response.data)
    } catch (error) {
        console.error('Analyze Resume Error:', error.message)

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'AI service is not running',
                message: 'Please start the Python AI service'
            })
        }

        // Forward error from Python service
        if (error.response) {
            return res.status(error.response.status).json(error.response.data)
        }

        return res.status(500).json({ error: error.message })
    }
})

/**
 * POST /api/ai/analyze-pdf
 * Analyze uploaded PDF resume with AI
 */
router.post('/analyze-pdf', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' })
    }

    try {
        // Use form-data + axios for reliable multipart handling
        const formData = new FormData()
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: 'application/pdf'
        })

        // Add job description if provided
        if (req.body.job_description) {
            formData.append('job_description', req.body.job_description)
        }

        const response = await axios.post(`${AI_SERVICE_URL}/analyze-pdf`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        })

        return res.json(response.data)
    } catch (error) {
        console.error('Analyze PDF Error:', error.message)

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'AI service is not running',
                message: 'Please start the Python AI service'
            })
        }

        // Forward error from Python service
        if (error.response) {
            return res.status(error.response.status).json(error.response.data)
        }

        return res.status(500).json({ error: error.message })
    }
})

/**
 * POST /api/ai/portfolio-enhance
 * Transform resume data into portfolio-ready content
 */
router.post('/portfolio-enhance', async (req, res) => {
    try {
        const { resume_data } = req.body

        if (!resume_data) {
            return res.status(400).json({ error: 'No resume data provided' })
        }

        const response = await axios.post(`${AI_SERVICE_URL}/portfolio-enhance`, {
            resume_data
        })

        return res.json(response.data)
    } catch (error) {
        console.error('Portfolio Enhance Error:', error.message)

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'AI service is not running',
                message: 'Please start the Python AI service'
            })
        }

        // Forward error from Python service
        if (error.response) {
            return res.status(error.response.status).json(error.response.data)
        }

        return res.status(500).json({ error: error.message })
    }
})

/**
 * POST /api/ai/portfolio-enhance-stream
 * Stream portfolio generation with SSE (Server-Sent Events)
 */
router.post('/portfolio-enhance-stream', async (req, res) => {
    try {
        const { resume_data } = req.body

        if (!resume_data) {
            return res.status(400).json({ error: 'No resume data provided' })
        }

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no')
        res.flushHeaders()

        // Make streaming request to Python service
        const response = await axios.post(`${AI_SERVICE_URL}/portfolio-enhance-stream`, {
            resume_data
        }, {
            responseType: 'stream'
        })

        // Pipe the SSE stream directly to the client
        response.data.on('data', (chunk) => {
            res.write(chunk)
        })

        response.data.on('end', () => {
            res.end()
        })

        response.data.on('error', (err) => {
            console.error('SSE Stream Error:', err)
            res.write(`data: ${JSON.stringify({ error: err.message, progress: 0 })}\n\n`)
            res.end()
        })

    } catch (error) {
        console.error('Portfolio Stream Error:', error.message)

        // Send error as SSE event
        res.setHeader('Content-Type', 'text/event-stream')
        res.flushHeaders()

        if (error.code === 'ECONNREFUSED') {
            res.write(`data: ${JSON.stringify({
                error: 'AI service is not running',
                progress: 0,
                status: 'Service unavailable'
            })}\n\n`)
        } else {
            res.write(`data: ${JSON.stringify({
                error: error.message,
                progress: 0,
                status: 'Stream failed'
            })}\n\n`)
        }
        res.end()
    }
})

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL GAP ANALYZER ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/ai/skill-gap/analyze
 * Analyze skill gap between resume and job description
 */
router.post('/skill-gap/analyze', async (req, res) => {
    try {
        const { resume_data, job_description } = req.body

        if (!resume_data) {
            return res.status(400).json({ error: 'No resume data provided' })
        }
        if (!job_description) {
            return res.status(400).json({ error: 'No job description provided' })
        }

        const response = await axios.post(`${AI_SERVICE_URL}/skill-gap/analyze`, {
            resume_data,
            job_description
        })

        return res.json(response.data)
    } catch (error) {
        console.error('Skill Gap Analysis Error:', error.message)

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'AI service is not running',
                message: 'Please start the Python AI service'
            })
        }

        if (error.response) {
            return res.status(error.response.status).json(error.response.data)
        }

        return res.status(500).json({ error: error.message })
    }
})

/**
 * POST /api/ai/skill-gap/roadmap
 * Generate practice-focused roadmap from gap analysis
 */
router.post('/skill-gap/roadmap', async (req, res) => {
    try {
        const { gap_analysis, learner_profile } = req.body

        if (!gap_analysis) {
            return res.status(400).json({ error: 'No gap analysis provided' })
        }

        const response = await axios.post(`${AI_SERVICE_URL}/skill-gap/roadmap`, {
            gap_analysis,
            learner_profile
        })

        return res.json(response.data)
    } catch (error) {
        console.error('Roadmap Generation Error:', error.message)

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'AI service is not running',
                message: 'Please start the Python AI service'
            })
        }

        if (error.response) {
            return res.status(error.response.status).json(error.response.data)
        }

        return res.status(500).json({ error: error.message })
    }
})

/**
 * POST /api/ai/skill-gap/roadmap-stream
 * Stream roadmap generation with SSE
 */
router.post('/skill-gap/roadmap-stream', async (req, res) => {
    try {
        const { gap_analysis, learner_profile } = req.body

        if (!gap_analysis) {
            return res.status(400).json({ error: 'No gap analysis provided' })
        }

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no')
        res.flushHeaders()

        const response = await axios.post(`${AI_SERVICE_URL}/skill-gap/roadmap-stream`, {
            gap_analysis,
            learner_profile
        }, {
            responseType: 'stream'
        })

        response.data.on('data', (chunk) => {
            res.write(chunk)
        })

        response.data.on('end', () => {
            res.end()
        })

        response.data.on('error', (err) => {
            console.error('Roadmap Stream Error:', err)
            res.write(`data: ${JSON.stringify({ error: err.message, progress: 0 })}\n\n`)
            res.end()
        })

    } catch (error) {
        console.error('Roadmap Stream Error:', error.message)

        res.setHeader('Content-Type', 'text/event-stream')
        res.flushHeaders()

        res.write(`data: ${JSON.stringify({
            error: error.code === 'ECONNREFUSED' ? 'AI service is not running' : error.message,
            progress: 0,
            status: 'Stream failed'
        })}\n\n`)
        res.end()
    }
})

/**
 * POST /api/ai/skill-gap/roadmap/modify
 * AI-powered roadmap modification based on natural language
 */
router.post('/skill-gap/roadmap/modify', async (req, res) => {
    try {
        const { current_roadmap, modification_request } = req.body

        if (!current_roadmap) {
            return res.status(400).json({ error: 'No roadmap provided' })
        }
        if (!modification_request) {
            return res.status(400).json({ error: 'No modification request provided' })
        }

        const response = await axios.post(`${AI_SERVICE_URL}/skill-gap/roadmap/modify`, {
            current_roadmap,
            modification_request
        })

        return res.json(response.data)
    } catch (error) {
        console.error('Roadmap Modify Error:', error.message)

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'AI service is not running',
                message: 'Please start the Python AI service'
            })
        }

        if (error.response) {
            return res.status(error.response.status).json(error.response.data)
        }

        return res.status(500).json({ error: error.message })
    }
})

module.exports = router


