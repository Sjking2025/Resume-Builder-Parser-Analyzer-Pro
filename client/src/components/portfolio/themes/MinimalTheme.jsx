import React from 'react'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Skills from '../sections/Skills'
import Projects from '../sections/Projects'
import Experience from '../sections/Experience'
import Education from '../sections/Education'
import Contact from '../sections/Contact'

/**
 * Minimal Theme - Clean, whitespace-focused design
 * Best for: Students, Freshers, General professionals
 */
const MinimalTheme = ({ data }) => {
  if (!data) return null

  const theme = 'minimal'

  return (
    <div className="bg-white">
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

export default MinimalTheme
