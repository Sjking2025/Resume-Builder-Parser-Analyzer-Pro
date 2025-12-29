import React, { useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { FaLightbulb, FaTimes } from 'react-icons/fa'

const SkillsForm = () => {
  const { resume, updateSkills } = useResumeStore()
  const [inputValues, setInputValues] = useState({
    technical: '',
    soft: '',
    languages: '',
  })

  const handleAddSkill = (category) => {
    const value = inputValues[category].trim()
    if (value && !resume.skills[category].includes(value)) {
      updateSkills(category, [...resume.skills[category], value])
      setInputValues({ ...inputValues, [category]: '' })
    }
  }

  const handleRemoveSkill = (category, skillToRemove) => {
    updateSkills(
      category,
      resume.skills[category].filter((skill) => skill !== skillToRemove)
    )
  }

  const handleKeyPress = (e, category) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill(category)
    }
  }

  const renderSkillCategory = (category, title, placeholder) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValues[category]}
          onChange={(e) => setInputValues({ ...inputValues, [category]: e.target.value })}
          onKeyPress={(e) => handleKeyPress(e, category)}
          placeholder={placeholder}
          className="input-field flex-1"
        />
        <button
          onClick={() => handleAddSkill(category)}
          className="btn-primary px-4"
          disabled={!inputValues[category].trim()}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {resume.skills[category].map((skill, index) => (
          <span
            key={index}
            className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
          >
            {skill}
            <button
              onClick={() => handleRemoveSkill(category, skill)}
              className="hover:text-red-600 transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <div className="section-card">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaLightbulb className="text-primary-600" />
        Skills
      </h3>

      <div className="space-y-6">
        {renderSkillCategory('technical', 'Technical Skills', 'e.g., React, Python, AWS')}
        {renderSkillCategory('soft', 'Soft Skills', 'e.g., Leadership, Communication')}
        {renderSkillCategory('languages', 'Languages', 'e.g., English (Native), Spanish (Fluent)')}
      </div>
    </div>
  )
}

export default SkillsForm
