import React from 'react'
import { FaGithub, FaExternalLinkAlt, FaStar } from 'react-icons/fa'

/**
 * Projects Section - Featured project cards with animations
 * Enhanced with hover effects, gradients, and responsive grid
 */
const Projects = ({ data = [], theme = 'minimal' }) => {
  if (!data || data.length === 0) return null

  const themes = {
    minimal: {
      bg: 'bg-gradient-to-b from-gray-50 to-gray-100',
      card: 'bg-white hover:shadow-2xl',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      tag: 'bg-blue-100 text-blue-700',
      featured: 'ring-2 ring-blue-500 ring-offset-2',
      link: 'text-blue-600 hover:text-blue-800',
      border: 'border-gray-200',
      accent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gradient-to-b from-gray-800 to-gray-900',
      card: 'bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800 hover:shadow-2xl hover:shadow-green-500/10',
      text: 'text-gray-100',
      subtext: 'text-gray-400',
      tag: 'bg-gray-900 text-green-400 border border-green-500/30',
      featured: 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900',
      link: 'text-green-400 hover:text-green-300',
      border: 'border-gray-700',
      accent: 'from-green-500 to-emerald-400'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section id="projects" className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 ${t.bg}`}>
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="mb-10 sm:mb-14 animate-fade-in-up">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${t.text}`}>
            Featured Projects
          </h2>
          <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${t.accent}`} />
        </div>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {data.map((project, index) => (
            <div
              key={index}
              className={`group ${t.card} rounded-2xl p-5 sm:p-6 border ${t.border} transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up ${
                project.featured ? t.featured : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Featured Badge */}
              {project.featured && (
                <div className="flex items-center gap-1.5 text-yellow-500 text-sm font-medium mb-3">
                  <FaStar className="animate-pulse" /> Featured
                </div>
              )}
              
              {/* Project Name */}
              <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors group-hover:${theme === 'technical' ? 'text-green-400' : 'text-blue-600'} ${t.text}`}>
                {project.name}
              </h3>
              
              {/* Tagline */}
              {project.tagline && (
                <p className={`text-sm font-medium mb-3 ${t.link}`}>
                  {project.tagline}
                </p>
              )}
              
              {/* Description */}
              <p className={`text-sm sm:text-base mb-4 line-clamp-3 ${t.subtext}`}>
                {project.description}
              </p>
              
              {/* Impact */}
              {project.impact && (
                <p className={`text-sm font-semibold mb-4 ${t.text}`}>
                  📈 {project.impact}
                </p>
              )}
              
              {/* Tech Stack */}
              {project.tech && project.tech.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                  {project.tech.slice(0, 5).map((tech, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded text-xs font-medium transition-transform hover:scale-110 ${t.tag}`}
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 5 && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${t.tag}`}>
                      +{project.tech.length - 5}
                    </span>
                  )}
                </div>
              )}
              
              {/* Links */}
              <div className="flex gap-4 mt-auto pt-4 border-t border-opacity-50">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${t.link}`}
                  >
                    <FaGithub className="text-lg" /> Code
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${t.link}`}
                  >
                    <FaExternalLinkAlt /> Live Demo
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
