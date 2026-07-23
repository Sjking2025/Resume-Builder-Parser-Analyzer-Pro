/**
 * AI Service Routes - Proxy to Python AI service
 *
 * SECURITY MODEL (Ephemeral API Key Override)
 * ─────────────────────────────────────────────
 * Users can provide their own AI API key via the frontend.
 * The key is stored ONLY in sessionStorage (cleared on tab close)
 * and injected into every request as the 'x-ai-api-key' header.
 *
 * This gateway MUST:
 *  1. Forward the header to the Python AI service via getHeaders(req)
 *  2. NEVER log raw API keys (use safeLogError instead)
 *  3. NEVER persist the key to disk, database, or cookies
 */

const express = require('express')
const rateLimit = require('express-rate-limit')
const multer = require('multer')
const FormData = require('form-data')
const axios = require('axios')
const CircuitBreaker = require('../utils/circuit-breaker')
const router = express.Router()

// AI routes rate limiter: 20 requests per 15 minutes
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'AI rate limit exceeded, please try again later' }
})
router.use(aiLimiter)

// Circuit breaker for AI service calls
const aiCircuitBreaker = new CircuitBreaker(3, 30000)

const aiPost = (url, data, config) => {
    return aiCircuitBreaker.call(() => axios.post(url, data, config))
}

/**
 * Extract the optional user-provided AI API key from the request.
 * Returns a headers object safe to spread into axios calls.
 */
const getHeaders = (req) => {
    const aiApiKey = req.headers['x-ai-api-key'];
    const aiModel = req.headers['x-ai-model'];
    const headers = {};
    if (aiApiKey) headers['x-ai-api-key'] = aiApiKey;
    if (aiModel) headers['x-ai-model'] = aiModel;
    return headers;
};

/**
 * Safely log errors without leaking API keys.
 * Redacts any key-like strings from error messages.
 */
const safeLogError = (context, error) => {
    let msg = error.message || String(error);
    // Redact OpenRouter keys (sk-or-...)
    msg = msg.replace(/sk-or-[\w-]+/gi, 'sk-or-***REDACTED***');
    // Redact Google AI keys (AIza...)
    msg = msg.replace(/AIza[\w-]+/gi, 'AIza***REDACTED***');
    console.error(`${context}:`, msg);
};

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
 * GET /api/ai/models
 * Return the full model catalog from the AI service
 */
router.get('/models', async (req, res) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/models`)
        return res.json(response.data)
    } catch (error) {
        safeLogError('Models Catalog Error', error)
        return res.status(503).json({
            error: 'Could not fetch model catalog',
            models: []
        })
    }
})

/**
 * GET /api/ai/providers/health
 * Check health of available AI providers
 */
router.get('/providers/health', async (req, res) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/providers/health`, {
            headers: getHeaders(req)
        })
        return res.json(response.data)
    } catch (error) {
        safeLogError('Provider Health Error', error)
        return res.status(503).json({
            error: 'Could not check provider health',
            providers: []
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

        const response = await aiPost(`${AI_SERVICE_URL}/import-resume`, formData, {
            headers: {
                ...formData.getHeaders(),
                ...getHeaders(req)
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        })

        return res.json(response.data)
    } catch (error) {
        safeLogError('Import Resume Error', error)

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
 * POST /api/ai/import-document
 * Parse a PDF or DOCX CV/Resume and extract structured data
 */
router.post('/import-document', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }

    try {
        const formData = new FormData()
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype || 'application/pdf'
        })

        const response = await aiPost(`${AI_SERVICE_URL}/import-document`, formData, {
            headers: {
                ...formData.getHeaders(),
                ...getHeaders(req)
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        })

        return res.json(response.data)
    } catch (error) {
        safeLogError('Import Document Error', error)

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
 * POST /api/ai/convert-cv-to-resume
 * Convert a parsed CV into a concise Resume
 */
router.post('/convert-cv-to-resume', async (req, res) => {
    try {
        const { cv_data, config } = req.body

        if (!cv_data || !config) {
            return res.status(400).json({ error: 'Missing cv_data or config' })
        }

        const response = await aiPost(`${AI_SERVICE_URL}/convert-cv-to-resume`, {
            cv_data,
            config
        }, {
            headers: getHeaders(req)
        })

        return res.json(response.data)
    } catch (error) {
        safeLogError('Convert CV Error', error)

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
 * POST /api/ai/analyze
 * Analyze resume data with AI (from editor)
 */
router.post('/analyze', async (req, res) => {
    try {
        const { resume_data, job_description } = req.body

        const response = await aiPost(`${AI_SERVICE_URL}/analyze`, {
            resume_data,
            job_description
        }, {
            headers: getHeaders(req)
        })

        return res.json(response.data)
    } catch (error) {
        safeLogError('Analyze Resume Error', error)

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
 * POST /api/ai/tailor-resume
 * Auto-tailor the resume based on a job description
 */
router.post('/tailor-resume', async (req, res) => {
    try {
        const { resume_data, job_description } = req.body

        if (!resume_data || !job_description) {
            return res.status(400).json({ error: 'Missing resume_data or job_description' })
        }

        const response = await aiPost(`${AI_SERVICE_URL}/tailor-resume`, {
            resume_data,
            job_description
        }, {
            headers: getHeaders(req)
        })

        return res.json(response.data)
    } catch (error) {
        safeLogError('Tailor Resume Error', error)

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

        const response = await aiPost(`${AI_SERVICE_URL}/analyze-pdf`, formData, {
            headers: {
                ...formData.getHeaders(),
                ...getHeaders(req)
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        })

        return res.json(response.data)
    } catch (error) {
        safeLogError('Analyze PDF Error', error)

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

        const response = await aiPost(`${AI_SERVICE_URL}/portfolio-enhance`, {
            resume_data
        }, {
            headers: getHeaders(req)
        })

        return res.json(response.data)
    } catch (error) {
        safeLogError('Portfolio Enhance Error', error)

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
        const response = await aiPost(`${AI_SERVICE_URL}/portfolio-enhance-stream`, {
            resume_data
        }, {
            headers: getHeaders(req),
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
        safeLogError('Portfolio Stream Error', error)

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

        const response = await aiPost(`${AI_SERVICE_URL}/skill-gap/analyze`, {
            resume_data,
            job_description
        }, {
            headers: getHeaders(req)
        })

        return res.json(response.data)
    } catch (error) {
        safeLogError('Skill Gap Analysis Error', error)

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

        const response = await aiPost(`${AI_SERVICE_URL}/skill-gap/roadmap`, {
            gap_analysis,
            learner_profile
        }, {
            headers: getHeaders(req)
        })

        return res.json(response.data)
    } catch (error) {
        safeLogError('Roadmap Generation Error', error)

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

        const response = await aiPost(`${AI_SERVICE_URL}/skill-gap/roadmap-stream`, {
            gap_analysis,
            learner_profile
        }, {
            headers: getHeaders(req),
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
        safeLogError('Roadmap Stream Error', error)

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

        const response = await aiPost(`${AI_SERVICE_URL}/skill-gap/roadmap/modify`, {
            current_roadmap,
            modification_request
        }, {
            headers: getHeaders(req)
        })

        return res.json(response.data)
    } catch (error) {
        safeLogError('Roadmap Modify Error', error)

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


