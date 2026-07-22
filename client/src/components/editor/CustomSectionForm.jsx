import React, { useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { FaTrash, FaPlus, FaChevronDown, FaChevronUp, FaGripVertical, FaFolderPlus, FaEdit, FaCheck } from 'react-icons/fa'

const CustomSectionForm = () => {
  const { resume, addCustomSection, updateCustomSection, removeCustomSection, addCustomSectionItem, updateCustomSectionItem, removeCustomSectionItem } = useResumeStore()
  const customSections = resume.customSections || []
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [editingTitleIndex, setEditingTitleIndex] = useState(-1)
  const [expandedSectionIndex, setExpandedSectionIndex] = useState(-1)
  const [expandedItemIndex, setExpandedItemIndex] = useState(-1)

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      addCustomSection(newSectionTitle.trim())
      setNewSectionTitle('')
      setExpandedSectionIndex(customSections.length)
    }
  }

  const handleAddItem = (sectionIndex) => {
    addCustomSectionItem(sectionIndex, { title: '', description: '', date: '' })
    setExpandedItemIndex((customSections[sectionIndex]?.items?.length || 0))
  }

  return (
    <div className="section-card">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaFolderPlus className="text-primary-600" />
        Custom Sections
      </h3>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          placeholder="New Section Title (e.g., Languages, Hobbies)"
          className="input-field flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
        />
        <button
          onClick={handleAddSection}
          disabled={!newSectionTitle.trim()}
          className="bg-primary-600 text-white px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          Add Section
        </button>
      </div>

      <div className="space-y-6">
        {customSections.map((section, sIndex) => (
          <div key={section.id || sIndex} className="border border-gray-300 rounded-xl overflow-hidden bg-gray-50 p-4">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-4">
              {editingTitleIndex === sIndex ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateCustomSection(sIndex, { title: e.target.value })}
                    className="input-field flex-1"
                    autoFocus
                  />
                  <button onClick={() => setEditingTitleIndex(-1)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <FaCheck />
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="flex-1 text-lg font-bold text-gray-800">{section.title}</h4>
                  <button onClick={() => setEditingTitleIndex(sIndex)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                    <FaEdit />
                  </button>
                </>
              )}
              <button onClick={() => removeCustomSection(sIndex)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <FaTrash />
              </button>
            </div>

            {/* Section Items */}
            <div className="space-y-3 mb-3">
              {(section.items || []).map((item, iIndex) => (
                <div key={iIndex} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setExpandedSectionIndex(sIndex)
                      setExpandedItemIndex(expandedItemIndex === iIndex ? -1 : iIndex)
                    }}
                  >
                    <FaGripVertical className="text-gray-400" />
                    <div className="flex-1 font-medium text-gray-700 text-sm">
                      {item.title || 'New Item'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCustomSectionItem(sIndex, iIndex)
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  {expandedSectionIndex === sIndex && expandedItemIndex === iIndex && (
                    <div className="p-3 border-t border-gray-200 space-y-3 bg-white">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => updateCustomSectionItem(sIndex, iIndex, { title: e.target.value })}
                          className="input-field text-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date/Subtitle</label>
                        <input
                          type="text"
                          value={item.date || ''}
                          onChange={(e) => updateCustomSectionItem(sIndex, iIndex, { date: e.target.value })}
                          className="input-field text-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => updateCustomSectionItem(sIndex, iIndex, { description: e.target.value })}
                          rows="2"
                          className="input-field text-sm p-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAddItem(sIndex)}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 text-sm font-medium hover:border-primary-500 hover:text-primary-600 hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              <FaPlus /> Add Item to {section.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomSectionForm
