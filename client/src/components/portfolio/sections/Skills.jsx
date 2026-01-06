import React from 'react'

/**
 * Skills Section - Technical skills with animated progress bars
 * Enhanced with hover effects and staggered animations
 */
const Skills = ({ data, theme = 'minimal' }) => {
  if (!data) return null

  const { technical = [], soft = [], tools = [] } = data

  const themes = {
    minimal: {
      bg: 'bg-white',
      text: 'text-gray-900',
      subtext: 'text-gray-600',
      bar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      barBg: 'bg-gray-200',
      tag: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md',
      toolTag: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:shadow-md',
      accent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gray-900',
      text: 'text-green-400',
      subtext: 'text-gray-400',
      bar: 'bg-gradient-to-r from-green-500 to-emerald-400',
      barBg: 'bg-gray-700',
      tag: 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-green-500/50 hover:shadow-md hover:shadow-green-500/10',
      toolTag: 'bg-green-900/30 text-green-400 border border-green-500/30 hover:bg-green-900/50 hover:shadow-md hover:shadow-green-500/10',
      accent: 'from-green-500 to-emerald-400'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section id="skills" className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 ${t.bg}`}>
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <div className="mb-10 sm:mb-14 animate-fade-in-up">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${t.text}`}>
            Skills & Technologies
          </h2>
          <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${t.accent}`} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Technical Skills with Animated Progress */}
          {technical.length > 0 && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className={`text-lg sm:text-xl font-semibold mb-6 ${t.text}`}>Technical Skills</h3>
              <div className="space-y-5">
                {technical.map((skill, index) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name
                  const level = typeof skill === 'object' ? skill.level : 75
                  return (
                    <div key={index} className="group">
                      <div className="flex justify-between mb-2">
                        <span className={`font-medium transition-colors ${t.subtext} group-hover:${theme === 'technical' ? 'text-green-400' : 'text-blue-600'}`}>
                          {skillName}
                        </span>
                        <span className={`text-sm font-semibold ${t.subtext}`}>{level}%</span>
                      </div>
                      <div className={`h-2.5 rounded-full ${t.barBg} overflow-hidden`}>
                        <div
                          className={`h-full rounded-full ${t.bar} transition-all duration-1000 ease-out transform origin-left`}
                          style={{ 
                            width: `${level}%`,
                            animation: `growWidth 1.5s ease-out ${index * 0.1}s both`
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Soft Skills & Tools */}
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Soft Skills */}
            {soft.length > 0 && (
              <div>
                <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${t.text}`}>Soft Skills</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {soft.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-default transform hover:scale-105 ${t.tag}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tools */}
            {tools.length > 0 && (
              <div>
                <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${t.text}`}>Tools & Platforms</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {tools.map((tool, index) => (
                    <span
                      key={index}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 cursor-default transform hover:scale-105 ${t.toolTag}`}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skills
