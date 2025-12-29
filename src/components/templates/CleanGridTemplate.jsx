import React from 'react'
import { colors, printStyles, getFontSize, getLineHeight } from './PrintStyles'

// Clean Grid template - 2:1 two-column layout with header
// Uses system-ui font for maximum compatibility
const CleanGridTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume

  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)

  const accentColors = {
    blue: '#2563eb',
    purple: '#7c3aed',
    green: '#059669',
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
      padding: '24px 32px',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '16px',
      marginBottom: '8px',
    },
    name: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#111827',
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      margin: 0,
    },
    headline: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#4b5563',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
    tagline: {
      fontSize: '13px',
      marginTop: '4px',
      color: '#111827',
      lineHeight: '1.4',
    },
    contact: {
      textAlign: 'right',
      fontSize: '12px',
      lineHeight: '1.5',
      color: '#111827',
    },
    contactLink: {
      color: accent,
      textDecoration: 'none',
    },
    section: {
      marginTop: '12px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827',
      textTransform: 'uppercase',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '4px',
      marginBottom: '4px',
      marginTop: '18px',
      ...printStyles.header,
    },
    twoColumn: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px',
    },
    entry: {
      marginBottom: '12px',
      ...printStyles.entry,
    },
    entryTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827',
      margin: 0,
    },
    subRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#4b5563',
      marginTop: '1px',
    },
    list: {
      margin: '4px 0 0',
      paddingLeft: '18px',
      fontSize: '13px',
      lineHeight: '1.4',
    },
    listItem: {
      marginBottom: '2px',
      color: '#111827',
    },
    muted: {
      color: '#4b5563',
      fontSize: '12px',
    },
    label: {
      fontWeight: '600',
    },
    paragraph: {
      margin: '2px 0 4px',
      fontSize: '13px',
      lineHeight: '1.4',
      color: '#111827',
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Header */}
      <header>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
            {personalInfo.summary && (
              <p style={styles.tagline}>{personalInfo.summary}</p>
            )}
          </div>
          <div style={styles.contact}>
            {personalInfo.location && <div>{personalInfo.location}</div>}
            {personalInfo.phone && <div>Phone: {personalInfo.phone}</div>}
            {personalInfo.email && <div>Email: {personalInfo.email}</div>}
            {personalInfo.linkedin && (
              <div>
                LinkedIn: <a href={personalInfo.linkedin} style={styles.contactLink}>LinkedIn Profile</a>
              </div>
            )}
            {personalInfo.github && (
              <div>
                GitHub: <a href={personalInfo.github} style={styles.contactLink}>GitHub Profile</a>
              </div>
            )}
            {personalInfo.portfolio && (
              <div>
                Portfolio: <a href={personalInfo.portfolio} style={styles.contactLink}>Portfolio</a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Two-Column Layout */}
      <div style={styles.twoColumn}>
        {/* Left Column - Experience & Projects */}
        <div>
          {/* Experience */}
          {experience.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Experience</h2>
              {experience.map((exp, idx) => (
                <article key={idx} style={styles.entry}>
                  <h3 style={styles.entryTitle}>{exp.title}</h3>
                  <div style={styles.subRow}>
                    <span style={styles.muted}>{exp.company}{exp.location && ` · ${exp.location}`}</span>
                    <span style={styles.muted}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
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
                  <h3 style={styles.entryTitle}>{proj.name}</h3>
                  <div style={styles.subRow}>
                    <span style={styles.muted}>{proj.technologies}</span>
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
        </div>

        {/* Right Column - Education, Skills, Achievements */}
        <div>
          {/* Education */}
          {education.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Education</h2>
              {education.map((edu, idx) => (
                <article key={idx} style={styles.entry}>
                  <h3 style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</h3>
                  <p style={styles.muted}>{edu.institution}</p>
                  <p style={styles.muted}>Expected Graduation: {edu.graduationDate}</p>
                  {edu.gpa && <p style={styles.muted}>CGPA: {edu.gpa}</p>}
                </article>
              ))}
            </section>
          )}

          {/* Skills */}
          {(skills.technical.length > 0 || skills.soft.length > 0) && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Technical Skills</h2>
              {skills.technical.length > 0 && (
                <p style={styles.paragraph}>
                  <span style={styles.label}>Technical:</span> {skills.technical.join(', ')}
                </p>
              )}
              {skills.soft.length > 0 && (
                <p style={styles.paragraph}>
                  <span style={styles.label}>Soft Skills:</span> {skills.soft.join(', ')}
                </p>
              )}
              {skills.languages.length > 0 && (
                <p style={styles.paragraph}>
                  <span style={styles.label}>Languages:</span> {skills.languages.join(', ')}
                </p>
              )}
            </section>
          )}

          {/* Achievements / Certifications */}
          {achievements.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Certifications</h2>
              <ul style={styles.list}>
                {achievements.map((ach, idx) => (
                  <li key={idx} style={styles.listItem}>
                    {ach.title}{ach.date && `, ${ach.date}`}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default CleanGridTemplate
