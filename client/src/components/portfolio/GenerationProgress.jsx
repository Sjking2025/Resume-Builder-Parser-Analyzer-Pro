import React from 'react'
import { FaCheckCircle, FaSpinner } from 'react-icons/fa'

/**
 * GenerationProgress - Shows real-time portfolio generation progress
 * Displays progress bar, current stage, and section statuses
 */
const GenerationProgress = ({ progress, currentStatus, completedSections, currentSection }) => {
  const sections = [
    { id: 'hero', label: 'Hero Section', icon: '🦸' },
    { id: 'about', label: 'About Section', icon: '👤' },
    { id: 'skills', label: 'Skills Section', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'contact', label: 'Contact', icon: '📧' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🚀</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Generating Your Portfolio
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {currentStatus || 'Preparing...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sections.map((section) => {
            const isCompleted = completedSections?.includes(section.id)
            const isCurrent = currentSection === section.id
            
            return (
              <div
                key={section.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                    : isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <FaCheckCircle className="w-5 h-5 text-green-500" />
                  ) : isCurrent ? (
                    <FaSpinner className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{section.icon}</span>
                    <span
                      className={`text-sm font-medium ${
                        isCurrent
                          ? 'text-blue-700 dark:text-blue-300'
                          : isCompleted
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {section.label}
                    </span>
                  </div>
                  {isCurrent && currentStatus && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 animate-pulse">
                      {currentStatus}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Complete State */}
        {progress === 100 && (
          <div className="text-center py-4">
            <div className="text-5xl mb-2 animate-bounce">✨</div>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              Portfolio Ready!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GenerationProgress
