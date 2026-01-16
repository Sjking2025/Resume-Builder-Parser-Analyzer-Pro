import React from 'react'

/**
 * About Section - Personal introduction and highlights
 * Features glassmorphism, hover effects, and animations
 */
const About = ({ data, theme = 'minimal' }) => {
  if (!data) return null

  const { title, content, highlights } = data

  const themes = {
    minimal: {
      bg: 'bg-gradient-to-b from-gray-50 to-white',
      cardBg: 'glass-card',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      highlight: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
      accent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gradient-to-b from-gray-800 to-gray-900',
      cardBg: 'glass-card-dark',
      text: 'text-gray-100',
      subtext: 'text-gray-400',
      highlight: 'bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900',
      accent: 'from-green-500 to-emerald-500'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section id="about" className={`py-10 sm:py-14 lg:py-20 px-3 sm:px-6 ${t.bg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Section Title with gradient underline */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <h2 className={`text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${t.text}`}>
            {title || 'About Me'}
          </h2>
          <div className={`h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r ${t.accent}`} />
        </div>
        
        {/* Content Card with glassmorphism and hover-lift */}
        <div className={`${t.cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover-lift animate-fade-in-up stagger-1`}>
          {/* About Text */}
          <div className={`text-xs sm:text-sm lg:text-base leading-relaxed ${t.subtext} whitespace-pre-line`}>
            {content || 'Welcome to my portfolio.'}
          </div>
          
          {/* Highlights - with hover-scale effects */}
          {highlights && highlights.length > 0 && (
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
              {highlights.map((highlight, index) => (
                <span
                  key={index}
                  className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium hover-scale smooth-transition ${t.highlight}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
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
