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
    <div className="section-card rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-6" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>ATS Compatibility Score</h3>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular Score */}
        <div className="w-40 h-40 flex-shrink-0">
          <CircularProgressbar
            value={score}
            text={`${score}`}
            styles={buildStyles({
              textSize: '28px',
              pathColor: '#f97316',
              textColor: '#f97316',
              trailColor: 'rgba(255,255,255,0.03)',
              pathTransitionDuration: 0.5,
            })}
          />
          <p className="text-center mt-2 font-semibold" style={{ color: scoreColor }}>
            {getScoreLabel(score)}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="flex-1 w-full">
          <h4 className="font-semibold mb-3" style={{ color: '#a1a1aa' }}>Score Breakdown</h4>
          <div className="space-y-3">
            {scoreComponents.map((component) => (
              <div key={component.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: '#71717a' }}>{component.label}</span>
                  <span className="font-medium" style={{ color: '#e4e4e7' }}>
                    {component.value}/100 
                    <span className="text-xs ml-1" style={{ color: '#52525b' }}>({component.weight})</span>
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${component.value}%`,
                      background: 'linear-gradient(90deg, #f97316 0%, #06b6d4 100%)'
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
        <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-sm whitespace-pre-line" style={{ color: '#a1a1aa' }}>{explanation}</p>
        </div>
      )}
    </div>
  )
}

export default ATSScoreCard
