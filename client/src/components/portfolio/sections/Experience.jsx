import React from 'react'

/**
 * Experience Section - Work history timeline
 * Features animated timeline, hover-lift cards, gradient dots
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
      dot: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      card: 'glass-card',
      border: 'border-gray-200',
      gradientAccent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      subtext: 'text-gray-400',
      accent: 'text-green-400',
      line: 'bg-gradient-to-b from-green-500 to-emerald-500',
      dot: 'bg-gradient-to-br from-green-500 to-emerald-500',
      card: 'glass-card-dark',
      border: 'border-gray-700',
      gradientAccent: 'from-green-500 to-emerald-400'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section id="experience" className={`py-10 sm:py-14 lg:py-20 px-3 sm:px-6 ${t.bg}`}>
      <div className="max-w-3xl mx-auto">
        {/* Section Title */}
        <div className="mb-6 sm:mb-10 animate-fade-in-up">
          <h2 className={`text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${t.text}`}>
            Work Experience
          </h2>
          <div className={`h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r ${t.gradientAccent}`} />
        </div>
        
        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line - gradient */}
          <div className={`absolute left-2.5 sm:left-3 top-0 bottom-0 w-0.5 ${t.line}`} />
          
          {/* Experience Items */}
          <div className="space-y-4 sm:space-y-6">
            {data.map((exp, index) => (
              <div 
                key={index} 
                className="relative pl-7 sm:pl-10 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Timeline Dot - gradient with glow */}
                <div 
                  className={`absolute left-1 sm:left-1.5 top-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full ${t.dot} shadow-lg`}
                  style={{ boxShadow: theme === 'technical' ? '0 0 10px rgba(34,197,94,0.4)' : '0 0 10px rgba(59,130,246,0.4)' }}
                />
                
                {/* Experience Card - with hover-lift */}
                <div className={`${t.card} rounded-lg sm:rounded-xl p-3 sm:p-4 border ${t.border} hover-lift`}>
                  {/* Period */}
                  <p className={`text-[9px] sm:text-[10px] font-semibold mb-0.5 ${t.accent}`}>
                    {exp.period}
                  </p>
                  
                  {/* Title & Company */}
                  <h3 className={`text-xs sm:text-sm lg:text-base font-bold ${t.text}`}>
                    {exp.title}
                  </h3>
                  <p className={`text-[10px] sm:text-xs mb-1.5 ${t.subtext}`}>
                    {exp.company}
                  </p>
                  
                  {/* Description */}
                  {exp.description && (
                    <p className={`text-[10px] sm:text-xs mb-1.5 ${t.subtext}`}>
                      {exp.description}
                    </p>
                  )}
                  
                  {/* Highlights - limited on mobile */}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-0.5 sm:space-y-1">
                      {exp.highlights.slice(0, 3).map((highlight, i) => (
                        <li key={i} className={`flex items-start gap-1.5 text-[9px] sm:text-[10px] ${t.subtext}`}>
                          <span className={`mt-1 w-1 h-1 rounded-full flex-shrink-0 bg-gradient-to-r ${t.gradientAccent}`} />
                          <span className="line-clamp-2">{highlight}</span>
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
