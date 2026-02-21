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
    <div className="section-card rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>
        <FaGraduationCap style={{ color: '#06b6d4' }} /> Career Guidance
      </h3>

      {/* Overall Assessment */}
      {careerGuidance && (
        <div className="mb-6 p-4 rounded-lg border" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}>
          <p style={{ color: '#e4e4e7' }}>{careerGuidance}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recommended Skills */}
        {recommendedSkills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#a1a1aa' }}>
              <FaRocket style={{ color: '#06b6d4' }} /> Skills to Learn
            </h4>
            <ul className="space-y-2">
              {recommendedSkills.map((skill, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}>
                    {idx + 1}
                  </span>
                  <span className="text-sm" style={{ color: '#a1a1aa' }}>{skill}</span>
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
