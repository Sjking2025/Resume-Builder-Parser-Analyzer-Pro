import React, { useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { FaTrophy, FaPlus, FaTrash, FaCertificate, FaMedal } from 'react-icons/fa'

const AchievementsForm = () => {
  const { resume, addAchievement, updateAchievement, removeAchievement } = useResumeStore()

  const emptyAchievement = {
    title: '',
    date: '',
    issuer: '',
    description: '',
  }

  const [newAchievement, setNewAchievement] = useState(emptyAchievement)

  const handleAdd = () => {
    if (newAchievement.title) {
      addAchievement(newAchievement)
      setNewAchievement(emptyAchievement)
    }
  }

  const handleUpdate = (index, field, value) => {
    updateAchievement(index, { [field]: value })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newAchievement.title) {
      handleAdd()
    }
  }

  return (
    <div className="section-card">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaTrophy className="text-yellow-500" />
        Achievements & Certifications
      </h3>

      <p className="text-gray-600 text-sm mb-4">
        Add your awards, certifications, honors, and notable accomplishments.
      </p>

      {/* Existing Achievements */}
      {resume.achievements.length > 0 && (
        <div className="space-y-3 mb-6">
          {resume.achievements.map((achievement, index) => (
            <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200 shadow-sm">
              <div className="flex items-start gap-3">
                <FaMedal className="text-yellow-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Title Row */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Achievement/Certification Title</label>
                    <input
                      type="text"
                      value={achievement.title}
                      onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                      placeholder="e.g., AWS Certified Solutions Architect"
                      className="input-field text-sm"
                    />
                  </div>
                  
                  {/* Date and Issuer Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Date/Year</label>
                      <input
                        type="text"
                        value={achievement.date || ''}
                        onChange={(e) => handleUpdate(index, 'date', e.target.value)}
                        placeholder="e.g., 2024 or Jan 2024"
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Issuer (optional)</label>
                      <input
                        type="text"
                        value={achievement.issuer || ''}
                        onChange={(e) => handleUpdate(index, 'issuer', e.target.value)}
                        placeholder="e.g., Amazon Web Services"
                        className="input-field text-sm"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
                    <input
                      type="text"
                      value={achievement.description || ''}
                      onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                      placeholder="Brief description of the achievement"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={() => removeAchievement(index)}
                  className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
                  title="Remove achievement"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {resume.achievements.length === 0 && (
        <div className="text-center py-8 text-gray-500 mb-4">
          <FaCertificate className="text-4xl mx-auto mb-2 text-gray-300" />
          <p>No achievements added yet</p>
          <p className="text-sm">Add your certifications, awards, and honors below</p>
        </div>
      )}

      {/* Add New Achievement */}
      <div className="border-2 border-dashed border-yellow-300 rounded-lg p-4 bg-yellow-50/50">
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaPlus className="text-yellow-600" />
          Add New Achievement
        </h4>
        
        <div className="space-y-3">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              value={newAchievement.title}
              onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="e.g., AWS Certified Solutions Architect, Dean's List, First Place Hackathon"
              className="input-field text-sm"
            />
          </div>

          {/* Date and Issuer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date/Year</label>
              <input
                type="text"
                value={newAchievement.date}
                onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 2024"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Issuer (optional)</label>
              <input
                type="text"
                value={newAchievement.issuer || ''}
                onChange={(e) => setNewAchievement({ ...newAchievement, issuer: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Google, University"
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
            <input
              type="text"
              value={newAchievement.description || ''}
              onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="Brief description of the achievement"
              className="input-field text-sm"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={!newAchievement.title.trim()}
          >
            <FaPlus /> Add Achievement
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>💡 Tips:</strong> Include certifications (AWS, Google, etc.), academic honors (Dean's List, scholarships), 
          competition achievements (hackathons, olympiads), and professional recognitions.
        </p>
      </div>
    </div>
  )
}

export default AchievementsForm
