import React from 'react'
import { FaEnvelope, FaLinkedin, FaGithub, FaMapMarkerAlt } from 'react-icons/fa'

/**
 * Contact Section - Contact information and links
 * Features animated blobs, hover effects, staggered animations
 */
const Contact = ({ data, theme = 'minimal' }) => {
  if (!data) return null

  const { email, linkedin, github, location } = data

  const themes = {
    minimal: {
      bg: 'bg-gradient-to-br from-white via-blue-50 to-indigo-100',
      blob1: 'bg-blue-400',
      blob2: 'bg-indigo-400',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      link: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30',
      border: 'border-gray-300',
      gradientAccent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
      blob1: 'bg-green-500',
      blob2: 'bg-emerald-500',
      text: 'text-green-400',
      subtext: 'text-gray-400',
      link: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-gray-900 shadow-lg shadow-green-500/30',
      border: 'border-gray-700',
      gradientAccent: 'from-green-500 to-emerald-400'
    }
  }

  const t = themes[theme] || themes.minimal

  const contactLinks = [
    email && { icon: FaEnvelope, label: 'Email', href: `mailto:${email}` },
    linkedin && { icon: FaLinkedin, label: 'LinkedIn', href: linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}` },
    github && { icon: FaGithub, label: 'GitHub', href: github.startsWith('http') ? github : `https://github.com/${github}` }
  ].filter(Boolean)

  return (
    <section id="contact" className={`py-10 sm:py-14 lg:py-20 px-3 sm:px-6 ${t.bg} relative overflow-hidden`}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-16 -right-16 w-32 sm:w-48 h-32 sm:h-48 rounded-full blur-3xl opacity-20 animate-pulse-glow ${t.blob1}`} />
        <div className={`absolute -bottom-16 -left-16 w-32 sm:w-48 h-32 sm:h-48 rounded-full blur-3xl opacity-15 animate-pulse-glow ${t.blob2}`} style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Section Title */}
        <div className="mb-4 sm:mb-6 animate-fade-in-up">
          <h2 className={`text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${t.text}`}>
            Let's Connect
          </h2>
          <div className={`h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r ${t.gradientAccent} mx-auto`} />
        </div>
        
        <p className={`text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-6 max-w-md mx-auto ${t.subtext} animate-fade-in-up stagger-1`}>
          I'm always open to discussing new opportunities and interesting projects.
        </p>
        
        {/* Location */}
        {location && (
          <p className={`flex items-center justify-center gap-1.5 mb-4 sm:mb-6 text-[10px] sm:text-xs ${t.subtext} animate-fade-in-up stagger-2`}>
            <FaMapMarkerAlt /> {location}
          </p>
        )}
        
        {/* Contact Links - Stack on mobile with hover effects */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center animate-fade-in-up stagger-3 px-4 sm:px-0">
          {contactLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target={link.href.startsWith('mailto') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm smooth-transition hover-scale ${t.link}`}
            >
              <link.icon className="text-sm" />
              <span>{link.label}</span>
            </a>
          ))}
        </div>
        
        {/* Footer */}
        <div className={`mt-8 sm:mt-10 pt-4 sm:pt-6 border-t ${t.border} animate-fade-in-up stagger-4`}>
          <p className={`text-[9px] sm:text-[10px] ${t.subtext}`}>
            © {new Date().getFullYear()} • Built with Resume Builder Platform
          </p>
        </div>
      </div>
    </section>
  )
}

export default Contact
