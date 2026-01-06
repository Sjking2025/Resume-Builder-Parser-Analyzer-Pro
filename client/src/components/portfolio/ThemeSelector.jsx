import React from 'react'
import { FaCheck } from 'react-icons/fa'

/**
 * Theme Selector - Grid of theme options with preview
 */
const ThemeSelector = ({ selectedTheme, onSelect }) => {
  const themes = [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean, whitespace-focused',
      bestFor: 'Students, Freshers',
      preview: {
        bg: 'bg-white',
        accent: 'bg-blue-500',
        text: 'bg-gray-300'
      }
    },
    {
      id: 'technical',
      name: 'Technical',
      description: 'Dark mode, terminal-style',
      bestFor: 'Developers, Engineers',
      preview: {
        bg: 'bg-gray-900',
        accent: 'bg-green-500',
        text: 'bg-gray-600'
      }
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Select Theme</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelect(theme.id)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selectedTheme === theme.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Selected Checkmark */}
            {selectedTheme === theme.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                <FaCheck className="text-white text-xs" />
              </div>
            )}
            
            {/* Theme Preview */}
            <div className={`w-full h-20 rounded-lg mb-3 ${theme.preview.bg} p-3 flex flex-col justify-between`}>
              <div className={`h-2 w-16 rounded ${theme.preview.accent}`} />
              <div className="space-y-1">
                <div className={`h-1.5 w-full rounded ${theme.preview.text}`} />
                <div className={`h-1.5 w-3/4 rounded ${theme.preview.text}`} />
              </div>
            </div>
            
            {/* Theme Info */}
            <div>
              <h4 className="font-semibold text-gray-900">{theme.name}</h4>
              <p className="text-sm text-gray-500">{theme.description}</p>
              <p className="text-xs text-primary-600 mt-1">Best for: {theme.bestFor}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ThemeSelector
