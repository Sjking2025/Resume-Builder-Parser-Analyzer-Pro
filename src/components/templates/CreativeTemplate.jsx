import React from 'react'
import { colors, fonts, printStyles, getFontSize, getLineHeight, getMargins } from './PrintStyles'

const CreativeTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume
  
  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)
  const padding = getMargins(formatting.margins)

  // Accent color based on color scheme
  const accentColors = {
    blue: { primary: '#3b82f6', light: '#dbeafe', dark: '#1d4ed8' },
    purple: { primary: '#8b5cf6', light: '#ede9fe', dark: '#6d28d9' },
    green: { primary: '#10b981', light: '#d1fae5', dark: '#047857' },
  }
  const accent = accentColors[formatting.colorScheme] || accentColors.blue

  const styles = {
    container: {
      fontFamily: fonts.modern,
      fontSize: fontSize.base,
      lineHeight,
      color: colors.gray800,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
      padding,
    },
    header: {
      position: 'relative',
      marginBottom: '24px',
      paddingLeft: '16px',
      borderLeft: `4px solid ${accent.primary}`,
    },
    name: {
      fontSize: '28px',
      fontWeight: '700',
      color: colors.gray900,
      marginBottom: '4px',
    },
    tagline: {
      fontSize: '14px',
      color: accent.primary,
      fontWeight: '500',
      marginBottom: '10px',
    },
    contactRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      fontSize: '12px',
      color: colors.gray600,
    },
    section: {
      marginBottom: '20px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: '700',
      color: accent.dark,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      ...printStyles.header,
    },
    sectionLine: {
      flex: '1',
      height: '2px',
      backgroundColor: accent.light,
    },
    entry: {
      marginBottom: '14px',
      padding: '10px 12px',
      backgroundColor: colors.gray50,
      borderRadius: '6px',
      ...printStyles.entry,
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '6px',
    },
    entryTitle: {
      fontWeight: '600',
      fontSize: '13px',
      color: colors.gray900,
    },
    entryCompany: {
      color: accent.primary,
      fontSize: '12px',
      fontWeight: '500',
    },
    entryDate: {
      color: colors.white,
      fontSize: '10px',
      fontWeight: '600',
      backgroundColor: accent.primary,
      padding: '2px 8px',
      borderRadius: '10px',
    },
    list: {
      paddingLeft: '16px',
      margin: '6px 0 0 0',
      fontSize: '11px',
      color: colors.gray600,
    },
    listItem: {
      marginBottom: '2px',
    },
    skillTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
    },
    skillTag: {
      backgroundColor: accent.light,
      color: accent.dark,
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
    },
    link: {
      color: accent.primary,
      textDecoration: 'none',
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        <div style={styles.contactRow}>
          {personalInfo.email && <span>📧 {personalInfo.email}</span>}
          {personalInfo.phone && <span>📱 {personalInfo.phone}</span>}
          {personalInfo.location && <span>📍 {personalInfo.location}</span>}
          {personalInfo.linkedin && <a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github} style={styles.link}>GitHub</a>}
          {personalInfo.portfolio && <a href={personalInfo.portfolio} style={styles.link}>Portfolio</a>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div style={styles.section}>
          <p style={{ margin: 0, fontSize: '12px', color: colors.gray600, lineHeight: '1.6', fontStyle: 'italic', paddingLeft: '16px', borderLeft: `2px solid ${accent.light}` }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Experience
            <span style={styles.sectionLine}></span>
          </h2>
          {experience.map((exp, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{exp.title}</div>
                  <div style={styles.entryCompany}>{exp.company}{exp.location && ` • ${exp.location}`}</div>
                </div>
                <div style={styles.entryDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
              </div>
              {exp.description && (
                <ul style={styles.list}>
                  {exp.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} style={styles.listItem}>{line.replace(/^[-•]\s*/, '')}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Education
            <span style={styles.sectionLine}></span>
          </h2>
          {education.map((edu, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                  <div style={styles.entryCompany}>{edu.institution}</div>
                  {edu.gpa && <div style={{ fontSize: '11px', color: colors.gray500 }}>GPA: {edu.gpa}</div>}
                </div>
                <div style={styles.entryDate}>{edu.graduationDate}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Projects
            <span style={styles.sectionLine}></span>
          </h2>
          {projects.map((proj, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{proj.name}</div>
                  {proj.technologies && <div style={{ fontSize: '10px', color: accent.primary }}>{proj.technologies}</div>}
                </div>
                {proj.link && <a href={proj.link} style={{ ...styles.link, fontSize: '11px' }}>View →</a>}
              </div>
              {proj.description && (
                <ul style={styles.list}>
                  {proj.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} style={styles.listItem}>{line.replace(/^[-•]\s*/, '')}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Skills
            <span style={styles.sectionLine}></span>
          </h2>
          <div style={styles.skillTags}>
            {skills.technical.map((skill, index) => (
              <span key={index} style={styles.skillTag}>{skill}</span>
            ))}
            {skills.soft.map((skill, index) => (
              <span key={`soft-${index}`} style={{ ...styles.skillTag, backgroundColor: colors.gray100, color: colors.gray700 }}>{skill}</span>
            ))}
          </div>
          {skills.languages.length > 0 && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: colors.gray600 }}>
              <strong>Languages:</strong> {skills.languages.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Achievements
            <span style={styles.sectionLine}></span>
          </h2>
          <div style={styles.skillTags}>
            {achievements.map((achievement, index) => (
              <span key={index} style={{ ...styles.skillTag, backgroundColor: colors.gold100, color: colors.gold600 }}>
                🏆 {achievement.title}{achievement.date && ` (${achievement.date})`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CreativeTemplate
