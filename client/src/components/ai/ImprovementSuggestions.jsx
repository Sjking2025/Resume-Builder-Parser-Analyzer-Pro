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
    <div className="section-card rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>
        <FaLightbulb style={{ color: '#eab308' }} /> Improvement Suggestions
      </h3>

      {/* Strengths & Weaknesses Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="p-4 rounded-lg border" style={{ background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.15)' }}>
            <h4 className="font-semibold mb-2" style={{ color: '#22c55e' }}>Strengths</h4>
            <ul className="space-y-1">
              {strengths.slice(0, 5).map((strength, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2" style={{ color: '#22c55e' }}>
                  <span>✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div className="p-4 rounded-lg border" style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}>
            <h4 className="font-semibold mb-2" style={{ color: '#ef4444' }}>Areas to Improve</h4>
            <ul className="space-y-1">
              {weaknesses.slice(0, 5).map((weakness, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2" style={{ color: '#ef4444' }}>
                  <span>!</span>
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
          <h4 className="font-semibold" style={{ color: '#a1a1aa' }}>Suggested Rewrites</h4>
          {improvements.map((improvement, idx) => (
            <div key={idx} className="p-4 rounded-lg border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-xs mb-2 uppercase tracking-wide" style={{ color: '#52525b' }}>
                {improvement.section} Section
              </div>
              
              {/* Original */}
              <div className="mb-3">
                <span className="text-xs font-medium" style={{ color: '#52525b' }}>Original:</span>
                <p className="text-sm line-through" style={{ color: '#71717a' }}>{improvement.original}</p>
              </div>
              
              {/* Improved */}
              <div className="flex items-start gap-2">
                <FaArrowRight style={{ color: '#22c55e', marginTop: '0.25rem', flexShrink: 0 }} />
                <div className="flex-1">
                  <span className="text-xs font-medium" style={{ color: '#22c55e' }}>Improved:</span>
                  <p className="text-sm font-medium" style={{ color: '#e4e4e7' }}>{improvement.improved}</p>
                </div>
                <button
                  onClick={() => handleCopy(improvement.improved, idx)}
                  className="p-2 transition-colors"
                  style={{ color: '#52525b' }}
                  title="Copy to clipboard"
                >
                  {copiedIndex === idx ? (
                    <FaCheck style={{ color: '#22c55e' }} />
                  ) : (
                    <FaCopy className="hover:text-primary-500" />
                  )}
                </button>
              </div>
              
              {/* Reason */}
              {improvement.reason && (
                <p className="mt-2 text-xs italic" style={{ color: '#52525b' }}>{improvement.reason}</p>
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
