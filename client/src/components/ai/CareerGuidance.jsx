import React from 'react'
import { FaGraduationCap, FaCertificate, FaRocket, FaCalendarAlt } from 'react-icons/fa'

/**
 * Career Guidance Component
 * Displays career recommendations, skills to learn, certifications, and project ideas
 */
const CareerGuidance = ({ 
  careerGuidance = '',
  recommendedSkills = [],
  recommendedCertifications = [],
  projectIdeas = []
}) => {
  if (!careerGuidance && recommendedSkills.length === 0 && 
      recommendedCertifications.length === 0 && projectIdeas.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaGraduationCap className="text-purple-500" /> Career Guidance
      </h3>

      {/* Overall Assessment */}
      {careerGuidance && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <p className="text-gray-700">{careerGuidance}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recommended Skills */}
        {recommendedSkills.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaRocket className="text-blue-500" /> Skills to Learn
            </h4>
            <ul className="space-y-2">
              {recommendedSkills.map((skill, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700">{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Certifications */}
        {recommendedCertifications.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaCertificate className="text-green-500" /> Certifications
            </h4>
            <ul className="space-y-2">
              {recommendedCertifications.map((cert, idx) => (
                <li key={idx} className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm text-gray-700">{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Project Ideas */}
        {projectIdeas.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-orange-500" /> Project Ideas
            </h4>
            <ul className="space-y-2">
              {projectIdeas.map((project, idx) => (
                <li key={idx} className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-sm text-gray-700">{project}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default CareerGuidance
