import React, { useState } from 'react'
import { FaBriefcase, FaSpinner, FaMagic } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import useResumeStore from '../../store/useResumeStore'

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
  const navigate = useNavigate()
  const { resume, loadResume } = useResumeStore()
  const [isTailoring, setIsTailoring] = useState(false)
  const [tailorError, setTailorError] = useState(null)

  // Handle auto-tailoring the entire resume
  const handleAutoTailor = async () => {
    if (!jobDescription || !resume) return

    setIsTailoring(true)
    setTailorError(null)

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
      setTailorError(err.message)
    } finally {
      setIsTailoring(false)
    }
  }

  // Determine color based on match percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100'
    if (percentage >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FaBriefcase className="text-primary-500" /> Job Description Matching
      </h3>

      {/* Job Description Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste Job Description (optional)
        </label>
        <textarea
          value={jobDescription || ''}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to see how well your resume matches the requirements..."
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Adding a job description enables keyword matching and tailored recommendations
        </p>
      </div>

      {/* Match Results */}
      {matchPercentage !== null && matchPercentage !== undefined && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-700">Match Score</h4>
            <div className={`px-4 py-2 rounded-full font-bold text-lg ${getMatchColor(matchPercentage)}`}>
              {matchPercentage}%
            </div>
          </div>

          {/* Match Progress Bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                matchPercentage >= 80 ? 'bg-green-500' :
                matchPercentage >= 60 ? 'bg-yellow-500' :
                matchPercentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${matchPercentage}%` }}
            />
          </div>

          {/* Match Details */}
          {matchDetails && (
            <p className="text-sm text-gray-600 mb-4">{matchDetails}</p>
          )}

          {/* Tailored Summary Suggestion */}
          {tailoredSummary && (
            <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <h5 className="font-semibold text-primary-700 mb-2">Suggested Summary for This Role</h5>
              <p className="text-sm text-gray-700">{tailoredSummary}</p>
              <button
                onClick={() => navigator.clipboard.writeText(tailoredSummary)}
                className="mt-2 text-xs text-primary-600 hover:text-primary-700 underline"
              >
                Copy to clipboard
              </button>
            </div>
          )}

          {/* Auto-Tailor Action */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h5 className="font-semibold text-gray-800 mb-2">Want a perfect match?</h5>
            <p className="text-sm text-gray-600 mb-4">
              Let AI completely rewrite your resume to perfectly align with this job description.
              This will add missing skills and rewrite your experience bullet points.
            </p>
            
            {tailorError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                ❌ {tailorError}
              </div>
            )}

            <button
              onClick={handleAutoTailor}
              disabled={isTailoring || isLoading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                isTailoring || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-primary-500/30 hover:shadow-lg'
              }`}
            >
              {isTailoring ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Auto-Tailoring Resume... (This may take a minute)
                </>
              ) : (
                <>
                  <FaMagic />
                  Auto-Tailor Entire Resume to JD
                </>
              )}
            </button>
          </div>
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
