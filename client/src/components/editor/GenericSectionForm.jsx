import React, { useState } from 'react'
import useResumeStore, { CV_SECTION_LABELS } from '../../store/useResumeStore'
import { FaTrash, FaPlus, FaChevronDown, FaChevronUp, FaGripVertical, FaBook } from 'react-icons/fa'

const GenericSectionForm = ({ sectionKey, fields }) => {
  const { resume, addSectionItem, updateSectionItem, removeSectionItem } = useResumeStore()
  const items = resume[sectionKey] || []
  const [expandedIndex, setExpandedIndex] = useState(0)

  const handleAdd = () => {
    const newItem = fields.reduce((acc, field) => {
      acc[field.name] = ''
      return acc
    }, {})
    addSectionItem(sectionKey, newItem)
    setExpandedIndex(items.length)
  }

  const title = CV_SECTION_LABELS[sectionKey] || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)

  return (
    <div className="section-card">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaBook className="text-primary-600" />
        {title}
      </h3>

      <div className="space-y-4 mb-4">
        {items.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div 
              className="flex items-center gap-3 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
            >
              <FaGripVertical className="text-gray-400 cursor-move" />
              <div className="flex-1 font-medium text-gray-700">
                {item[fields[0].name] || `New ${title} Item`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSectionItem(sectionKey, index)
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Item"
                >
                  <FaTrash />
                </button>
                {expandedIndex === index ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
              </div>
            </div>

            {expandedIndex === index && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                {fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={item[field.name] || ''}
                        onChange={(e) => updateSectionItem(sectionKey, index, { [field.name]: e.target.value })}
                        placeholder={field.placeholder}
                        rows="3"
                        className="input-field"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={item[field.name] || ''}
                        onChange={(e) => updateSectionItem(sectionKey, index, { [field.name]: e.target.value })}
                        placeholder={field.placeholder}
                        className="input-field"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
      >
        <FaPlus /> Add {title}
      </button>
    </div>
  )
}

export default GenericSectionForm
