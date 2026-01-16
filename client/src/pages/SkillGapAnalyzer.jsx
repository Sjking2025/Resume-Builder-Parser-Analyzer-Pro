import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHome, FaBullseye, FaSearch, FaRocket, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaClock, FaEdit, FaPaperPlane } from 'react-icons/fa'
import useResumeStore from '../store/useResumeStore'
import { API_ENDPOINTS } from '../config/api'

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
  
  // Learner profile
  const [learnerProfile, setLearnerProfile] = useState({
    hoursPerDay: 2,
    learningSpeed: 'moderate',
    targetDays: 30,
    preferredStyle: 'mixed'
  })
  
  // Stream progress
  const [streamProgress, setStreamProgress] = useState(0)
  const [streamStatus, setStreamStatus] = useState('')
  const [weeks, setWeeks] = useState([])
  
  // Modification
  const [modifyRequest, setModifyRequest] = useState('')
  const [isModifying, setIsModifying] = useState(false)

  // Check if resume has content
  const hasResumeContent = resume.personalInfo?.fullName || 
    resume.experience?.length > 0 || 
    resume.skills?.technical?.length > 0

  // Analyze skill gap
  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description')
      return
    }
    
    setStep('analyzing')
    setError(null)
    setIsLoading(true)
    
    try {
      const response = await fetch(API_ENDPOINTS.skillGapAnalyze, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resume_data: resume,
          job_description: jobDescription 
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze skill gap')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setGapAnalysis(result.data)
        setStep('report')
      } else {
        throw new Error(result.data?.error || 'Analysis failed')
      }
    } catch (err) {
      setError(err.message)
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate roadmap with SSE streaming
  const handleGenerateRoadmap = async () => {
    setStep('generating')
    setStreamProgress(0)
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
              
              setStreamProgress(data.progress || 0)
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
              onClick={() => navigate('/')}
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
                placeholder="Paste the complete job description here..."
                className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
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
            <FaSpinner className="text-6xl text-primary-500 animate-spin mb-6" />
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
            
            {/* Generate Roadmap Button */}
            <button
              onClick={() => setStep('profile')}
              className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2"
            >
              <FaRocket /> Generate Practice Roadmap
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
            <div className="text-6xl mb-6 animate-bounce">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Generating Your Roadmap
            </h2>
            <p className="text-gray-600 mb-8">{streamStatus}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-8 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${streamProgress}%` }}
              />
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
                      
                      {/* Resources */}
                      {week.learn?.resources?.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase">Resources</p>
                          {week.learn.resources.slice(0, 2).map((res, j) => (
                            <a 
                              key={j}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition"
                            >
                              <span className="font-medium text-primary-600">{res.title}</span>
                              {res.views && <span className="text-gray-400 ml-2 text-xs">{res.views} views</span>}
                            </a>
                          ))}
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
    </div>
  )
}

export default SkillGapAnalyzer
