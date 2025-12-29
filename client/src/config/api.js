// API Configuration for Resume Builder
// Uses environment variable in production, falls back to local proxy in development

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// All API endpoints
export const API_ENDPOINTS = {
    // AI Analysis endpoints
    analyze: `${API_BASE_URL}/api/ai/analyze`,
    analyzePdf: `${API_BASE_URL}/api/ai/analyze-pdf`,
    matchJd: `${API_BASE_URL}/api/ai/match-jd`,
    improve: `${API_BASE_URL}/api/ai/improve`,
    careerAdvice: `${API_BASE_URL}/api/ai/career-advice`,
    importResume: `${API_BASE_URL}/api/ai/import-resume`,
    health: `${API_BASE_URL}/api/ai/health`,

    // PDF export
    exportPdf: `${API_BASE_URL}/api/pdf/export`,
}

export default API_BASE_URL
