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
    importDocument: `${API_BASE_URL}/api/ai/import-document`,
    convertCvToResume: `${API_BASE_URL}/api/ai/convert-cv-to-resume`,
    portfolioEnhance: `${API_BASE_URL}/api/ai/portfolio-enhance`,
    portfolioEnhanceStream: `${API_BASE_URL}/api/ai/portfolio-enhance-stream`,

    // Skill Gap Analyzer
    skillGapAnalyze: `${API_BASE_URL}/api/ai/skill-gap/analyze`,
    skillGapRoadmap: `${API_BASE_URL}/api/ai/skill-gap/roadmap`,
    skillGapRoadmapStream: `${API_BASE_URL}/api/ai/skill-gap/roadmap-stream`,
    skillGapRoadmapModify: `${API_BASE_URL}/api/ai/skill-gap/roadmap/modify`,

    // Auto-Tailor
    tailorResume: `${API_BASE_URL}/api/ai/tailor-resume`,

    health: `${API_BASE_URL}/api/ai/health`,

    // Model Management (Multi-Provider)
    models: `${API_BASE_URL}/api/ai/models`,
    providersHealth: `${API_BASE_URL}/api/ai/providers/health`,

    // PDF export
    exportPdf: `${API_BASE_URL}/api/pdf/export`,
}

/**
 * Wrapper around native fetch to automatically attach custom API keys and model selection.
 * Injects x-ai-api-key and x-ai-model headers from sessionStorage.
 */
export const apiFetch = async (url, options = {}) => {
  const apiKey = sessionStorage.getItem('customApiKey')
  const aiModel = sessionStorage.getItem('customAiModel')
  const headers = {
    ...options.headers,
    ...(apiKey ? { 'x-ai-api-key': apiKey } : {}),
    ...(aiModel ? { 'x-ai-model': aiModel } : {}),
  }
  return fetch(url, { ...options, headers })
}

export default API_BASE_URL

