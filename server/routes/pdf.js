const express = require('express')
const router = express.Router()

let puppeteer = null
try {
    puppeteer = require('puppeteer')
} catch {
    console.warn('puppeteer not available — PDF generation will use HTML fallback')
}

router.post('/export', async (req, res) => {
    try {
        const { html, filename = 'resume.pdf' } = req.body

        if (!html) {
            return res.status(400).json({ error: 'HTML content required' })
        }

        if (!puppeteer) {
            return res.status(200).json({
                message: 'PDF generation unavailable on this server',
                html: html,
                suggestion: 'Use browser Print to PDF (Ctrl+P)'
            })
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        })

        try {
            const page = await browser.newPage()
            await page.setContent(html, { waitUntil: 'networkidle0' })
            await page.emulateMediaType('print')

            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
                printBackground: true
            })

            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
            return res.send(pdfBuffer)
        } finally {
            await browser.close()
        }
    } catch (error) {
        console.error('PDF Export Error:', error.message)
        return res.status(500).json({ error: error.message })
    }
})

module.exports = router
