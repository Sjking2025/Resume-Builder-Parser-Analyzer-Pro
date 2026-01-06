import React from 'react'

/**
 * About Section - Personal introduction and highlights
 * Enhanced with animations and better layout
 */
const About = ({ data, theme = 'minimal' }) => {
  if (!data) return null

  const { title, content, highlights } = data

  const themes = {
    minimal: {
      bg: 'bg-gradient-to-b from-gray-50 to-white',
      card: 'bg-white/80 backdrop-blur-sm',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      highlight: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:scale-105',
      border: 'border-gray-200/50',
      accent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gradient-to-b from-gray-800 to-gray-900',
      card: 'bg-gray-900/80 backdrop-blur-sm',
      text: 'text-gray-100',
      subtext: 'text-gray-400',
      highlight: 'bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 shadow-md hover:shadow-lg hover:scale-105',
      border: 'border-gray-700/50',
      accent: 'from-green-500 to-emerald-500'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section id="about" className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 ${t.bg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Section Title with gradient underline */}
        <div className="mb-8 sm:mb-12 animate-fade-in-up">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${t.text}`}>
            {title || 'About Me'}
          </h2>
          <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${t.accent}`} />
        </div>
        
        {/* Content Card */}
        <div className={`${t.card} rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border ${t.border} transform transition-all duration-500 hover:shadow-2xl animate-fade-in-up`} style={{ animationDelay: '0.1s' }}>
          {/* About Text */}
          <div className={`text-base sm:text-lg leading-relaxed ${t.subtext} whitespace-pre-line`}>
            {content || 'Welcome to my portfolio.'}
          </div>
          
          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
              {highlights.map((highlight, index) => (
                <span
                  key={index}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-default ${t.highlight}`}
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default About
