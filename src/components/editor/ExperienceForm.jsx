import React, { useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { FaBriefcase, FaPlus, FaTrash } from 'react-icons/fa'

const ExperienceForm = () => {
  const { resume, addExperience, updateExperience, removeExperience } = useResumeStore()

  const emptyExperience = {
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  }

  const [newExperience, setNewExperience] = useState(emptyExperience)

  const handleAdd = () => {
    if (newExperience.title && newExperience.company) {
      addExperience(newExperience)
      setNewExperience(emptyExperience)
    }
  }

  const handleUpdate = (index, field, value) => {
    updateExperience(index, { [field]: value })
  }

  return (
    <div className="section-card">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaBriefcase className="text-primary-600" />
        Work Experience
      </h3>

      {/* Existing Experience */}
      {resume.experience.map((exp, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-gray-900">{exp.title} at {exp.company}</h4>
            <button
              onClick={() => removeExperience(index)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <FaTrash />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={exp.title}
                onChange={(e) => handleUpdate(index, 'title', e.target.value)}
                placeholder="Job Title"
                className="input-field text-sm"
              />
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleUpdate(index, 'company', e.target.value)}
                placeholder="Company Name"
                className="input-field text-sm"
              />
            </div>
            
            <input
              type="text"
              value={exp.location}
              onChange={(e) => handleUpdate(index, 'location', e.target.value)}
              placeholder="Location"
              className="input-field text-sm"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={exp.startDate}
                onChange={(e) => handleUpdate(index, 'startDate', e.target.value)}
                placeholder="Start Date (e.g., Jan 2023)"
                className="input-field text-sm"
              />
              <input
                type="text"
                value={exp.endDate}
                onChange={(e) => handleUpdate(index, 'endDate', e.target.value)}
                placeholder="End Date"
                className="input-field text-sm"
                disabled={exp.current}
              />
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={exp.current}
                onChange={(e) => handleUpdate(index, 'current', e.target.checked)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700">I currently work here</span>
            </label>
            
            <textarea
              value={exp.description}
              onChange={(e) => handleUpdate(index, 'description', e.target.value)}
              placeholder="Key responsibilities and achievements (one per line, start with action verbs)"
              rows="5"
              className="input-field text-sm resize-none"
            />
          </div>
        </div>
      ))}

      {/* Add New Experience */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-3">Add Work Experience</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newExperience.title}
              onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
              placeholder="Job Title *"
              className="input-field text-sm"
            />
            <input
              type="text"
              value={newExperience.company}
              onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
              placeholder="Company Name *"
              className="input-field text-sm"
            />
          </div>
          
          <input
            type="text"
            value={newExperience.location}
            onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
            placeholder="Location"
            className="input-field text-sm"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newExperience.startDate}
              onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
              placeholder="Start Date"
              className="input-field text-sm"
            />
            <input
              type="text"
              value={newExperience.endDate}
              onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
              placeholder="End Date"
              className="input-field text-sm"
              disabled={newExperience.current}
            />
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newExperience.current}
              onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked })}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700">I currently work here</span>
          </label>
          
          <textarea
            value={newExperience.description}
            onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
            placeholder="Key responsibilities and achievements (one per line)"
            rows="5"
            className="input-field text-sm resize-none"
          />
          
          <button
            onClick={handleAdd}
            className="btn-primary flex items-center gap-2"
            disabled={!newExperience.title || !newExperience.company}
          >
            <FaPlus /> Add Experience
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExperienceForm
