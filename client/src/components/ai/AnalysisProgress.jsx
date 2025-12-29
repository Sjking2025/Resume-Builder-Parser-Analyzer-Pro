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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaRobot className="text-3xl text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Analyzing Your Resume</h2>
          <p className="text-gray-500 mt-2">Our AI agents are working on your analysis...</p>
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
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
                  isActive ? 'bg-primary-50 border border-primary-200' :
                  isComplete ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                {/* Step Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  isActive ? 'bg-primary-500 text-white' :
                  isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {isComplete ? (
                    <FaCheck className="text-sm" />
                  ) : (
                    <Icon className={`text-sm ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                
                {/* Step Text */}
                <div className="flex-1">
                  <p className={`font-medium ${
                    isActive ? 'text-primary-700' :
                    isComplete ? 'text-green-700' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {isActive && (
                    <p className="text-sm text-primary-500 animate-pulse">
                      {step.description}
                    </p>
                  )}
                </div>
                
                {/* Progress indicator for active step */}
                {isActive && (
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            )
          })}
        </div>
        
        {/* Estimated Time */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Estimated time: <span className="font-medium">30-60 seconds</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Please wait while our AI agents complete the analysis
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-primary-500 rounded-full transition-all duration-1000"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default AnalysisProgress
