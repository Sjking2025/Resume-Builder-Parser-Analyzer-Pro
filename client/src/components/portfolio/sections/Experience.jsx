import React from 'react'
import { FaBriefcase } from 'react-icons/fa'

/**
 * Experience Section - Work history timeline
 * Enhanced with animated timeline and hover effects
 */
const Experience = ({ data = [], theme = 'minimal' }) => {
  if (!data || data.length === 0) return null

  const themes = {
    minimal: {
      bg: 'bg-white',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      accent: 'text-blue-600',
      line: 'bg-gradient-to-b from-blue-500 to-indigo-500',
      dot: 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30',
      dotRing: 'ring-4 ring-blue-100',
      card: 'bg-gray-50 hover:bg-white hover:shadow-xl border-gray-200',
      gradientAccent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      subtext: 'text-gray-400',
      accent: 'text-green-400',
      line: 'bg-gradient-to-b from-green-500 to-emerald-500',
      dot: 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30',
      dotRing: 'ring-4 ring-green-500/20',
      card: 'bg-gray-800/50 hover:bg-gray-800 hover:shadow-xl hover:shadow-green-500/5 border-gray-700',
      gradientAccent: 'from-green-500 to-emerald-400'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section id="experience" className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 ${t.bg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="mb-10 sm:mb-14 animate-fade-in-up">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${t.text}`}>
            Work Experience
          </h2>
          <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${t.gradientAccent}`} />
        </div>
        
        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className={`absolute left-4 sm:left-6 md:left-8 top-0 bottom-0 w-0.5 ${t.line}`} />
          
          {/* Experience Items */}
          <div className="space-y-8 sm:space-y-10">
            {data.map((exp, index) => (
              <div 
                key={index} 
                className="relative pl-12 sm:pl-16 md:pl-20 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Timeline Dot */}
                <div className={`absolute left-2 sm:left-4 md:left-6 top-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full ${t.dot} ${t.dotRing} transform transition-transform hover:scale-125`}>
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" />
                </div>
                
                {/* Experience Card */}
                <div className={`${t.card} rounded-xl sm:rounded-2xl p-5 sm:p-6 border transition-all duration-500 transform hover:-translate-y-1`}>
                  {/* Period */}
                  <p className={`text-xs sm:text-sm font-semibold mb-2 ${t.accent}`}>
                    {exp.period}
                  </p>
                  
                  {/* Title & Company */}
                  <h3 className={`text-lg sm:text-xl font-bold ${t.text}`}>
                    {exp.title}
                  </h3>
                  <p className={`text-base sm:text-lg mb-3 ${t.subtext}`}>
                    {exp.company}
                  </p>
                  
                  {/* Description */}
                  {exp.description && (
                    <p className={`text-sm sm:text-base mb-4 ${t.subtext}`}>
                      {exp.description}
                    </p>
                  )}
                  
                  {/* Highlights */}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-2">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm sm:text-base ${t.subtext}`}>
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-gradient-to-r ${t.gradientAccent}`} />
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
      </div>
    </section>
  )
}

export default Experience
