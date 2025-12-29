import React from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa'

/**
 * Skill Gap Analysis Component
 * Displays matched and missing skills with importance levels
 */
const SkillGapAnalysis = ({ 
  matchedSkills = [], 
  missingSkills = [], 
  skillGaps = [],
  matchedKeywords = [],
  missingKeywords = []
}) => {
  const getImportanceColor = (importance) => {
    switch (importance?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'important':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getImportanceIcon = (importance) => {
    switch (importance?.toLowerCase()) {
      case 'critical':
        return <FaTimesCircle className="text-red-500" />
      case 'important':
        return <FaExclamationTriangle className="text-yellow-500" />
      default:
        return <FaCheckCircle className="text-blue-500" />
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Skill & Keyword Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div>
          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
            <FaCheckCircle /> Skills You Have
          </h4>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.length > 0 ? (
              matchedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Add a job description to see matched skills</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div>
          <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
            <FaTimesCircle /> Skills to Add
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No missing skills identified</p>
            )}
          </div>
        </div>
      </div>

      {/* Keyword Match */}
      {(matchedKeywords.length > 0 || missingKeywords.length > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-3">Keyword Analysis</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedKeywords.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Keywords Found ({matchedKeywords.length})</p>
                <div className="flex flex-wrap gap-1">
                  {matchedKeywords.slice(0, 10).map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs">
                      {kw}
                    </span>
                  ))}
                  {matchedKeywords.length > 10 && (
                    <span className="px-2 py-0.5 text-gray-500 text-xs">+{matchedKeywords.length - 10} more</span>
                  )}
                </div>
              </div>
            )}
            
            {missingKeywords.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Keywords Missing ({missingKeywords.length})</p>
                <div className="flex flex-wrap gap-1">
                  {missingKeywords.slice(0, 10).map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">
                      {kw}
                    </span>
                  ))}
                  {missingKeywords.length > 10 && (
                    <span className="px-2 py-0.5 text-gray-500 text-xs">+{missingKeywords.length - 10} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Skill Gaps with Recommendations */}
      {skillGaps.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-3">Skill Gap Recommendations</h4>
          <div className="space-y-3">
            {skillGaps.map((gap, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${getImportanceColor(gap.importance)}`}
              >
                <div className="flex items-start gap-2">
                  {getImportanceIcon(gap.importance)}
                  <div>
                    <p className="font-medium">{gap.skill}</p>
                    <p className="text-sm opacity-80 mt-1">{gap.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillGapAnalysis
