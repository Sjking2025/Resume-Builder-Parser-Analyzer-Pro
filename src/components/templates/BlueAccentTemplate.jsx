import React from 'react'
import { colors, printStyles, getFontSize, getLineHeight, getMargins } from './PrintStyles'

// Blue Accent template - Single column with blue section headers and categorized skills
// Uses system-ui font for maximum compatibility
const BlueAccentTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume

  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)
  const padding = getMargins(formatting.margins)

  const accentColors = {
    blue: { primary: '#2563eb', light: '#dbeafe' },
    purple: { primary: '#7c3aed', light: '#f3e8ff' },
    green: { primary: '#059669', light: '#d1fae5' },
  }
  const accent = accentColors[formatting.colorScheme] || accentColors.blue

  const styles = {
    container: {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: fontSize.base,
      lineHeight,
      color: '#111827',
      backgroundColor: '#ffffff',
      maxWidth: '210mm',
      margin: '0 auto',
      padding,
    },
    header: {
      textAlign: 'center',
      marginBottom: '16px',
      borderBottom: `2px solid ${accent.primary}`,
      paddingBottom: '12px',
    },
    name: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#111827',
      letterSpacing: '2px',
      margin: 0,
    },
    contactRow: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      fontSize: '12px',
      color: '#4b5563',
      marginTop: '8px',
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    contactLink: {
      color: accent.primary,
      textDecoration: 'none',
    },
    section: {
      marginBottom: '16px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: accent.primary,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px',
      marginTop: '0',
      ...printStyles.header,
    },
    entry: {
      marginBottom: '12px',
      ...printStyles.entry,
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    entryTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#111827',
    },
    entryCompany: {
      fontSize: '13px',
      color: '#111827',
    },
    entryDate: {
      fontSize: '12px',
      color: '#4b5563',
    },
    list: {
      margin: '4px 0 0',
      paddingLeft: '18px',
      fontSize: '12px',
      color: '#374151',
    },
    listItem: {
      marginBottom: '2px',
      lineHeight: '1.4',
    },
    paragraph: {
      margin: '0 0 8px',
      fontSize: '12px',
      lineHeight: '1.5',
      color: '#374151',
    },
    // Technical Skills - categorized layout
    skillsGrid: {
      fontSize: '12px',
      color: '#374151',
    },
    skillRow: {
      marginBottom: '4px',
      lineHeight: '1.5',
    },
    skillLabel: {
      fontWeight: '700',
      color: '#111827',
    },
    // Soft skills as bullets
    softSkillsList: {
      margin: '0',
      paddingLeft: '18px',
      fontSize: '12px',
      color: '#374151',
      columns: '2',
      columnGap: '24px',
    },
  }

  // Helper to categorize technical skills
  const categorizeSkills = (technicalSkills) => {
    // Default categories if skills exist
    const languages = ['Python', 'Java', 'JavaScript', 'C', 'C++', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin']
    const webDev = ['HTML', 'HTML5', 'CSS', 'CSS3', 'React', 'React.js', 'Angular', 'Vue', 'Vue.js', 'Node.js', 'Express', 'Express.js', 'Bootstrap', 'Tailwind', 'WordPress', 'Next.js', 'jQuery']
    const databases = ['MongoDB', 'MySQL', 'PostgreSQL', 'SQL', 'SQLite', 'Redis', 'Oracle', 'Firebase']
    const tools = ['Git', 'GitHub', 'VS Code', 'Postman', 'Figma', 'Docker', 'Linux', 'AWS', 'Azure', 'Canva', 'Power BI', 'Microsoft Office', 'Jira']

    const result = {
      programmingLanguages: [],
      webDevelopment: [],
      databases: [],
      tools: [],
      other: []
    }

    technicalSkills.forEach(skill => {
      const skillLower = skill.toLowerCase()
      if (languages.some(l => skillLower.includes(l.toLowerCase()))) {
        result.programmingLanguages.push(skill)
      } else if (webDev.some(w => skillLower.includes(w.toLowerCase()))) {
        result.webDevelopment.push(skill)
      } else if (databases.some(d => skillLower.includes(d.toLowerCase()))) {
        result.databases.push(skill)
      } else if (tools.some(t => skillLower.includes(t.toLowerCase()))) {
        result.tools.push(skill)
      } else {
        result.other.push(skill)
      }
    })

    return result
  }

  const categorizedSkills = categorizeSkills(skills.technical)

  return (
    <div style={styles.container} className="resume-page">
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.name}>{personalInfo.fullName || 'YOUR NAME'}</h1>
        <div style={styles.contactRow}>
          {personalInfo.location && (
            <span style={styles.contactItem}>📍 {personalInfo.location}</span>
          )}
          {personalInfo.phone && (
            <span style={styles.contactItem}>📞 {personalInfo.phone}</span>
          )}
          {personalInfo.email && (
            <span style={styles.contactItem}>✉️ <a href={`mailto:${personalInfo.email}`} style={styles.contactLink}>{personalInfo.email}</a></span>
          )}
          {personalInfo.linkedin && (
            <span style={styles.contactItem}>🔗 <a href={personalInfo.linkedin} style={styles.contactLink}>LinkedIn</a></span>
          )}
          {personalInfo.github && (
            <span style={styles.contactItem}>💻 <a href={personalInfo.github} style={styles.contactLink}>GitHub</a></span>
          )}
        </div>
      </header>

      {/* Career Objective / Summary */}
      {personalInfo.summary && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Career Objective</h2>
          <p style={styles.paragraph}>{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Internship Experience</h2>
          {experience.map((exp, idx) => (
            <article key={idx} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <span style={styles.entryTitle}>{exp.title}</span>
                  <span style={styles.entryCompany}> – {exp.company}</span>
                </div>
                <span style={styles.entryDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              {exp.description && (
                <ul style={styles.list}>
                  {exp.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} style={styles.listItem}>{line.replace(/^[-•]\s*/, '')}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Projects</h2>
          {projects.map((proj, idx) => (
            <article key={idx} style={styles.entry}>
              <div style={styles.entryTitle}>
                {proj.name}
                {proj.technologies && <span style={{ fontWeight: '400', color: '#4b5563' }}> ({proj.technologies})</span>}
              </div>
              {proj.description && (
                <ul style={styles.list}>
                  {proj.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} style={styles.listItem}>{line.replace(/^[-•]\s*/, '')}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Education</h2>
          {education.map((edu, idx) => (
            <article key={idx} style={styles.entry}>
              <div>
                <span style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                <span style={styles.entryCompany}> – {edu.institution}, {edu.location || ''}</span>
                <span style={styles.entryDate}> ({edu.graduationDate})</span>
              </div>
              {edu.gpa && <div style={{ fontSize: '12px', color: '#4b5563' }}>CGPA: {edu.gpa}</div>}
            </article>
          ))}
        </section>
      )}

      {/* Technical Skills - Categorized */}
      {skills.technical.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Technical Skills</h2>
          <div style={styles.skillsGrid}>
            {categorizedSkills.programmingLanguages.length > 0 && (
              <div style={styles.skillRow}>
                <span style={styles.skillLabel}>Programming Languages: </span>
                {categorizedSkills.programmingLanguages.join(', ')}
              </div>
            )}
            {categorizedSkills.webDevelopment.length > 0 && (
              <div style={styles.skillRow}>
                <span style={styles.skillLabel}>Web Development: </span>
                {categorizedSkills.webDevelopment.join(', ')}
              </div>
            )}
            {categorizedSkills.databases.length > 0 && (
              <div style={styles.skillRow}>
                <span style={styles.skillLabel}>Databases: </span>
                {categorizedSkills.databases.join(', ')}
              </div>
            )}
            {categorizedSkills.tools.length > 0 && (
              <div style={styles.skillRow}>
                <span style={styles.skillLabel}>Tools: </span>
                {categorizedSkills.tools.join(', ')}
              </div>
            )}
            {categorizedSkills.other.length > 0 && (
              <div style={styles.skillRow}>
                <span style={styles.skillLabel}>Other: </span>
                {categorizedSkills.other.join(', ')}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Soft Skills */}
      {skills.soft.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Soft Skills</h2>
          <ul style={styles.softSkillsList}>
            {skills.soft.map((skill, idx) => (
              <li key={idx} style={styles.listItem}>{skill}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Certifications / Achievements */}
      {achievements.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Certifications</h2>
          <ul style={styles.list}>
            {achievements.map((ach, idx) => (
              <li key={idx} style={styles.listItem}>
                {ach.title}{ach.date && ` (${ach.date})`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Additional Information - Languages */}
      {skills.languages.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Additional Information</h2>
          <div style={{ fontSize: '12px', color: '#374151' }}>
            <span style={styles.skillLabel}>Languages Known: </span>
            {skills.languages.join(', ')}
          </div>
        </section>
      )}
    </div>
  )
}

export default BlueAccentTemplate
