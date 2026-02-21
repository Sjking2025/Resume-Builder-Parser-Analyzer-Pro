import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHome, FaBullseye, FaSearch, FaRocket, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaClock, FaEdit, FaPaperPlane, FaTimes } from 'react-icons/fa'
import useResumeStore from '../store/useResumeStore'
import { API_ENDPOINTS } from '../config/api'
import SquareLoader from '../components/common/SquareLoader'
import BanterLoader from '../components/common/BanterLoader'
import PencilLoader from '../components/common/PencilLoader'
// import '../components/ai/RoadmapEffects.css' - Reverted Molten Path styling

/**
 * SkillGapAnalyzer - Main page for analyzing resume vs JD and generating roadmaps
 */
const SkillGapAnalyzer = () => {
  const navigate = useNavigate()
  const { resume } = useResumeStore()
  
  // State
  const [step, setStep] = useState('input') // 'input', 'analyzing', 'report', 'profile', 'generating', 'roadmap'
  const [jobDescription, setJobDescription] = useState('')
  const [gapAnalysis, setGapAnalysis] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Exit confirmation
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)
  
  // Check if user has unsaved progress (beyond input step)
  const hasProgress = step !== 'input' && (jobDescription || gapAnalysis || roadmap)
  
  // Handle browser back button and page close
  useEffect(() => {
    if (!hasProgress) return
    
    // Warn on page close/refresh
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = 'You have unsaved analysis progress. Are you sure you want to leave?'
      return e.returnValue
    }
    
    // Intercept back button
    const handlePopState = (e) => {
      e.preventDefault()
      window.history.pushState(null, '', window.location.pathname)
      setShowExitConfirm(true)
      setPendingNavigation('back')
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.history.pushState(null, '', window.location.pathname)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [hasProgress])
  
  // Safe navigation with confirmation
  const handleSafeNavigation = useCallback((path) => {
    if (hasProgress) {
      setShowExitConfirm(true)
      setPendingNavigation(path)
    } else {
      navigate(path)
    }
  }, [hasProgress, navigate])
  
  // Confirm exit
  const confirmExit = () => {
    setShowExitConfirm(false)
    if (pendingNavigation === 'back') {
      window.history.go(-2) // Go back past our pushed state
    } else if (pendingNavigation) {
      navigate(pendingNavigation)
    }
  }
  
  // Cancel exit
  const cancelExit = () => {
    setShowExitConfirm(false)
    setPendingNavigation(null)
  }
  
  // Learner profile
  const [learnerProfile, setLearnerProfile] = useState({
    hoursPerDay: 2,
    learningSpeed: 'moderate',
    targetDays: 30,
    preferredStyle: 'mixed',
    preferredLanguages: ['english']  // Array for multi-select
  })
  
  // Stream progress
  const [streamProgress, setStreamProgress] = useState(0)
  const [streamStatus, setStreamStatus] = useState('')
  const [weeks, setWeeks] = useState([])
  // Reverted Molten Path/Archive state
  
  // Modification
  const [modifyRequest, setModifyRequest] = useState('')
  const [isModifying, setIsModifying] = useState(false)

  /**
   * Normalize JD text to reduce token count
   * - Removes excessive line breaks (3+ newlines → 2)
   * - Trims leading/trailing whitespace per line
   * - Removes multiple consecutive spaces
   * - Preserves paragraph structure
   */
  const normalizeJDText = (text) => {
    return text
      // Replace Windows line endings
      .replace(/\r\n/g, '\n')
      // Replace multiple spaces with single space
      .replace(/[^\S\n]+/g, ' ')
      // Trim each line
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // Replace 3+ consecutive newlines with 2
      .replace(/\n{3,}/g, '\n\n')
      // Final trim
      .trim()
  }

  // Handle paste event to normalize text
  const handleJDPaste = (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const normalized = normalizeJDText(pastedText)
    setJobDescription(normalized)
  }

  // Normalize on blur for manual typing edge cases
  const handleJDBlur = () => {
    if (jobDescription) {
      setJobDescription(normalizeJDText(jobDescription))
    }
  }

  // Check if resume has content
  const hasResumeContent = resume.personalInfo?.fullName || 
    resume.experience?.length > 0 || 
    resume.skills?.technical?.length > 0

  // Analyze skill gap
  const [analysisProgress, setAnalysisProgress] = useState(0)
  
  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description')
      return
    }
    
    setStep('analyzing')
    setError(null)
    setIsLoading(true)
    setAnalysisProgress(0)
    
    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return prev // Cap at 90% until complete
        const increment = Math.random() * 15 + 5 // Random 5-20% increments
        return Math.min(prev + increment, 90)
      })
    }, 500)
    
    try {
      const response = await fetch(API_ENDPOINTS.skillGapAnalyze, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resume_data: resume,
          job_description: jobDescription 
        })
      })
      
      clearInterval(progressInterval)
      setAnalysisProgress(100) // Complete!
      
      if (!response.ok) {
        throw new Error('Failed to analyze skill gap')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setGapAnalysis(result.data)
        setTimeout(() => setStep('report'), 500) // Brief pause to show 100%
      } else {
        throw new Error(result.data?.error || 'Analysis failed')
      }
    } catch (err) {
      clearInterval(progressInterval)
      setError(err.message)
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate roadmap with SSE streaming
  const [targetProgress, setTargetProgress] = useState(0) // Target from backend
  
  // Smooth progress interpolation
  useEffect(() => {
    if (step !== 'generating') return
    
    const interval = setInterval(() => {
      setStreamProgress(prev => {
        if (prev >= targetProgress) return targetProgress
        // Smoothly catch up to target
        const diff = targetProgress - prev
        const increment = Math.max(0.5, diff * 0.15)
        return Math.min(prev + increment, targetProgress)
      })
    }, 50) // Update every 50ms for smooth animation
    
    return () => clearInterval(interval)
  }, [targetProgress, step])
  
  const handleGenerateRoadmap = async () => {
    setStep('generating')
    setStreamProgress(0)
    setTargetProgress(0)
    setStreamStatus('Initializing...')
    setWeeks([])
    
    try {
      const response = await fetch(API_ENDPOINTS.skillGapRoadmapStream, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gap_analysis: gapAnalysis,
          learner_profile: learnerProfile 
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to start stream')
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullRoadmap = null
      let buffer = '' 
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        // Use stream: true to handle fragmented multi-byte characters
        buffer += decoder.decode(value, { stream: true })
        
        // Split by lines and process each complete line
        const lines = buffer.split('\n')
        // Keep the last (potentially incomplete) part in the buffer
        buffer = lines.pop()
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue
          
          try {
            const data = JSON.parse(trimmedLine.slice(6))
            
            if (data.error) {
              setError(data.error)
              setStep('report')
              return
            }
            
            setTargetProgress(data.progress || 0)
            setStreamStatus(data.status || '')
            
            if (data.section?.startsWith('week_')) {
              setWeeks(prev => [...prev, data.data])
            }
            
            if (data.complete && data.fullRoadmap) {
              fullRoadmap = data.fullRoadmap
            }
          } catch (e) {
            console.error('SSE Parse Error:', e, 'on line:', trimmedLine)
          }
        }
      }
      
      // Safety: Process any remaining data in buffer if it looks like a complete line
      if (buffer.trim().startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.trim().slice(6))
          if (data.complete && data.fullRoadmap) fullRoadmap = data.fullRoadmap
        } catch (e) {}
      }
      
      if (fullRoadmap) {
        setRoadmap(fullRoadmap)
        setTimeout(() => setStep('roadmap'), 1000)
      } else if (weeks.length > 0) {
        // Fallback: Use accumulated weeks if fullRoadmap was missed
        const fallbackRoadmap = {
          targetJob: gapAnalysis.jobTitle || 'Career Journey',
          totalWeeks: weeks.length,
          totalHours: weeks.reduce((sum, w) => sum + (w.totalHours || 0), 0),
          weeks
        }
        setRoadmap(fallbackRoadmap)
        setTimeout(() => setStep('roadmap'), 1000)
      } else {
        // Absolute fallback to report if everything failed
        setStep('report')
        setError('Roadmap generation completed but no data was received. Please try again.')
      }
      
    } catch (err) {
      setError(err.message)
      setStep('report')
    }
  }

  // Modify roadmap with AI
  const handleModifyRoadmap = async () => {
    if (!modifyRequest.trim()) return
    
    setIsModifying(true)
    
    try {
      const response = await fetch(API_ENDPOINTS.skillGapRoadmapModify, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_roadmap: roadmap,
          modification_request: modifyRequest
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to modify roadmap')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setRoadmap(result.data)
        setModifyRequest('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsModifying(false)
    }
  }

  return (
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 no-print" style={{
        background: 'rgba(9, 9, 11, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gradient-forge flex items-center gap-2" style={{ fontFamily: 'var(--font-family-display)', letterSpacing: '-0.02em' }}>
              <FaBullseye /> Skill Gap Analyzer
            </h1>
          </div>
          
          {/* Progress Steps */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full" style={{
              background: (step === 'input' || step === 'analyzing') ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.04)',
              color: (step === 'input' || step === 'analyzing') ? '#f97316' : '#52525b',
              fontFamily: 'var(--font-family-display)',
            }}>
              1. Input
            </span>
            <span style={{ color: '#3f3f46' }}>→</span>
            <span className="px-3 py-1 rounded-full" style={{
              background: (step === 'report' || step === 'profile') ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.04)',
              color: (step === 'report' || step === 'profile') ? '#f97316' : '#52525b',
              fontFamily: 'var(--font-family-display)',
            }}>
              2. Analysis
            </span>
            <span style={{ color: '#3f3f46' }}>→</span>
            <span className="px-3 py-1 rounded-full" style={{
              background: (step === 'generating' || step === 'roadmap') ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.04)',
              color: (step === 'generating' || step === 'roadmap') ? '#f97316' : '#52525b',
              fontFamily: 'var(--font-family-display)',
            }}>
              3. Roadmap
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-lg p-4 flex items-center gap-3" style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}>
            <FaExclamationTriangle style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444' }}>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto" style={{ color: '#ef4444', opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>×</button>
          </div>
        )}

        {/* Step: Input */}
        {step === 'input' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)', letterSpacing: '-0.03em' }}>
                Analyze Your Skill Gap
              </h2>
              <p style={{ color: '#71717a' }}>
                Paste a job description to see how your skills match up
              </p>
            </div>
            
            {/* JD Input */}
            <div className="section-card rounded-2xl p-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#a1a1aa' }}>
                📋 Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onPaste={handleJDPaste}
                onBlur={handleJDBlur}
                placeholder="Paste the complete job description here... (Auto-formatted to remove extra spaces)"
                className="w-full h-64 p-4 rounded-xl resize-none input-field"
              />
              <p className="text-xs mt-1" style={{ color: '#3f3f46' }}>
                ✨ Text is auto-cleaned on paste to optimize processing
              </p>
            </div>
            
            {/* Resume Status */}
            <div className="section-card rounded-2xl p-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#a1a1aa' }}>
                📄 Your Resume
              </label>
              {hasResumeContent ? (
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{
                  background: 'rgba(34,197,94,0.06)',
                  border: '1px solid rgba(34,197,94,0.15)',
                }}>
                  <FaCheckCircle style={{ color: '#22c55e', fontSize: '1.25rem' }} />
                  <div>
                    <p className="font-medium" style={{ color: '#22c55e' }}>{resume.personalInfo?.fullName || 'Resume Ready'}</p>
                    <p className="text-sm" style={{ color: '#52525b' }}>
                      {resume.skills?.technical?.length || 0} skills • {resume.experience?.length || 0} experiences
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{
                  background: 'rgba(234,179,8,0.06)',
                  border: '1px solid rgba(234,179,8,0.15)',
                }}>
                  <FaExclamationTriangle style={{ color: '#eab308', fontSize: '1.25rem' }} />
                  <div>
                    <p className="font-medium" style={{ color: '#eab308' }}>No resume data</p>
                    <p className="text-sm" style={{ color: '#71717a' }}>
                      <button onClick={() => navigate('/builder')} className="underline" style={{ color: '#06b6d4', background: 'none', border: 'none', cursor: 'pointer' }}>Add your resume</button> first for better analysis
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || isLoading}
              className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaSearch /> Analyze Skill Gap
            </button>
          </div>
        )}

        {/* Step: Analyzing */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20">
            {/* Pencil Loader */}
            <div className="mb-4">
              <PencilLoader />
            </div>
            {/* Percentage below loader */}
            <div className="text-4xl font-bold mb-4" style={{ color: '#f97316' }}>
              {Math.round(analysisProgress)}%
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>Analyzing Your Skills...</h2>
            <p style={{ color: '#71717a' }}>Comparing resume with job requirements</p>
          </div>
        )}

        {/* Step: Report */}
        {step === 'report' && gapAnalysis && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)', letterSpacing: '-0.03em' }}>
                Gap Analysis Report
              </h2>
              <p style={{ color: '#71717a' }}>
                {gapAnalysis.jobTitle} {gapAnalysis.company && `at ${gapAnalysis.company}`}
              </p>
            </div>
            
            {/* Match Score */}
            <div className="section-card rounded-2xl p-8 text-center">
              <div className="text-6xl font-bold mb-2" style={{ 
                color: gapAnalysis.matchScore >= 70 ? '#16a34a' : gapAnalysis.matchScore >= 50 ? '#eab308' : '#dc2626' 
              }}>
                {gapAnalysis.matchScore}%
              </div>
              <p className="" style={{ color: '#71717a' }}>Match Score</p>
              <div className="w-full rounded-full h-4 overflow-hidden" style={{ background: '#27272a' }}>
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${gapAnalysis.matchScore}%`,
                    backgroundColor: gapAnalysis.matchScore >= 70 ? '#16a34a' : gapAnalysis.matchScore >= 50 ? '#eab308' : '#dc2626'
                  }}
                />
              </div>
              {gapAnalysis.estimatedPrepTime && (
                <p className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                  <FaClock /> Estimated prep time: {gapAnalysis.estimatedPrepTime}
                </p>
              )}
            </div>
            
            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Matched */}
              <div className="section-card rounded-2xl p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-4" style={{ color: '#22c55e' }}>
                  <FaCheckCircle /> Matched ({gapAnalysis.matchedSkills?.length || 0})
                </h3>
                <div className="space-y-2">
                  {gapAnalysis.matchedSkills?.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${skill.confidence === 'strong' ? 'bg-green-500' : 'bg-green-300'}`} />
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-gray-400 text-xs ml-auto">{skill.confidence}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Missing */}
              <div className="section-card rounded-2xl p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-4" style={{ color: '#ef4444' }}>
                  <FaTimesCircle /> Missing ({gapAnalysis.missingSkills?.length || 0})
                </h3>
                <div className="space-y-2">
                  {gapAnalysis.missingSkills?.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${skill.priority === 'high' ? 'bg-red-500' : 'bg-red-300'}`} />
                      <span className="font-medium">{skill.name}</span>
                      <span className={`text-xs ml-auto px-2 py-0.5 rounded`} style={{
                        background: skill.priority === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                        color: skill.priority === 'high' ? '#ef4444' : '#eab308'
                      }}>{skill.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Weak */}
              <div className="section-card rounded-2xl p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-4" style={{ color: '#eab308' }}>
                  <FaExclamationTriangle /> Needs Work ({gapAnalysis.weakSkills?.length || 0})
                </h3>
                <div className="space-y-2">
                  {gapAnalysis.weakSkills?.map((skill, i) => (
                    <div key={i} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="font-medium">{skill.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-4">
                        {skill.currentLevel} → {skill.requiredLevel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Recommendations */}
            {gapAnalysis.recommendations?.length > 0 && (
              <div className="rounded-2xl p-6 border" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}>
                <h3 className="font-bold mb-3" style={{ color: '#06b6d4' }}>💡 Recommendations</h3>
                <ul className="space-y-2">
                  {gapAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#a1a1aa' }}>
                      <span className="mt-1" style={{ color: '#06b6d4' }}>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Generate Roadmap Button - Smooth satisfying animation */}
            <button
              onClick={() => setStep('profile')}
              className="w-full py-4 text-lg font-bold flex items-center justify-center gap-2 rounded-xl text-white
                bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500
                relative overflow-hidden group"
              style={{
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.1)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.filter = 'brightness(0.85) saturate(1.2)'
                e.currentTarget.style.boxShadow = '0 2px 15px rgba(168, 85, 247, 0.7)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.filter = 'brightness(1.1)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.6)'
              }}
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              <FaRocket className="relative z-10" /> 
              <span className="relative z-10">Generate Practice Roadmap</span>
            </button>
          </div>
        )}

        {/* Step: Learner Profile */}
        {step === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)', letterSpacing: '-0.03em' }}>
                Customize Your Roadmap
              </h2>
              <p className="text-gray-600">
                Tell us about your learning preferences
              </p>
            </div>
            
            <div className="section-card rounded-2xl p-6 space-y-6">
              {/* Hours per day */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>
                  🕐 Available Time (hours/day)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 4, 6].map(h => (
                    <button
                      key={h}
                      onClick={() => setLearnerProfile(p => ({ ...p, hoursPerDay: h }))}
                      className="py-3 rounded-xl font-medium transition-all"
                      style={{
                        background: learnerProfile.hoursPerDay === h ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                        color: learnerProfile.hoursPerDay === h ? '#f97316' : '#71717a',
                        border: learnerProfile.hoursPerDay === h ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                      }}
                    >
                      {h} hr{h > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Learning Speed */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>
                  📈 Learning Speed
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['slow', 'moderate', 'fast'].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setLearnerProfile(p => ({ ...p, learningSpeed: speed }))}
                      className="py-3 rounded-xl font-medium capitalize transition-all"
                      style={{
                        background: learnerProfile.learningSpeed === speed ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                        color: learnerProfile.learningSpeed === speed ? '#f97316' : '#71717a',
                        border: learnerProfile.learningSpeed === speed ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                      }}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Target Days */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>
                  🎯 Target Timeline
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[14, 30, 60, 90].map(days => (
                    <button
                      key={days}
                      onClick={() => setLearnerProfile(p => ({ ...p, targetDays: days }))}
                      className="py-3 rounded-xl font-medium transition-all"
                      style={{
                        background: learnerProfile.targetDays === days ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                        color: learnerProfile.targetDays === days ? '#f97316' : '#71717a',
                        border: learnerProfile.targetDays === days ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                      }}
                    >
                      {days < 30 ? `${days} days` : `${days/30} mo`}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preferred Style */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>
                  📚 Preferred Learning Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'video', label: '🎥 Video + Practice' },
                    { value: 'reading', label: '📖 Reading + Practice' },
                    { value: 'practice', label: '⚡ Just Practice' },
                    { value: 'mixed', label: '🔀 Mix of Everything' }
                  ].map(style => (
                    <button
                      key={style.value}
                      onClick={() => setLearnerProfile(p => ({ ...p, preferredStyle: style.value }))}
                      className="py-3 rounded-xl font-medium transition-all"
                      style={{
                        background: learnerProfile.preferredStyle === style.value ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                        color: learnerProfile.preferredStyle === style.value ? '#f97316' : '#71717a',
                        border: learnerProfile.preferredStyle === style.value ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                      }}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preferred Languages for Videos - Multi-select */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>
                  🌐 Video Language Preferences
                </label>
                <p className="text-xs mb-2" style={{ color: '#52525b' }}>
                  Select all languages you're comfortable with (multiple allowed)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'english', label: 'English', flag: '🇺🇸' },
                    { value: 'hindi', label: 'Hindi', flag: '🇮🇳' },
                    { value: 'tamil', label: 'Tamil', flag: '🇮🇳' },
                    { value: 'telugu', label: 'Telugu', flag: '🇮🇳' },
                    { value: 'spanish', label: 'Spanish', flag: '🇪🇸' },
                    { value: 'portuguese', label: 'Portuguese', flag: '🇧🇷' },
                    { value: 'arabic', label: 'Arabic', flag: '🇸🇦' },
                    { value: 'japanese', label: 'Japanese', flag: '🇯🇵' }
                  ].map(lang => {
                    const isSelected = learnerProfile.preferredLanguages?.includes(lang.value)
                    return (
                      <label
                        key={lang.value}
                        className="flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: isSelected ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)',
                          border: isSelected ? '2px solid rgba(249,115,22,0.3)' : '2px solid rgba(255,255,255,0.06)',
                          color: isSelected ? '#f97316' : '#71717a',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setLearnerProfile(p => {
                              const current = p.preferredLanguages || ['english']
                              if (current.includes(lang.value)) {
                                // Remove (but keep at least one)
                                const filtered = current.filter(l => l !== lang.value)
                                return { ...p, preferredLanguages: filtered.length > 0 ? filtered : ['english'] }
                              } else {
                                // Add
                                return { ...p, preferredLanguages: [...current, lang.value] }
                              }
                            })
                          }}
                          className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                        />
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.label}</span>
                      </label>
                    )
                  })}
                </div>
                {learnerProfile.preferredLanguages?.length > 1 && (
                  <p className="text-xs text-primary-600 mt-2">
                    ✨ Videos from {learnerProfile.preferredLanguages.length} language communities will be suggested
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setStep('report')}
                className="flex-1 btn-secondary py-4"
              >
                ← Back
              </button>
              <button
                onClick={handleGenerateRoadmap}
                className="flex-1 btn-primary py-4 font-bold flex items-center justify-center gap-2"
              >
                <FaRocket /> Generate Roadmap
              </button>
            </div>
          </div>
        )}

        {/* Step: Generating */}
        {step === 'generating' && (
          <div className="max-w-xl mx-auto text-center py-12">
            <div className="flex justify-center mb-8">
              <BanterLoader />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>
              Generating Your Roadmap
            </h2>
            <p className="text-gray-600 mb-8">{streamStatus}</p>
            
            {/* Progress Bar with Percentage */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: '#71717a' }}>Progress</span>
                <span className="text-lg font-bold text-primary-600">{Math.round(streamProgress)}%</span>
              </div>
              <div className="w-full rounded-full h-4 overflow-hidden relative" style={{ background: '#27272a' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${streamProgress}%`, background: 'linear-gradient(90deg, #f97316, #06b6d4)' }}
                />
                {/* Shimmer effect on progress bar */}
                <div
                  className="absolute inset-0 animate-shimmer"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite linear'
                  }}
                />
              </div>
            </div>
            
            {/* Weeks Preview */}
            {weeks.length > 0 && (
              <div className="text-left space-y-2">
                {weeks.map((week, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <FaCheckCircle className="text-green-500" />
                    <span className="font-medium">Week {week.weekNumber}: {week.focus}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Roadmap */}
        {step === 'roadmap' && roadmap && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="section-card rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>
                  🗺️ Your Practice Roadmap
                </h2>
                <p style={{ color: '#71717a' }}>
                  {roadmap.targetJob} • {roadmap.totalWeeks} weeks • ~{roadmap.totalHours} hours
                </p>
              </div>
            </div>
            
            {/* Weeks List - Reverted from Molten Path */}
            <div className="space-y-6">
              {roadmap.weeks?.map((week, i) => (
                <div key={i} className="section-card rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Week {week.weekNumber}</span>
                        <h3 className="text-xl font-bold" style={{ color: '#fafafa' }}>{week.focus}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm" style={{ color: '#71717a' }}>
                        <span className="flex items-center gap-1"><FaClock className="text-primary-500/50" /> {week.totalHours}h</span>
                        <div className="flex gap-2">
                          {week.skills?.map((skill, si) => (
                            <span key={si} className="px-2 py-0.5 bg-white/5 rounded text-[10px] uppercase font-bold">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Theory */}
                      <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                        <h4 className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: '#e4e4e7' }}>
                          <FaEdit className="text-primary-500" /> Theory & Concepts
                        </h4>
                        <ul className="space-y-2">
                          {week.learn?.topics?.map((topic, j) => (
                            <li key={j} className="text-xs flex gap-2" style={{ color: '#a1a1aa' }}>
                              <span className="text-primary-500/50">•</span> {topic}
                            </li>
                          ))}
                        </ul>
                        {week.learn?.resources?.videos?.[0] && (
                          <a 
                            href={week.learn.resources.videos[0].url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:underline"
                          >
                            📺 Recommended Video: {week.learn.resources.videos[0].title}
                          </a>
                        )}
                      </div>

                      {/* Forge */}
                      <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                        <h4 className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: '#e4e4e7' }}>
                          <FaRocket className="text-indigo-500" /> Practical Forge
                        </h4>
                        {week.practice?.projects?.slice(0, 1).map((project, j) => (
                          <div key={j} className="space-y-2">
                            <p className="text-sm font-bold" style={{ color: '#f4f4f5' }}>{project.name}</p>
                            <p className="text-xs" style={{ color: '#71717a' }}>{project.description}</p>
                            {project.expectedErrors?.length > 0 && (
                              <div className="mt-2 p-2 rounded bg-red-500/5 border border-red-500/10">
                                <p className="text-[10px] font-bold text-red-400 uppercase mb-1">Watch out for:</p>
                                <div className="flex flex-wrap gap-2 text-[10px]" style={{ color: '#a1a1aa' }}>
                                  {project.expectedErrors.map((err, ei) => <span key={ei}>⚠️ {err}</span>)}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modification Chat */}
            <div className="section-card rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#e4e4e7' }}>
                <FaEdit /> Refine This Roadmap
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={modifyRequest}
                  onChange={(e) => setModifyRequest(e.target.value)}
                  placeholder="e.g., 'Make it more advanced' or 'I have less time'"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleModifyRoadmap()}
                />
                <button
                  onClick={handleModifyRoadmap}
                  disabled={isModifying || !modifyRequest.trim()}
                  className="btn-primary px-6 flex items-center gap-2"
                >
                  {isModifying ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                  Apply
                </button>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={() => setStep('input')} className="flex-1 btn-secondary py-4">
                Analyze Another JD
              </button>
              <button onClick={() => window.print()} className="flex-1 btn-primary py-4">
                📤 Export Roadmap
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-500" />
                Leave Analysis?
              </h3>
              <button 
                onClick={cancelExit}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              You have unsaved progress in your skill gap analysis. If you leave now, your 
              {gapAnalysis && ' analysis results'}
              {roadmap && ' and generated roadmap'}
              {' '}will be lost.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelExit}
                className="flex-1 py-3 px-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition"
              >
                Stay & Continue
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillGapAnalyzer
