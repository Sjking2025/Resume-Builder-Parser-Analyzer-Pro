import React, { useState, useRef } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaGlobe, FaCamera, FaUpload, FaTrash, FaCrop } from 'react-icons/fa'
import PhotoEditorModal from './PhotoEditorModal'

const PersonalInfoForm = () => {
  const { resume, updatePersonalInfo, togglePhoto, updatePhoto } = useResumeStore()
  const [localData, setLocalData] = useState(resume.personalInfo)
  
  // Photo state
  const fileInputRef = useRef(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [tempImageSrc, setTempImageSrc] = useState(null)

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    updatePersonalInfo({ [field]: value })
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      // Validate size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.')
        return
      }
      
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setTempImageSrc(reader.result)
        setIsCropModalOpen(true)
      })
      reader.readAsDataURL(file)
      // reset input
      e.target.value = null
    }
  }

  const handleSaveCrop = (croppedData) => {
    updatePhoto(croppedData)
    setIsCropModalOpen(false)
    setTempImageSrc(null)
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

        {/* Passport Photo Section */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-bold text-gray-800 flex items-center gap-2">
                <FaCamera className="text-gray-500" /> Optional Passport Photo
              </h4>
              <p className="text-xs text-gray-500 mt-1">Enable to include a professional profile photo.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={resume.photo?.enabled || false}
                onChange={(e) => togglePhoto(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {resume.photo?.enabled && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
              />
              
              {!resume.photo.croppedImage ? (
                <div className="text-center py-6">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                  >
                    <FaUpload /> Upload Photo
                  </button>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG, or WEBP. Max 5MB.</p>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="shrink-0 relative">
                    <img 
                      src={resume.photo.croppedImage} 
                      alt="Profile" 
                      className={`w-24 h-24 object-cover border-2 border-white shadow-md ${resume.photo.shape === 'round' ? 'rounded-full' : 'rounded-lg'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-2"
                    >
                      <FaUpload /> Replace Image
                    </button>
                    {resume.photo.originalImage && (
                      <button
                        onClick={() => {
                          setTempImageSrc(resume.photo.originalImage)
                          setIsCropModalOpen(true)
                        }}
                        className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-2"
                      >
                        <FaCrop /> Re-crop Image
                      </button>
                    )}
                    <button
                      onClick={() => updatePhoto({ originalImage: null, croppedImage: null })}
                      className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-2"
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isCropModalOpen && tempImageSrc && (
        <PhotoEditorModal
          imageSrc={tempImageSrc}
          onSave={handleSaveCrop}
          onCancel={() => {
            setIsCropModalOpen(false)
            setTempImageSrc(null)
          }}
        />
      )}
    </div>
  )
}

export default PersonalInfoForm
