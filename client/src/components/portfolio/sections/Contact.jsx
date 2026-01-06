import React from 'react'
import { FaEnvelope, FaLinkedin, FaGithub, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa'

/**
 * Contact Section - Contact information and links
 * Enhanced with animations and gradient buttons
 */
const Contact = ({ data, theme = 'minimal' }) => {
  if (!data) return null

  const { email, linkedin, github, location } = data

  const themes = {
    minimal: {
      bg: 'bg-gradient-to-br from-white via-blue-50 to-indigo-100',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      card: 'bg-white/80 backdrop-blur-sm',
      link: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
      border: 'border-gray-200',
      gradientAccent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
      text: 'text-green-400',
      subtext: 'text-gray-400',
      card: 'bg-gray-800/50 backdrop-blur-sm',
      link: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-gray-900 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40',
      border: 'border-gray-700',
      gradientAccent: 'from-green-500 to-emerald-400'
    }
  }

  const t = themes[theme] || themes.minimal

  const contactLinks = [
    email && {
      icon: FaEnvelope,
      label: 'Email',
      value: email,
      href: `mailto:${email}`
    },
    linkedin && {
      icon: FaLinkedin,
      label: 'LinkedIn',
      value: 'Connect on LinkedIn',
      href: linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`
    },
    github && {
      icon: FaGithub,
      label: 'GitHub',
      value: 'View GitHub Profile',
      href: github.startsWith('http') ? github : `https://github.com/${github}`
    }
  ].filter(Boolean)

  return (
    <section id="contact" className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 ${t.bg} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse ${theme === 'technical' ? 'bg-green-500' : 'bg-blue-400'}`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-10 animate-pulse ${theme === 'technical' ? 'bg-emerald-500' : 'bg-indigo-400'}`} style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Section Title */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${t.text}`}>
            Let's Connect
          </h2>
          <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${t.gradientAccent} mx-auto`} />
        </div>
        
        <p className={`text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto ${t.subtext} animate-fade-in-up`} style={{ animationDelay: '0.1s' }}>
          I'm always open to discussing new opportunities and interesting projects. Let's build something amazing together!
        </p>
        
        {/* Location */}
        {location && (
          <p className={`flex items-center justify-center gap-2 mb-8 ${t.subtext} animate-fade-in-up`} style={{ animationDelay: '0.15s' }}>
            <FaMapMarkerAlt className="text-lg" /> {location}
          </p>
        )}
        
        {/* Contact Links */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {contactLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target={link.href.startsWith('mailto') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className={`flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${t.link}`}
            >
              <link.icon className="text-lg sm:text-xl" />
              <span className="text-sm sm:text-base">{link.label}</span>
            </a>
          ))}
        </div>
        
        {/* Footer */}
        <div className={`mt-12 sm:mt-16 pt-8 border-t ${t.border} animate-fade-in-up`} style={{ animationDelay: '0.3s' }}>
          <p className={`text-xs sm:text-sm ${t.subtext}`}>
            © {new Date().getFullYear()} • Built with ❤️ using Resume Builder Platform
          </p>
        </div>
      </div>
    </section>
  )
}

export default Contact
