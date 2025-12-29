import React from 'react'
import { FaLightbulb, FaArrowRight, FaCopy, FaCheck } from 'react-icons/fa'

/**
 * Improvement Suggestions Component
 * Displays bullet point improvements and content enhancement suggestions
 */
const ImprovementSuggestions = ({ 
  improvements = [], 
  strengths = [], 
  weaknesses = [],
  onApplyImprovement
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState(null)

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaLightbulb className="text-yellow-500" /> Improvement Suggestions
      </h3>

      {/* Strengths & Weaknesses Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
            <ul className="space-y-1">
              {strengths.slice(0, 5).map((strength, idx) => (
                <li key={idx} className="text-sm text-green-600 flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-700 mb-2">Areas to Improve</h4>
            <ul className="space-y-1">
              {weaknesses.slice(0, 5).map((weakness, idx) => (
                <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                  <span className="text-red-500">!</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bullet Point Improvements */}
      {improvements.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Suggested Rewrites</h4>
          
          {improvements.map((improvement, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                {improvement.section} Section
              </div>
              
              {/* Original */}
              <div className="mb-3">
                <span className="text-xs font-medium text-gray-500">Original:</span>
                <p className="text-sm text-gray-600 line-through">{improvement.original}</p>
              </div>
              
              {/* Improved */}
              <div className="flex items-start gap-2">
                <FaArrowRight className="text-green-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs font-medium text-green-600">Improved:</span>
                  <p className="text-sm text-gray-800 font-medium">{improvement.improved}</p>
                </div>
                <button
                  onClick={() => handleCopy(improvement.improved, idx)}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedIndex === idx ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaCopy />
                  )}
                </button>
              </div>
              
              {/* Reason */}
              {improvement.reason && (
                <p className="mt-2 text-xs text-gray-500 italic">{improvement.reason}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {improvements.length === 0 && strengths.length === 0 && weaknesses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FaLightbulb className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>Complete the analysis to see improvement suggestions</p>
        </div>
      )}
    </div>
  )
}

export default ImprovementSuggestions
