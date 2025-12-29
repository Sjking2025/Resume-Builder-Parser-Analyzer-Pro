import React, { useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa'

const PersonalInfoForm = () => {
  const { resume, updatePersonalInfo } = useResumeStore()
  const [localData, setLocalData] = useState(resume.personalInfo)

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    updatePersonalInfo({ [field]: value })
  }

  return (
    <div className="section-card">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaUser className="text-primary-600" />
        Personal Information
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={localData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="John Doe"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaEnvelope className="text-gray-500" /> Email *
            </label>
            <input
              type="email"
              value={localData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaPhone className="text-gray-500" /> Phone
            </label>
            <input
              type="tel"
              value={localData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 234 567 8900"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <FaMapMarkerAlt className="text-gray-500" /> Location
          </label>
          <input
            type="text"
            value={localData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="San Francisco, CA"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaLinkedin className="text-gray-500" /> LinkedIn
            </label>
            <input
              type="url"
              value={localData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaGithub className="text-gray-500" /> GitHub
            </label>
            <input
              type="url"
              value={localData.github}
              onChange={(e) => handleChange('github', e.target.value)}
              placeholder="https://github.com/username"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaGlobe className="text-gray-500" /> Portfolio
            </label>
            <input
              type="url"
              value={localData.portfolio}
              onChange={(e) => handleChange('portfolio', e.target.value)}
              placeholder="https://yoursite.com"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
          <textarea
            value={localData.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            placeholder="A brief summary of your professional background and career goals..."
            rows="4"
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">2-3 sentences highlighting your key strengths</p>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfoForm
