import React from 'react'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Skills from '../sections/Skills'
import Projects from '../sections/Projects'
import Experience from '../sections/Experience'
import Education from '../sections/Education'
import Contact from '../sections/Contact'

/**
 * Technical Theme - Dark mode, terminal-inspired design
 * Best for: Developers, Engineers, DevOps, AI/ML professionals
 */
const TechnicalTheme = ({ data }) => {
  if (!data) return null

  const theme = 'technical'

  return (
    <div className="bg-gray-900 text-gray-100">
      {/* Terminal-style header bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-gray-400 text-sm ml-4 font-mono">
          ~/portfolio/{data.hero?.name?.toLowerCase().replace(/\s+/g, '-') || 'developer'}
        </span>
      </div>
      
      <Hero data={data.hero} theme={theme} />
      <About data={data.about} theme={theme} />
      <Skills data={data.skills} theme={theme} />
      <Projects data={data.projects} theme={theme} />
      <Experience data={data.experience} theme={theme} />
      <Education data={data.education} theme={theme} />
      <Contact data={data.contact} theme={theme} />
    </div>
  )
}

export default TechnicalTheme
