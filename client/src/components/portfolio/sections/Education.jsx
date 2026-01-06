import React from 'react'
import { FaGraduationCap } from 'react-icons/fa'

/**
 * Education Section - Academic background
 * Enhanced with hover effects and responsive design
 */
const Education = ({ data = [], theme = 'minimal' }) => {
  if (!data || data.length === 0) return null

  const themes = {
    minimal: {
      bg: 'bg-gradient-to-b from-gray-50 to-gray-100',
      card: 'bg-white hover:shadow-2xl',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      accent: 'text-blue-600',
      icon: 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30',
      border: 'border-gray-200',
      gradientAccent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gradient-to-b from-gray-800 to-gray-900',
      card: 'bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800 hover:shadow-2xl hover:shadow-green-500/5',
      text: 'text-gray-100',
      subtext: 'text-gray-400',
      accent: 'text-green-400',
      icon: 'bg-gradient-to-br from-green-500 to-emerald-500 text-gray-900 shadow-lg shadow-green-500/30',
      border: 'border-gray-700',
      gradientAccent: 'from-green-500 to-emerald-400'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section id="education" className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 ${t.bg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="mb-10 sm:mb-14 animate-fade-in-up">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${t.text}`}>
            Education
          </h2>
          <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${t.gradientAccent}`} />
        </div>
        
        {/* Education Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {data.map((edu, index) => (
            <div
              key={index}
              className={`group ${t.card} rounded-xl sm:rounded-2xl p-5 sm:p-6 border ${t.border} flex gap-4 transition-all duration-500 transform hover:-translate-y-1 animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${t.icon} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <FaGraduationCap className="text-xl sm:text-2xl" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-base sm:text-lg font-bold truncate ${t.text}`}>
                  {edu.degree}
                </h3>
                <p className={`text-sm sm:text-base truncate ${t.subtext}`}>
                  {edu.institution}
                </p>
                <p className={`text-xs sm:text-sm font-semibold ${t.accent}`}>
                  {edu.year}
                </p>
                
                {/* Highlights */}
                {edu.highlights && edu.highlights.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {edu.highlights.map((highlight, i) => (
                      <li key={i} className={`flex items-start gap-2 text-xs sm:text-sm ${t.subtext}`}>
                        <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-gradient-to-r ${t.gradientAccent}`} />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Education
