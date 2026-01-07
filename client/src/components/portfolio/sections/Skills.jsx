import React from 'react'

/**
 * Skills Section - Technical skills with animated progress bars
 * Features animated skill bars, hover effects on tags
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
      tag: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      toolTag: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
      accent: 'from-blue-500 to-indigo-500'
    },
    technical: {
      bg: 'bg-gray-900',
      text: 'text-green-400',
      subtext: 'text-gray-400',
      bar: 'bg-gradient-to-r from-green-500 to-emerald-400',
      barBg: 'bg-gray-700',
      tag: 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-green-500/50',
      toolTag: 'bg-green-900/30 text-green-400 border border-green-500/30 hover:bg-green-900/50',
      accent: 'from-green-500 to-emerald-400'
    }
  }

  const t = themes[theme] || themes.minimal

  return (
    <section id="skills" className={`py-10 sm:py-14 lg:py-20 px-3 sm:px-6 ${t.bg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="mb-6 sm:mb-10 animate-fade-in-up">
          <h2 className={`text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${t.text}`}>
            Skills & Technologies
          </h2>
          <div className={`h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r ${t.accent}`} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Technical Skills with animated progress bars */}
          {technical.length > 0 && (
            <div className="animate-fade-in-up stagger-1">
              <h3 className={`text-sm sm:text-base font-semibold mb-3 sm:mb-4 ${t.text}`}>Technical Skills</h3>
              <div className="space-y-2.5 sm:space-y-3">
                {technical.map((skill, index) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name
                  const level = typeof skill === 'object' ? skill.level : 75
                  return (
                    <div key={index} className="group">
                      <div className="flex justify-between mb-1">
                        <span className={`text-[10px] sm:text-xs font-medium ${t.subtext} group-hover:${t.text} smooth-transition`}>{skillName}</span>
                        <span className={`text-[10px] sm:text-xs ${t.subtext}`}>{level}%</span>
                      </div>
                      <div className={`h-1.5 sm:h-2 rounded-full ${t.barBg} overflow-hidden`}>
                        <div 
                          className={`h-full rounded-full ${t.bar} skill-bar-fill`} 
                          style={{ width: `${level}%`, animationDelay: `${index * 0.1}s` }} 
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Soft Skills & Tools with hover effects */}
          <div className="space-y-5 sm:space-y-6 animate-fade-in-up stagger-2">
            {soft.length > 0 && (
              <div>
                <h3 className={`text-sm sm:text-base font-semibold mb-2 sm:mb-3 ${t.text}`}>Soft Skills</h3>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {soft.map((skill, index) => (
                    <span 
                      key={index} 
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium smooth-transition hover-scale ${t.tag}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {tools.length > 0 && (
              <div>
                <h3 className={`text-sm sm:text-base font-semibold mb-2 sm:mb-3 ${t.text}`}>Tools & Platforms</h3>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {tools.map((tool, index) => (
                    <span 
                      key={index} 
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium smooth-transition hover-scale ${t.toolTag}`}
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
