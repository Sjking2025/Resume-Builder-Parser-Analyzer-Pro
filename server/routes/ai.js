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

module.exports = router


