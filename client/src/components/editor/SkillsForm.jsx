import React, { useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { FaLightbulb, FaTimes, FaPlus, FaTrash } from 'react-icons/fa'

const SkillsForm = () => {
  const { resume, updateSkills, toggleCategorizedSkills, updateTechnicalCategories } = useResumeStore()
  const [inputValues, setInputValues] = useState({
    technical: '',
    soft: '',
    languages: '',
  })
  
  const [catInputValues, setCatInputValues] = useState({})

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

  // Handlers for categorized skills
  const handleAddCatSkill = (catIndex) => {
    const value = (catInputValues[catIndex] || '').trim()
    if (!value) return
    const newCats = [...(resume.skills.technicalCategories || [])]
    if (!newCats[catIndex].skills.includes(value)) {
      newCats[catIndex] = { ...newCats[catIndex], skills: [...newCats[catIndex].skills, value] }
      updateTechnicalCategories(newCats)
    }
    setCatInputValues({ ...catInputValues, [catIndex]: '' })
  }

  const handleRemoveCatSkill = (catIndex, skillToRemove) => {
    const newCats = [...(resume.skills.technicalCategories || [])]
    newCats[catIndex] = { ...newCats[catIndex], skills: newCats[catIndex].skills.filter(s => s !== skillToRemove) }
    updateTechnicalCategories(newCats)
  }

  const handleCatKeyPress = (e, catIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCatSkill(catIndex)
    }
  }

  const handleUpdateCatName = (catIndex, newName) => {
    const newCats = [...(resume.skills.technicalCategories || [])]
    newCats[catIndex] = { ...newCats[catIndex], name: newName }
    updateTechnicalCategories(newCats)
  }

  const handleRemoveCategory = (catIndex) => {
    const newCats = (resume.skills.technicalCategories || []).filter((_, i) => i !== catIndex)
    updateTechnicalCategories(newCats)
  }

  const handleAddCategory = () => {
    updateTechnicalCategories([...(resume.skills.technicalCategories || []), { name: 'New Category', skills: [] }])
  }

  const renderCategorizedTechnical = () => (
    <div className="space-y-4 border-l-2 border-primary-200 pl-4 ml-2">
      {(resume.skills.technicalCategories || []).map((cat, index) => (
        <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex justify-between mb-2">
            <input 
              type="text" 
              value={cat.name} 
              onChange={(e) => handleUpdateCatName(index, e.target.value)}
              className="font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 px-1 py-0.5 outline-none w-full mr-2"
              placeholder="Category Name"
            />
            <button onClick={() => handleRemoveCategory(index)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
              <FaTrash size={14} />
            </button>
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={catInputValues[index] || ''}
              onChange={(e) => setCatInputValues({ ...catInputValues, [index]: e.target.value })}
              onKeyPress={(e) => handleCatKeyPress(e, index)}
              placeholder="e.g., React"
              className="input-field flex-1 text-sm py-1"
            />
            <button
              onClick={() => handleAddCatSkill(index)}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-1 rounded text-sm font-medium"
              disabled={!(catInputValues[index] || '').trim()}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {cat.skills.map((skill, sIndex) => (
              <span
                key={sIndex}
                className="bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 shadow-sm"
              >
                {skill}
                <button
                  onClick={() => handleRemoveCatSkill(index, skill)}
                  className="hover:text-red-600 transition-colors"
                >
                  <FaTimes size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}
      <button 
        onClick={handleAddCategory}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
      >
        <FaPlus size={12} /> Add Category
      </button>
    </div>
  )

  return (
    <div className="section-card">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaLightbulb className="text-primary-600" />
        Skills
      </h3>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Technical Skills</label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={resume.skills.useCategorizedTechnical || false}
                onChange={(e) => toggleCategorizedSkills(e.target.checked)}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              Use categorized skills <span className="text-xs text-gray-400">(ATS template)</span>
            </label>
          </div>
          
          {resume.skills.useCategorizedTechnical ? (
            renderCategorizedTechnical()
          ) : (
            <>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={inputValues.technical}
                  onChange={(e) => setInputValues({ ...inputValues, technical: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, 'technical')}
                  placeholder="e.g., React, Python, AWS"
                  className="input-field flex-1"
                />
                <button
                  onClick={() => handleAddSkill('technical')}
                  className="btn-primary px-4"
                  disabled={!inputValues.technical.trim()}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resume.skills.technical.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill('technical', skill)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {renderSkillCategory('soft', 'Soft Skills', 'e.g., Leadership, Communication')}
        {renderSkillCategory('languages', 'Languages', 'e.g., English (Native), Spanish (Fluent)')}
      </div>
    </div>
  )
}

export default SkillsForm
