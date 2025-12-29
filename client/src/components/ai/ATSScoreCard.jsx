import React from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

/**
 * ATS Score Card Component
 * Displays the ATS score with a circular progress bar and breakdown
 */
const ATSScoreCard = ({ score, breakdown, explanation }) => {
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981' // green
    if (score >= 60) return '#f59e0b' // yellow
    if (score >= 40) return '#f97316' // orange
    return '#ef4444' // red
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Work'
  }

  const scoreColor = getScoreColor(score)

  // Score components with weights
  const scoreComponents = [
    { label: 'Keyword Match', value: breakdown?.keyword_match || 0, weight: '35%' },
    { label: 'Experience Relevance', value: breakdown?.experience_relevance || 0, weight: '25%' },
    { label: 'Formatting', value: breakdown?.formatting_score || 0, weight: '20%' },
    { label: 'Skill Coverage', value: breakdown?.skill_coverage || 0, weight: '10%' },
    { label: 'Language Quality', value: breakdown?.language_quality || 0, weight: '10%' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">ATS Compatibility Score</h3>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular Score */}
        <div className="w-40 h-40 flex-shrink-0">
          <CircularProgressbar
            value={score}
            text={`${score}`}
            styles={buildStyles({
              textSize: '28px',
              pathColor: scoreColor,
              textColor: scoreColor,
              trailColor: '#e5e7eb',
              pathTransitionDuration: 0.5,
            })}
          />
          <p className="text-center mt-2 font-semibold" style={{ color: scoreColor }}>
            {getScoreLabel(score)}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="flex-1 w-full">
          <h4 className="font-semibold text-gray-700 mb-3">Score Breakdown</h4>
          <div className="space-y-3">
            {scoreComponents.map((component) => (
              <div key={component.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{component.label}</span>
                  <span className="font-medium">
                    {component.value}/100 
                    <span className="text-gray-400 text-xs ml-1">({component.weight})</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${component.value}%`,
                      backgroundColor: getScoreColor(component.value)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 whitespace-pre-line">{explanation}</p>
        </div>
      )}
    </div>
  )
}

export default ATSScoreCard
