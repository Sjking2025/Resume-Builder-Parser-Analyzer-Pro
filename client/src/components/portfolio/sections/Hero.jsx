import React from 'react'

/**
 * Hero Section - Main landing section with name, headline, and CTA
 * Includes animations, hover effects, and responsive design
 */
const Hero = ({ data, theme = 'minimal' }) => {
  if (!data) return null

  const { name, headline, tagline, ctaText } = data

  const themes = {
    minimal: {
      bg: 'bg-gradient-to-br from-white via-blue-50 to-indigo-100',
      blob1: 'bg-blue-400',
      blob2: 'bg-indigo-400',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      accent: 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent',
      btn: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30',
      btnSecondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      scrollBorder: 'border-gray-400',
      scrollDot: 'bg-gray-400'
    },
    technical: {
      bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
      blob1: 'bg-green-500',
      blob2: 'bg-emerald-500',
      text: 'text-green-400',
      subtext: 'text-gray-400',
      accent: 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent',
      btn: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-gray-900 shadow-lg shadow-green-500/30',
      btnSecondary: 'border-2 border-green-500 text-green-500 hover:bg-gray-800',
      scrollBorder: 'border-green-500',
      scrollDot: 'bg-green-500'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section className={`min-h-[90vh] flex items-center justify-center ${t.bg} px-3 sm:px-6 py-12 sm:py-20 relative overflow-hidden`}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-20 -right-20 w-32 sm:w-64 md:w-80 h-32 sm:h-64 md:h-80 rounded-full blur-3xl opacity-30 animate-float ${t.blob1}`} />
        <div className={`absolute -bottom-20 -left-20 w-32 sm:w-64 md:w-80 h-32 sm:h-64 md:h-80 rounded-full blur-3xl opacity-20 animate-float ${t.blob2}`} style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="w-full max-w-4xl mx-auto text-center relative z-10 px-2">
        {/* Name - with staggered animation */}
        <h1 className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 ${t.text} animate-fade-in-up leading-tight`}>
          {name || 'Your Name'}
        </h1>
        
        {/* Headline - with staggered animation */}
        <p className={`text-sm sm:text-lg md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4 ${t.accent} animate-fade-in-up stagger-1`}>
          {headline || 'Professional'}
        </p>
        
        {/* Tagline - with staggered animation */}
        {tagline && (
          <p className={`text-xs sm:text-sm md:text-base mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed ${t.subtext} animate-fade-in-up stagger-2 px-2`}>
            {tagline}
          </p>
        )}
        
        {/* CTA Buttons - Stack on mobile with hover effects */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 justify-center animate-fade-in-up stagger-3 px-4 sm:px-0">
          <a
            href="#contact"
            className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 text-center hover-scale ${t.btn}`}
          >
            {ctaText || 'Get In Touch'}
          </a>
          <a
            href="#projects"
            className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 text-center hover-scale ${t.btnSecondary}`}
          >
            View My Work
          </a>
        </div>
        
        {/* Scroll indicator - hidden on mobile */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:block animate-bounce">
          <div className={`w-5 h-8 border-2 rounded-full flex justify-center pt-1.5 ${t.scrollBorder}`}>
            <div className={`w-1 h-2 rounded-full animate-scroll-down ${t.scrollDot}`} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
