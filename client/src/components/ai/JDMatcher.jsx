import React from 'react'
import { FaBriefcase, FaSpinner } from 'react-icons/fa'

/**
 * JD Matcher Component
 * Input for job description and displays match results
 */
const JDMatcher = ({ 
  jobDescription, 
  setJobDescription, 
  matchPercentage, 
  matchDetails,
  tailoredSummary,
  isLoading 
}) => {
  // Determine color based on match percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100'
    if (percentage >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="section-card rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>
        <FaBriefcase style={{ color: '#f97316' }} /> Job Description Matching
      </h3>

      {/* Job Description Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#a1a1aa' }}>
          Paste Job Description (optional)
        </label>
        <textarea
          value={jobDescription || ''}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to see how well your resume matches the requirements..."
          className="input-field w-full h-40 p-3 resize-none text-sm"
        />
        <p className="text-xs mt-1" style={{ color: '#52525b' }}>
          Adding a job description enables keyword matching and tailored recommendations
        </p>
      </div>

      {/* Match Results */}
      {matchPercentage !== null && matchPercentage !== undefined && (
        <div className="mt-6 pt-6 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold" style={{ color: '#a1a1aa' }}>Match Score</h4>
            <div className={`px-4 py-2 rounded-full font-bold text-lg`} style={{
              background: 'rgba(249,115,22,0.1)',
              color: '#f97316',
              border: '1px solid rgba(249,115,22,0.2)'
            }}>
              {matchPercentage}%
            </div>
          </div>

          {/* Match Progress Bar */}
          <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div
              className={`h-full rounded-full transition-all duration-700`}
              style={{ 
                width: `${matchPercentage}%`,
                background: 'linear-gradient(90deg, #f97316 0%, #06b6d4 100%)',
                boxShadow: '0 0 10px rgba(249,115,22,0.3)'
              }}
            />
          </div>

          {/* Match Details */}
          {matchDetails && (
            <p className="text-sm mb-4" style={{ color: '#a1a1aa' }}>{matchDetails}</p>
          )}

          {/* Tailored Summary Suggestion */}
          {tailoredSummary && (
            <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)' }}>
              <h5 className="font-semibold mb-2" style={{ color: '#f97316' }}>Suggested Summary for This Role</h5>
              <p className="text-sm" style={{ color: '#e4e4e7' }}>{tailoredSummary}</p>
              <button
                onClick={() => navigator.clipboard.writeText(tailoredSummary)}
                className="mt-2 text-xs text-primary-600 hover:text-primary-700 underline"
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <FaSpinner className="animate-spin mr-2" />
          Analyzing match...
        </div>
      )}
    </div>
  )
}

export default JDMatcher
