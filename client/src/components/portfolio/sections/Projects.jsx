import React from 'react'
import { FaGithub, FaExternalLinkAlt, FaStar } from 'react-icons/fa'

/**
 * Projects Section - Featured project cards
 * Features hover-lift cards, staggered animations, and responsive grid
 */
const Projects = ({ data = [], theme = 'minimal' }) => {
  if (!data || data.length === 0) return null

  const themes = {
    minimal: {
      bg: 'bg-gradient-to-b from-gray-50 to-gray-100',
      cardBg: 'glass-card',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      tag: 'bg-blue-100 text-blue-700',
      featured: 'ring-2 ring-blue-500',
      link: 'text-blue-600 hover:text-blue-800',
      border: 'border-gray-200',
      accent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gradient-to-b from-gray-800 to-gray-900',
      cardBg: 'glass-card-dark',
      text: 'text-gray-100',
      subtext: 'text-gray-400',
      tag: 'bg-gray-900 text-green-400 border border-green-500/30',
      featured: 'ring-2 ring-green-500',
      link: 'text-green-400 hover:text-green-300',
      border: 'border-gray-700',
      accent: 'from-green-500 to-emerald-400'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section id="projects" className={`py-10 sm:py-14 lg:py-20 px-3 sm:px-6 ${t.bg}`}>
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <div className="mb-6 sm:mb-10 animate-fade-in-up">
          <h2 className={`text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${t.text}`}>
            Featured Projects
          </h2>
          <div className={`h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r ${t.accent}`} />
        </div>
        
        {/* Projects Grid - with hover-lift cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {data.map((project, index) => (
            <div
              key={index}
              className={`${t.cardBg} rounded-xl p-3 sm:p-4 hover-lift animate-fade-in-up ${
                project.featured ? t.featured : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Featured Badge */}
              {project.featured && (
                <div className="flex items-center gap-1 text-yellow-500 text-[10px] sm:text-xs font-medium mb-2">
                  <FaStar className="text-[8px] sm:text-xs" /> Featured
                </div>
              )}
              
              {/* Project Name */}
              <h3 className={`text-sm sm:text-base font-bold mb-1 line-clamp-2 ${t.text}`}>
                {project.name}
              </h3>
              
              {/* Tagline */}
              {project.tagline && (
                <p className={`text-[10px] sm:text-xs font-medium mb-1.5 ${t.link}`}>
                  {project.tagline}
                </p>
              )}
              
              {/* Description */}
              <p className={`text-[10px] sm:text-xs mb-2 line-clamp-3 ${t.subtext}`}>
                {project.description}
              </p>
              
              {/* Impact */}
              {project.impact && (
                <p className={`text-[10px] sm:text-xs font-semibold mb-2 ${t.text}`}>
                  📈 {project.impact}
                </p>
              )}
              
              {/* Tech Stack - hover-scale on each tag */}
              {project.tech && project.tech.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {project.tech.slice(0, 4).map((tech, i) => (
                    <span key={i} className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-medium hover-scale smooth-transition ${t.tag}`}>
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 4 && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-medium opacity-60 ${t.tag}`}>
                      +{project.tech.length - 4}
                    </span>
                  )}
                </div>
              )}
              
              {/* Links - with hover effects */}
              <div className={`flex gap-3 mt-auto pt-2 border-t ${t.border}`}>
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium smooth-transition hover-scale ${t.link}`}>
                    <FaGithub /> Code
                  </a>
                )}
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium smooth-transition hover-scale ${t.link}`}>
                    <FaExternalLinkAlt className="text-[8px]" /> Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
