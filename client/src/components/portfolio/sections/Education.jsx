import React from 'react'
import { FaGraduationCap } from 'react-icons/fa'

/**
 * Education Section - Academic background
 * Features animated cards, gradient icons, hover effects
 */
const Education = ({ data = [], theme = 'minimal' }) => {
  if (!data || data.length === 0) return null

  const themes = {
    minimal: {
      bg: 'bg-gradient-to-b from-gray-50 to-gray-100',
      cardBg: 'glass-card',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      accent: 'text-blue-600',
      icon: 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white',
      border: 'border-gray-200',
      gradientAccent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gradient-to-b from-gray-800 to-gray-900',
      cardBg: 'glass-card-dark',
      text: 'text-gray-100',
      subtext: 'text-gray-400',
      accent: 'text-green-400',
      icon: 'bg-gradient-to-br from-green-500 to-emerald-500 text-gray-900',
      border: 'border-gray-700',
      gradientAccent: 'from-green-500 to-emerald-400'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section id="education" className={`py-10 sm:py-14 lg:py-20 px-3 sm:px-6 ${t.bg}`}>
      <div className="max-w-3xl mx-auto">
        {/* Section Title */}
        <div className="mb-6 sm:mb-10 animate-fade-in-up">
          <h2 className={`text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${t.text}`}>
            Education
          </h2>
          <div className={`h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r ${t.gradientAccent}`} />
        </div>
        
        {/* Education Cards with hover-lift */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {data.map((edu, index) => (
            <div
              key={index}
              className={`group ${t.cardBg} rounded-lg sm:rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-4 border ${t.border} hover-lift animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon - with hover scale */}
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${t.icon} group-hover:scale-110 smooth-transition`}>
                <FaGraduationCap className="text-sm sm:text-lg" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-xs sm:text-sm font-bold truncate ${t.text}`}>
                  {edu.degree}
                </h3>
                <p className={`text-[10px] sm:text-xs truncate ${t.subtext}`}>
                  {edu.institution}
                </p>
                <p className={`text-[9px] sm:text-[10px] font-semibold ${t.accent}`}>
                  {edu.year}
                </p>
                
                {/* Highlights - limited on mobile */}
                {edu.highlights && edu.highlights.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {edu.highlights.slice(0, 2).map((highlight, i) => (
                      <li key={i} className={`flex items-start gap-1 text-[9px] sm:text-[10px] ${t.subtext}`}>
                        <span className={`mt-0.5 w-1 h-1 rounded-full flex-shrink-0 bg-gradient-to-r ${t.gradientAccent}`} />
                        <span className="line-clamp-1">{highlight}</span>
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
