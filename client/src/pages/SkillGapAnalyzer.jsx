import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHome, FaBullseye, FaSearch, FaRocket, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaClock, FaEdit, FaPaperPlane, FaTimes, FaMagic } from 'react-icons/fa'
import useResumeStore from '../store/useResumeStore'
import { API_ENDPOINTS } from '../config/api'
import SquareLoader from '../components/common/SquareLoader'
import BanterLoader from '../components/common/BanterLoader'
import PencilLoader from '../components/common/PencilLoader'

/**
 * SkillGapAnalyzer - Main page for analyzing resume vs JD and generating roadmaps
 */
const SkillGapAnalyzer = () => {
  const navigate = useNavigate()
  const { resume, loadResume } = useResumeStore()
  
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
  
  // Modification
  const [modifyRequest, setModifyRequest] = useState('')
  const [isModifying, setIsModifying] = useState(false)

  // Auto-Tailoring
  const [isTailoring, setIsTailoring] = useState(false)

  const handleAutoTailor = async () => {
    if (!jobDescription || !resume) return

    setIsTailoring(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_data: resume,
          job_description: jobDescription
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || 'Failed to tailor resume')
      }

      const tailoredData = await response.json()
      
      // Load the rewritten data directly into the Zustand store
      loadResume(tailoredData)
      
      // Navigate to editor to see the changes instantly
      navigate('/editor')
      
    } catch (err) {
      console.error('Auto-Tailor Error:', err)
      setError(err.message)
    } finally {
      setIsTailoring(false)
    }
  }

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
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
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
              console.error('Parse error:', e)
            }
          }
        }
      }
      
      if (fullRoadmap) {
        setRoadmap(fullRoadmap)
        setTimeout(() => setStep('roadmap'), 1000)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSafeNavigation('/')}
              className="btn-ghost p-2"
            >
              <FaHome className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaBullseye className="text-primary-600" />
              Skill Gap Analyzer
            </h1>
          </div>
          
          {/* Progress Steps */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className={`px-3 py-1 rounded-full ${step === 'input' || step === 'analyzing' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
              1. Input
            </span>
            <span className="text-gray-300">→</span>
            <span className={`px-3 py-1 rounded-full ${step === 'report' || step === 'profile' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
              2. Analysis
            </span>
            <span className="text-gray-300">→</span>
            <span className={`px-3 py-1 rounded-full ${step === 'generating' || step === 'roadmap' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
              3. Roadmap
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500" />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        {/* Step: Input */}
        {step === 'input' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Analyze Your Skill Gap
              </h2>
              <p className="text-gray-600">
                Paste a job description to see how your skills match up
              </p>
            </div>
            
            {/* JD Input */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📋 Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onPaste={handleJDPaste}
                onBlur={handleJDBlur}
                placeholder="Paste the complete job description here... (Auto-formatted to remove extra spaces)"
                className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                ✨ Text is auto-cleaned on paste to optimize processing
              </p>
            </div>
            
            {/* Resume Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📄 Your Resume
              </label>
              {hasResumeContent ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <div>
                    <p className="font-medium text-green-800">{resume.personalInfo?.fullName || 'Resume Ready'}</p>
                    <p className="text-sm text-green-600">
                      {resume.skills?.technical?.length || 0} skills • {resume.experience?.length || 0} experiences
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <FaExclamationTriangle className="text-yellow-500 text-xl" />
                  <div>
                    <p className="font-medium text-yellow-800">No resume data</p>
                    <p className="text-sm text-yellow-600">
                      <button onClick={() => navigate('/builder')} className="underline">Add your resume</button> first for better analysis
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
            <div className="text-4xl font-bold text-primary-600 mb-4">
              {Math.round(analysisProgress)}%
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Skills...</h2>
            <p className="text-gray-600">Comparing resume with job requirements</p>
          </div>
        )}

        {/* Step: Report */}
        {step === 'report' && gapAnalysis && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Gap Analysis Report
              </h2>
              <p className="text-gray-600">
                {gapAnalysis.jobTitle} {gapAnalysis.company && `at ${gapAnalysis.company}`}
              </p>
            </div>
            
            {/* Match Score */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="text-6xl font-bold mb-2" style={{ 
                color: gapAnalysis.matchScore >= 70 ? '#16a34a' : gapAnalysis.matchScore >= 50 ? '#eab308' : '#dc2626' 
              }}>
                {gapAnalysis.matchScore}%
              </div>
              <p className="text-gray-600 mb-4">Match Score</p>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-green-700 mb-4">
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-red-700 mb-4">
                  <FaTimesCircle /> Missing ({gapAnalysis.missingSkills?.length || 0})
                </h3>
                <div className="space-y-2">
                  {gapAnalysis.missingSkills?.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${skill.priority === 'high' ? 'bg-red-500' : 'bg-red-300'}`} />
                      <span className="font-medium">{skill.name}</span>
                      <span className={`text-xs ml-auto px-2 py-0.5 rounded ${
                        skill.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{skill.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Weak */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-700 mb-4">
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
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3">💡 Recommendations</h3>
                <ul className="space-y-2">
                  {gapAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                      <span className="mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Auto-Tailor Resume Button (Inserted Before Roadmap) */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm mb-6 mt-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-900 mb-2">
                    <FaMagic className="text-purple-500" />
                    Auto-Tailor Your Resume
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Let our advanced AI rewrite your resume's summary and experience blurbs to perfectly align with this specific Job Description. It will seamlessly insert missing tracked skills like <span className="font-semibold text-indigo-600">{gapAnalysis.missingSkills?.[0]?.name || "those"}</span> where appropriate.
                  </p>
                </div>
                <button
                  onClick={handleAutoTailor}
                  disabled={isTailoring}
                  className={`py-3 px-6 rounded-xl font-bold text-white shadow-md transition-all flex items-center gap-2 flex-shrink-0 ${
                    isTailoring
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 hover:shadow-lg'
                  }`}
                >
                  {isTailoring ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Tailoring...
                    </>
                  ) : (
                    <>
                      <FaEdit />
                      Apply Tailored Resume
                    </>
                  )}
                </button>
              </div>
            </div>

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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Customize Your Roadmap
              </h2>
              <p className="text-gray-600">
                Tell us about your learning preferences
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              {/* Hours per day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🕐 Available Time (hours/day)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 4, 6].map(h => (
                    <button
                      key={h}
                      onClick={() => setLearnerProfile(p => ({ ...p, hoursPerDay: h }))}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        learnerProfile.hoursPerDay === h 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {h} hr{h > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Learning Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📈 Learning Speed
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['slow', 'moderate', 'fast'].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setLearnerProfile(p => ({ ...p, learningSpeed: speed }))}
                      className={`py-3 rounded-xl font-medium capitalize transition-all ${
                        learnerProfile.learningSpeed === speed 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Target Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🎯 Target Timeline
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[14, 30, 60, 90].map(days => (
                    <button
                      key={days}
                      onClick={() => setLearnerProfile(p => ({ ...p, targetDays: days }))}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        learnerProfile.targetDays === days 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {days < 30 ? `${days} days` : `${days/30} mo`}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preferred Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
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
                      className={`py-3 rounded-xl font-medium transition-all ${
                        learnerProfile.preferredStyle === style.value 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preferred Languages for Videos - Multi-select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🌐 Video Language Preferences
                </label>
                <p className="text-xs text-gray-500 mb-2">
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
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          isSelected 
                            ? 'bg-primary-50 border-primary-500 text-primary-700' 
                            : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-700'
                        }`}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Generating Your Roadmap
            </h2>
            <p className="text-gray-600 mb-8">{streamStatus}</p>
            
            {/* Progress Bar with Percentage */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Progress</span>
                <span className="text-lg font-bold text-primary-600">{Math.round(streamProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${streamProgress}%` }}
                />
                {/* Shimmer effect on progress bar */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                  style={{ 
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
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
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
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    🗺️ Your Practice Roadmap
                  </h2>
                  <p className="text-gray-600">
                    {roadmap.targetJob} • {roadmap.totalWeeks} weeks • ~{roadmap.totalHours} hours
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-600">{roadmap.totalWeeks}</p>
                  <p className="text-sm text-gray-500">weeks</p>
                </div>
              </div>
            </div>
            
            {/* Weeks */}
            <div className="space-y-4">
              {roadmap.weeks?.map((week, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-indigo-500 text-white p-4">
                    <h3 className="text-lg font-bold">Week {week.weekNumber}: {week.focus}</h3>
                    <p className="text-sm opacity-80">{week.totalHours} hours • {week.skills?.join(', ')}</p>
                  </div>
                  
                  <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Learn */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        📚 Learn ({week.learn?.hours} hrs)
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {week.learn?.topics?.map((topic, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="text-primary-500">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Resources - Handle both old array format and new object format */}
                      {week.learn?.resources && (
                        <div className="mt-4 space-y-3">
                          {/* NEW FORMAT: Object with videos/docs/courses */}
                          {week.learn.resources.videos?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                                📺 Videos ({week.learn.resources.videos.length})
                              </p>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {week.learn.resources.videos.map((vid, j) => (
                                  <a 
                                    key={j}
                                    href={vid.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition"
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        vid.level === 'beginner' ? 'bg-green-100 text-green-700' :
                                        vid.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {vid.level || 'video'}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-primary-600 truncate">{vid.title}</p>
                                        <p className="text-xs text-gray-500">
                                          {vid.channel && `${vid.channel} • `}{vid.duration}{vid.views && ` • ${vid.views}`}
                                        </p>
                                      </div>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Docs & Courses Row (New Format) */}
                          {(week.learn.resources.docs?.length > 0 || week.learn.resources.courses?.length > 0) && (
                            <div className="flex gap-4 flex-wrap">
                              {week.learn.resources.docs?.length > 0 && (
                                <div className="flex-1 min-w-32">
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">📄 Docs</p>
                                  {week.learn.resources.docs.slice(0, 2).map((doc, j) => (
                                    <a 
                                      key={j}
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-xs text-primary-600 hover:underline truncate"
                                    >
                                      {doc.title}
                                    </a>
                                  ))}
                                </div>
                              )}
                              {week.learn.resources.courses?.length > 0 && (
                                <div className="flex-1 min-w-32">
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">🎓 Courses</p>
                                  {week.learn.resources.courses.slice(0, 2).map((course, j) => (
                                    <a 
                                      key={j}
                                      href={course.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-xs text-primary-600 hover:underline truncate"
                                    >
                                      {course.title} {course.platform && `(${course.platform})`}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* OLD FORMAT: Array of resources */}
                          {Array.isArray(week.learn.resources) && week.learn.resources.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase mb-2">📚 Resources</p>
                              <div className="space-y-2">
                                {week.learn.resources.map((res, j) => (
                                  <a 
                                    key={j}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition"
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        res.type === 'video' ? 'bg-red-100 text-red-700' :
                                        res.type === 'docs' ? 'bg-blue-100 text-blue-700' :
                                        'bg-purple-100 text-purple-700'
                                      }`}>
                                        {res.type || 'link'}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-primary-600 truncate">{res.title}</p>
                                        {(res.views || res.duration) && (
                                          <p className="text-xs text-gray-500">
                                            {res.duration}{res.views && ` • ${res.views}`}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Practice */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        🛠️ Practice ({week.practice?.hours} hrs)
                      </h4>
                      <div className="space-y-3">
                        {week.practice?.projects?.map((project, j) => (
                          <div key={j} className="p-3 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                            <p className="font-medium text-gray-800">{project.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{project.description}</p>
                            {project.expectedErrors?.length > 0 && (
                              <p className="text-xs text-red-500 mt-2">
                                ⚠️ Expected: {project.expectedErrors.slice(0, 2).join(', ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Validation */}
                  {week.validation?.length > 0 && (
                    <div className="px-6 pb-6">
                      <h4 className="font-bold text-gray-800 mb-2">✅ Validation</h4>
                      <div className="flex flex-wrap gap-2">
                        {week.validation.map((v, j) => (
                          <span key={j} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Modification Chat */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaEdit /> Modify Your Roadmap
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={modifyRequest}
                  onChange={(e) => setModifyRequest(e.target.value)}
                  placeholder="e.g., 'Push Kubernetes to week 2' or 'Make React harder'"
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
              <p className="text-xs text-gray-400 mt-2">
                Examples: "I have less time", "Skip Docker, I know it", "Add more practice for React"
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('input')}
                className="flex-1 btn-secondary py-4"
              >
                Analyze Another JD
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 btn-primary py-4"
              >
                📤 Export / Print
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
