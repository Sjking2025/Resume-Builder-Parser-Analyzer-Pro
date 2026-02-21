import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHome, FaRobot, FaUpload, FaSpinner, FaEdit, FaFileAlt, FaDownload } from 'react-icons/fa'
import useResumeStore from '../store/useResumeStore'
import ATSScoreCard from '../components/ai/ATSScoreCard'
import SkillGapAnalysis from '../components/ai/SkillGapAnalysis'
import ImprovementSuggestions from '../components/ai/ImprovementSuggestions'
import JDMatcher from '../components/ai/JDMatcher'
import CareerGuidance from '../components/ai/CareerGuidance'
import AnalysisProgress from '../components/ai/AnalysisProgress'

const AIAnalysisPage = () => {
  const navigate = useNavigate()
  const { resume } = useResumeStore()
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState(null)
  
  // Input state
  const [jobDescription, setJobDescription] = useState('')
  const [inputMode, setInputMode] = useState('editor') // 'editor' or 'upload'
  const [uploadedFile, setUploadedFile] = useState(null)
  
  // Check if resume has content
  const hasResumeContent = resume.personalInfo?.fullName || 
    resume.experience?.length > 0 || 
    resume.education?.length > 0 ||
    resume.projects?.length > 0

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file)
      setError(null)
    } else {
      setError('Please upload a PDF file')
    }
  }, [])

  // Analyze resume
  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      let response
      
      if (inputMode === 'upload' && uploadedFile) {
        // Upload PDF for analysis
        const formData = new FormData()
        formData.append('file', uploadedFile)
        if (jobDescription) {
          formData.append('job_description', jobDescription)
        }
        
        response = await fetch('http://localhost:5000/api/ai/analyze-pdf', {
          method: 'POST',
          body: formData
        })
      } else {
        // Use resume data from editor
        response = await fetch('http://localhost:5000/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_data: resume,
            job_description: jobDescription || null
          })
        })
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || 'Analysis failed')
      }
      
      const data = await response.json()
      setAnalysisResult(data)
    } catch (err) {
      setError(err.message)
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Export analysis as formatted text
  const handleExportAnalysis = () => {
    if (!analysisResult) return

    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()
    
    let exportText = `
================================================================================
                         AI RESUME ANALYSIS REPORT
================================================================================
Generated: ${date} at ${time}
Powered by CrewAI + Google Gemini 2.5 Flash

================================================================================
1. RESUME OVERVIEW
================================================================================
${analysisResult.resume_overview || 'No overview available'}

================================================================================
2. ATS COMPATIBILITY SCORE
================================================================================
Overall Score: ${analysisResult.ats_score}/100

Score Breakdown:
  - Keyword Match:       ${analysisResult.ats_breakdown?.keyword_match || 0}/100 (35% weight)
  - Experience Relevance: ${analysisResult.ats_breakdown?.experience_relevance || 0}/100 (25% weight)
  - Formatting Score:    ${analysisResult.ats_breakdown?.formatting_score || 0}/100 (20% weight)
  - Skill Coverage:      ${analysisResult.ats_breakdown?.skill_coverage || 0}/100 (10% weight)
  - Language Quality:    ${analysisResult.ats_breakdown?.language_quality || 0}/100 (10% weight)

${analysisResult.ats_explanation || ''}

================================================================================
3. SKILL & KEYWORD MATCH ANALYSIS
================================================================================

STRENGTHS:
${(analysisResult.strengths || []).map((s, i) => `  ${i + 1}. ${s}`).join('\n') || '  No strengths identified'}

WEAKNESSES:
${(analysisResult.weaknesses || []).map((w, i) => `  ${i + 1}. ${w}`).join('\n') || '  No weaknesses identified'}

MATCHED KEYWORDS:
${(analysisResult.matched_keywords || []).map(k => `  • ${k}`).join('\n') || '  None identified'}

MISSING KEYWORDS:
${(analysisResult.missing_keywords || []).map(k => `  • ${k}`).join('\n') || '  None identified'}

SKILL GAPS:
${(analysisResult.skill_gaps || []).map(g => `  • ${g.skill} (${g.importance})\n    Recommendation: ${g.recommendation}`).join('\n\n') || '  No skill gaps identified'}

================================================================================
4. EXPERIENCE QUALITY REVIEW
================================================================================

BULLET POINT IMPROVEMENTS:
${(analysisResult.bullet_improvements || []).map((imp, i) => `
  ${i + 1}. [${imp.section || 'General'}]
     Original: "${imp.original}"
     Improved: "${imp.improved}"
     Reason: ${imp.reason}
`).join('\n') || '  No improvements suggested'}

================================================================================
5. CAREER GROWTH RECOMMENDATIONS
================================================================================

${analysisResult.career_guidance || 'No career guidance available'}

RECOMMENDED SKILLS TO LEARN:
${(analysisResult.recommended_skills || []).map((s, i) => `  ${i + 1}. ${s}`).join('\n') || '  None recommended'}

RECOMMENDED CERTIFICATIONS:
${(analysisResult.recommended_certifications || []).map((c, i) => `  ${i + 1}. ${c}`).join('\n') || '  None recommended'}

PROJECT IDEAS:
${(analysisResult.project_ideas || []).map((p, i) => `  ${i + 1}. ${p}`).join('\n') || '  None suggested'}

================================================================================
6. TOP 5 PRIORITIZED ACTIONS
================================================================================
${(analysisResult.top_5_priorities || []).map((p, i) => `  ${i + 1}. ${p}`).join('\n') || '  No priority actions identified'}

${analysisResult.jd_match_percentage ? `
================================================================================
7. JOB DESCRIPTION MATCH
================================================================================
Match Percentage: ${analysisResult.jd_match_percentage}%

${analysisResult.jd_match_details || ''}
` : ''}

================================================================================
                              END OF REPORT
================================================================================
`

    // Create and download file
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resume-analysis-${date.replace(/\//g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative z-10 min-h-screen">
      {/* Analysis Progress Overlay */}
      <AnalysisProgress isAnalyzing={isAnalyzing} />
      
      {/* Header */}
      <header className="sticky top-0 z-40 no-print" style={{
        background: 'rgba(9, 9, 11, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gradient-forge flex items-center gap-2" style={{ fontFamily: 'var(--font-family-display)', letterSpacing: '-0.02em' }}>
                <FaRobot /> AI Resume Analysis
              </h1>
            </div>
            <button
              onClick={() => navigate('/editor')}
              className="btn-secondary flex items-center gap-2"
            >
              <FaEdit /> Edit Resume
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Input Section */}
        <div className="section-card rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>Resume Source</h2>
          
          {/* Mode Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setInputMode('editor')}
              className="flex-1 p-4 rounded-lg transition-all"
              style={{
                border: inputMode === 'editor' ? '2px solid rgba(249,115,22,0.4)' : '2px solid rgba(255,255,255,0.06)',
                background: inputMode === 'editor' ? 'rgba(249,115,22,0.06)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <FaFileAlt className="text-2xl mx-auto mb-2" style={{
                color: inputMode === 'editor' ? '#f97316' : '#52525b',
              }} />
              <p className="font-medium" style={{
                color: inputMode === 'editor' ? '#f97316' : '#71717a',
                fontFamily: 'var(--font-family-display)',
              }}>Use Current Resume</p>
              <p className="text-sm mt-1" style={{ color: '#52525b' }}>
                Analyze the resume from the editor
              </p>
            </button>
            
            <button
              onClick={() => setInputMode('upload')}
              className="flex-1 p-4 rounded-lg transition-all"
              style={{
                border: inputMode === 'upload' ? '2px solid rgba(249,115,22,0.4)' : '2px solid rgba(255,255,255,0.06)',
                background: inputMode === 'upload' ? 'rgba(249,115,22,0.06)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <FaUpload className="text-2xl mx-auto mb-2" style={{
                color: inputMode === 'upload' ? '#f97316' : '#52525b',
              }} />
              <p className="font-medium" style={{
                color: inputMode === 'upload' ? '#f97316' : '#71717a',
                fontFamily: 'var(--font-family-display)',
              }}>Upload PDF</p>
              <p className="text-sm mt-1" style={{ color: '#52525b' }}>
                Analyze an external resume file
              </p>
            </button>
          </div>

          {/* File Upload (if upload mode) */}
          {inputMode === 'upload' && (
            <div className="mb-6">
              <label className="block w-full p-6 rounded-lg cursor-pointer text-center" style={{
                border: '2px dashed rgba(255,255,255,0.08)',
                transition: 'border-color 0.2s',
              }}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploadedFile ? (
                  <div>
                    <FaFileAlt className="text-4xl mx-auto mb-2" style={{ color: '#22c55e' }} />
                    <p className="font-medium" style={{ color: '#22c55e' }}>{uploadedFile.name}</p>
                    <p className="text-sm" style={{ color: '#52525b' }}>Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <FaUpload className="text-4xl mx-auto mb-2" style={{ color: '#52525b' }} />
                    <p style={{ color: '#a1a1aa' }}>Click to upload PDF resume</p>
                    <p className="text-sm" style={{ color: '#52525b' }}>Maximum file size: 10MB</p>
                  </div>
                )}
              </label>
            </div>
          )}

          {/* Editor Resume Status (if editor mode) */}
          {inputMode === 'editor' && (
            <div className="mb-6 p-4 rounded-lg" style={{
              background: hasResumeContent ? 'rgba(34,197,94,0.06)' : 'rgba(234,179,8,0.06)',
              border: `1px solid ${hasResumeContent ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)'}`,
            }}>
              {hasResumeContent ? (
                <p style={{ color: '#22c55e' }}>
                  ✓ Resume data found: <span className="font-medium">{resume.personalInfo?.fullName || 'Unnamed'}</span>
                </p>
              ) : (
                <p style={{ color: '#eab308' }}>
                  ⚠ No resume data found. <a href="/editor" className="underline" style={{ color: '#06b6d4' }}>Go to editor</a> to create your resume first.
                </p>
              )}
            </div>
          )}

          {/* Job Description Input */}
          <JDMatcher
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            matchPercentage={analysisResult?.jd_match_percentage}
            matchDetails={analysisResult?.jd_match_details}
            tailoredSummary={null}
            isLoading={isAnalyzing}
          />

          {/* Analyze Button */}
          <div className="mt-6">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (inputMode === 'editor' && !hasResumeContent) || (inputMode === 'upload' && !uploadedFile)}
              className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <FaSpinner className="animate-spin" /> Analyzing Resume...
                </>
              ) : (
                <>
                  <FaRobot /> Analyze Resume with AI
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-lg" style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              color: '#ef4444',
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Results Header with Export Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>Analysis Results</h2>
              <button
                onClick={handleExportAnalysis}
                className="btn-secondary flex items-center gap-2"
              >
                <FaDownload /> Export Report
              </button>
            </div>

            {/* ATS Score */}
            <ATSScoreCard
              score={analysisResult.ats_score}
              breakdown={analysisResult.ats_breakdown}
              explanation={analysisResult.ats_explanation}
            />

            {/* Skill Gap Analysis */}
            <div className="animate-slide-up stagger-2">
              <SkillGapAnalysis
                matchedSkills={analysisResult.matched_keywords}
                missingSkills={analysisResult.missing_keywords}
                skillGaps={analysisResult.skill_gaps}
                matchedKeywords={analysisResult.matched_keywords}
                missingKeywords={analysisResult.missing_keywords}
              />
            </div>

            {/* Improvement Suggestions */}
            <div className="animate-slide-up stagger-3">
              <ImprovementSuggestions
                improvements={analysisResult.bullet_improvements}
                strengths={analysisResult.strengths}
                weaknesses={analysisResult.weaknesses}
              />
            </div>

            {/* Career Guidance */}
            <div className="animate-slide-up stagger-4">
              <CareerGuidance
                careerGuidance={analysisResult.career_guidance}
                recommendedSkills={analysisResult.recommended_skills}
                recommendedCertifications={analysisResult.recommended_certifications}
                projectIdeas={analysisResult.project_ideas}
              />
            </div>

            {/* Resume Overview */}
            {analysisResult.resume_overview && (
              <div className="section-card rounded-2xl p-6 animate-slide-up stagger-5">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>Resume Overview</h3>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap" style={{ color: '#a1a1aa' }}>
                  {analysisResult.resume_overview}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!analysisResult && !isAnalyzing && (
          <div className="text-center py-16" style={{ color: '#52525b' }}>
            <FaRobot className="text-6xl mx-auto mb-4" style={{ color: '#27272a' }} />
            <h3 className="text-xl font-medium mb-2" style={{ color: '#a1a1aa', fontFamily: 'var(--font-family-display)' }}>Ready to Analyze Your Resume</h3>
            <p>Select your resume source and click "Analyze Resume with AI" to get started</p>
            <div className="mt-6 text-sm" style={{ color: '#3f3f46' }}>
              <p>Powered by CrewAI + Google Gemini 2.5 Flash</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AIAnalysisPage
