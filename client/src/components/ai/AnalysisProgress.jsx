import React, { useState, useEffect } from 'react'
import { FaFileAlt, FaRobot, FaSearch, FaChartLine, FaBrain, FaCheck } from 'react-icons/fa'

/**
 * Analysis Progress Component
 * Shows step-by-step progress while AI analyzes the resume
 */
const AnalysisProgress = ({ isAnalyzing }) => {
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps = [
    { icon: FaFileAlt, label: 'Parsing Resume', description: 'Extracting content and structure...' },
    { icon: FaRobot, label: 'AI Analysis', description: 'Agents analyzing your profile...' },
    { icon: FaSearch, label: 'ATS Scoring', description: 'Evaluating ATS compatibility...' },
    { icon: FaChartLine, label: 'Skill Matching', description: 'Identifying skill gaps...' },
    { icon: FaBrain, label: 'Career Insights', description: 'Generating recommendations...' },
  ]
  
  // Simulate progress through steps
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0)
      return
    }
    
    setCurrentStep(0)
    const intervals = [3000, 8000, 15000, 22000] // Timing for each step
    
    const timers = intervals.map((delay, index) => {
      return setTimeout(() => {
        setCurrentStep(index + 1)
      }, delay)
    })
    
    return () => timers.forEach(t => clearTimeout(t))
  }, [isAnalyzing])
  
  if (!isAnalyzing) return null
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="glass-effect rounded-2xl p-8 max-w-lg w-full mx-4 animate-fade-in relative overflow-hidden">
        {/* Scanning Line Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(249,115,22,0.05) 50%, transparent 100%)',
          height: '20px',
          width: '100%',
          animation: 'scanning-line 3s linear infinite',
        }} />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #f97316 0%, #06b6d4 100%)', boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)' }}>
            <FaRobot className="text-3xl text-obsidian-950 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>Analyzing Your Resume</h2>
          <p className="mt-2" style={{ color: '#a1a1aa' }}>Our AI agents are working on your analysis...</p>
        </div>
        
        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isComplete = index < currentStep
            
            return (
              <div 
                key={index}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 relative z-10 ${
                  isActive ? 'border' : 'border-transparent'
                }`}
                style={{
                  background: isActive ? 'rgba(249,115,22,0.06)' : 'transparent',
                  borderColor: isActive ? 'rgba(249,115,22,0.2)' : 'transparent',
                }}
              >
                {/* Step Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  isActive ? 'text-white' :
                  isComplete ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-600'
                }`} style={{
                  background: isActive ? 'linear-gradient(135deg, #f97316, #fb923c)' : undefined,
                  boxShadow: isActive ? '0 0 15px rgba(249, 115, 22, 0.3)' : 'none',
                }}>
                  {isComplete ? (
                    <FaCheck className="text-sm" />
                  ) : (
                    <Icon className={`text-sm ${isActive ? '' : ''}`} />
                  )}
                </div>
                
                {/* Step Text */}
                <div className="flex-1">
                  <p className={`font-medium`} style={{
                    color: isActive ? '#f97316' : isComplete ? '#22c55e' : '#52525b'
                  }}>
                    {step.label}
                  </p>
                  {isActive && (
                    <p className="text-sm animate-pulse" style={{ color: '#fb923c' }}>
                      {step.description}
                    </p>
                  )}
                </div>
                
                {/* Progress indicator for active step */}
                {isActive && (
                  <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#f97316', borderTopColor: 'transparent' }} />
                )}
              </div>
            )
          })}
        </div>
        
        {/* Estimated Time */}
        <div className="mt-6 pt-6 border-t text-center relative z-10" style={{ borderTopColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-sm" style={{ color: '#71717a' }}>
            Estimated time: <span className="font-medium" style={{ color: '#a1a1aa' }}>30-60 seconds</span>
          </p>
          <p className="text-xs mt-1" style={{ color: '#52525b' }}>
            Please wait while our AI agents complete the analysis
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 h-2 rounded-full overflow-hidden relative z-10" style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{ 
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #f97316, #06b6d4)',
              boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default AnalysisProgress
