/**
 * PDF Export Routes
 * Handles resume PDF generation
 */

const express = require('express')
const router = express.Router()

/**
 * POST /api/pdf/export
 * Generate PDF from resume data (simplified for deployment)
 */
router.post('/export', async (req, res) => {
    try {
        const { html, filename = 'resume.pdf' } = req.body

        if (!html) {
            return res.status(400).json({ error: 'HTML content required' })
        }

        // For now, return a simple response
        // Full Puppeteer PDF generation requires more setup on Render
        return res.status(501).json({
            message: 'PDF export available in local development only',
            suggestion: 'Use browser Print to PDF for now'
        })

    } catch (error) {
        console.error('PDF Export Error:', error.message)
        return res.status(500).json({ error: error.message })
    }
})

module.exports = router
