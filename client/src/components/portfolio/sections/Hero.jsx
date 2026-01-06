import React from 'react'
import { FaDownload, FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa'

/**
 * Hero Section - Main landing section with name, headline, and CTA
 * Enhanced with animations and responsive design
 */
const Hero = ({ data, theme = 'minimal' }) => {
  if (!data) return null

  const { name, headline, tagline, ctaText } = data

  const themes = {
    minimal: {
      bg: 'bg-gradient-to-br from-white via-blue-50 to-indigo-100',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      accent: 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent',
      btn: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
      btnSecondary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-lg'
    },
    technical: {
      bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
      text: 'text-green-400',
      subtext: 'text-gray-400',
      accent: 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent',
      btn: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-gray-900 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40',
      btnSecondary: 'border-2 border-green-500 text-green-500 hover:bg-gray-800 hover:shadow-lg hover:shadow-green-500/20'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section className={`min-h-[100vh] flex items-center justify-center ${t.bg} px-4 sm:px-6 py-16 sm:py-20 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-30 animate-pulse ${theme === 'technical' ? 'bg-green-500' : 'bg-blue-400'}`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse ${theme === 'technical' ? 'bg-emerald-500' : 'bg-indigo-400'}`} style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Name with animation */}
        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 ${t.text} animate-fade-in-up`}>
          {name || 'Your Name'}
        </h1>
        
        {/* Headline with gradient */}
        <p className={`text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-6 ${t.accent} animate-fade-in-up`} style={{ animationDelay: '0.1s' }}>
          {headline || 'Professional'}
        </p>
        
        {/* Tagline */}
        {tagline && (
          <p className={`text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed ${t.subtext} animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
            {tagline}
          </p>
        )}
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <a
            href="#contact"
            className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${t.btn}`}
          >
            {ctaText || 'Get In Touch'}
          </a>
          <a
            href="#projects"
            className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${t.btnSecondary}`}
          >
            View My Work
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <div className={`w-6 h-10 border-2 rounded-full flex justify-center pt-2 ${theme === 'technical' ? 'border-green-500' : 'border-gray-400'}`}>
            <div className={`w-1.5 h-3 rounded-full ${theme === 'technical' ? 'bg-green-500' : 'bg-gray-400'} animate-scroll-down`} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
