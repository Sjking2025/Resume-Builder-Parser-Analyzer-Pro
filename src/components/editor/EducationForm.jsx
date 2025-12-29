import React, { useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { FaGraduationCap, FaPlus, FaTrash } from 'react-icons/fa'

const EducationForm = () => {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore()
  const [editingIndex, setEditingIndex] = useState(null)

  const emptyEducation = {
    degree: '',
    field: '',
    institution: '',
    location: '',
    graduationDate: '',
    gpa: '',
  }

  const [newEducation, setNewEducation] = useState(emptyEducation)

  const handleAdd = () => {
    if (newEducation.degree && newEducation.institution) {
      addEducation(newEducation)
      setNewEducation(emptyEducation)
    }
  }

  const handleUpdate = (index, field, value) => {
    updateEducation(index, { [field]: value })
  }

  return (
    <div className="section-card">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaGraduationCap className="text-primary-600" />
        Education
      </h3>

      {/* Existing Education */}
      {resume.education.map((edu, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-gray-900">{edu.degree} {edu.field && `in ${edu.field}`}</h4>
            <button
              onClick={() => removeEducation(index)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <FaTrash />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={edu.degree}
              onChange={(e) => handleUpdate(index, 'degree', e.target.value)}
              placeholder="Degree (e.g., Bachelor of Science)"
              className="input-field text-sm"
            />
            <input
              type="text"
              value={edu.field}
              onChange={(e) => handleUpdate(index, 'field', e.target.value)}
              placeholder="Field of Study"
              className="input-field text-sm"
            />
            <input
              type="text"
              value={edu.institution}
              onChange={(e) => handleUpdate(index, 'institution', e.target.value)}
              placeholder="Institution Name"
              className="input-field text-sm"
            />
            <input
              type="text"
              value={edu.location}
              onChange={(e) => handleUpdate(index, 'location', e.target.value)}
              placeholder="Location"
              className="input-field text-sm"
            />
            <input
              type="text"
              value={edu.graduationDate}
              onChange={(e) => handleUpdate(index, 'graduationDate', e.target.value)}
              placeholder="Graduation Date (e.g., May 2024)"
              className="input-field text-sm"
            />
            <input
              type="text"
              value={edu.gpa}
              onChange={(e) => handleUpdate(index, 'gpa', e.target.value)}
              placeholder="GPA (optional)"
              className="input-field text-sm"
            />
          </div>
        </div>
      ))}

      {/* Add New Education */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-3">Add Education</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            value={newEducation.degree}
            onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            placeholder="Degree *"
            className="input-field text-sm"
          />
          <input
            type="text"
            value={newEducation.field}
            onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
            placeholder="Field of Study"
            className="input-field text-sm"
          />
          <input
            type="text"
            value={newEducation.institution}
            onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
            placeholder="Institution Name *"
            className="input-field text-sm"
          />
          <input
            type="text"
            value={newEducation.location}
            onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
            placeholder="Location"
            className="input-field text-sm"
          />
          <input
            type="text"
            value={newEducation.graduationDate}
            onChange={(e) => setNewEducation({ ...newEducation, graduationDate: e.target.value })}
            placeholder="Graduation Date"
            className="input-field text-sm"
          />
          <input
            type="text"
            value={newEducation.gpa}
            onChange={(e) => setNewEducation({ ...newEducation, gpa: e.target.value })}
            placeholder="GPA (optional)"
            className="input-field text-sm"
          />
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
          disabled={!newEducation.degree || !newEducation.institution}
        >
          <FaPlus /> Add Education
        </button>
      </div>
    </div>
  )
}

export default EducationForm
