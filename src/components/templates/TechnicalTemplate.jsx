import React from 'react'
import { colors, fonts, printStyles, getFontSize, getLineHeight, getMargins } from './PrintStyles'

const TechnicalTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume
  
  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)
  const padding = getMargins(formatting.margins)

  const styles = {
    container: {
      fontFamily: fonts.sansSerif,
      fontSize: fontSize.base,
      lineHeight,
      color: colors.gray800,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
      padding,
    },
    header: {
      marginBottom: '20px',
    },
    name: {
      fontSize: '26px',
      fontWeight: '700',
      color: colors.gray900,
      marginBottom: '4px',
    },
    contactRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      fontSize: '11px',
      color: colors.gray600,
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    section: {
      marginBottom: '18px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '700',
      color: colors.green600,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      ...printStyles.header,
    },
    sectionIcon: {
      width: '16px',
      height: '16px',
      backgroundColor: colors.green100,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
    },
    skillsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginBottom: '12px',
    },
    skillCategory: {
      padding: '10px',
      backgroundColor: colors.gray50,
      borderRadius: '6px',
      borderLeft: `3px solid ${colors.green600}`,
    },
    skillCategoryTitle: {
      fontWeight: '600',
      fontSize: '11px',
      color: colors.gray800,
      marginBottom: '6px',
    },
    skillTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
    },
    skillTag: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.gray200}`,
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      color: colors.gray700,
    },
    entry: {
      marginBottom: '14px',
      ...printStyles.entry,
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '4px',
    },
    entryTitle: {
      fontWeight: '600',
      fontSize: '13px',
      color: colors.gray900,
    },
    entryTech: {
      fontSize: '10px',
      color: colors.green600,
      fontFamily: '"Consolas", "Monaco", monospace',
    },
    entryDate: {
      color: colors.gray500,
      fontSize: '10px',
      fontWeight: '500',
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
    codeBlock: {
      fontFamily: '"Consolas", "Monaco", monospace',
      fontSize: '10px',
      color: colors.gray600,
    },
    link: {
      color: colors.green600,
      textDecoration: 'none',
    },
    projectCard: {
      padding: '10px',
      backgroundColor: colors.gray50,
      borderRadius: '6px',
      marginBottom: '10px',
      borderLeft: `3px solid ${colors.green600}`,
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        <div style={styles.contactRow}>
          {personalInfo.email && <span style={styles.contactItem}>📧 {personalInfo.email}</span>}
          {personalInfo.phone && <span style={styles.contactItem}>📱 {personalInfo.phone}</span>}
          {personalInfo.location && <span style={styles.contactItem}>📍 {personalInfo.location}</span>}
          {personalInfo.github && <a href={personalInfo.github} style={{ ...styles.contactItem, ...styles.link }}>⌨️ GitHub</a>}
          {personalInfo.linkedin && <a href={personalInfo.linkedin} style={{ ...styles.contactItem, ...styles.link }}>💼 LinkedIn</a>}
          {personalInfo.portfolio && <a href={personalInfo.portfolio} style={{ ...styles.contactItem, ...styles.link }}>🌐 Portfolio</a>}
        </div>
      </div>

      {/* Skills - First for technical template */}
      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>⚡</span>
            Technical Skills
          </h2>
          <div style={styles.skillsGrid}>
            <div style={styles.skillCategory}>
              <div style={styles.skillCategoryTitle}>Languages & Frameworks</div>
              <div style={styles.skillTags}>
                {skills.technical.slice(0, Math.ceil(skills.technical.length / 2)).map((skill, index) => (
                  <span key={index} style={styles.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
            <div style={styles.skillCategory}>
              <div style={styles.skillCategoryTitle}>Tools & Technologies</div>
              <div style={styles.skillTags}>
                {skills.technical.slice(Math.ceil(skills.technical.length / 2)).map((skill, index) => (
                  <span key={index} style={styles.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
          {skills.languages.length > 0 && (
            <div style={{ fontSize: '11px', color: colors.gray600 }}>
              <strong>Languages:</strong> {skills.languages.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {personalInfo.summary && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>👤</span>
            Summary
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: colors.gray600, lineHeight: '1.5' }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Projects - Prominent in technical template */}
      {projects.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>🚀</span>
            Projects
          </h2>
          {projects.map((proj, index) => (
            <div key={index} style={styles.projectCard}>
              <div style={styles.entryHeader}>
                <div>
                  <span style={styles.entryTitle}>{proj.name}</span>
                  {proj.link && <a href={proj.link} style={{ ...styles.link, marginLeft: '8px', fontSize: '10px' }}>↗</a>}
                </div>
              </div>
              {proj.technologies && <div style={styles.entryTech}>{proj.technologies}</div>}
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

      {/* Experience */}
      {experience.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>💼</span>
            Experience
          </h2>
          {experience.map((exp, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{exp.title}</div>
                  <div style={{ fontSize: '12px', color: colors.gray600 }}>{exp.company}{exp.location && ` • ${exp.location}`}</div>
                </div>
                <div style={styles.entryDate}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</div>
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
            <span style={styles.sectionIcon}>🎓</span>
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                  <div style={{ fontSize: '11px', color: colors.gray600 }}>{edu.institution}</div>
                </div>
                <div style={styles.entryDate}>{edu.graduationDate}{edu.gpa && ` | GPA: ${edu.gpa}`}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>🏆</span>
            Certifications
          </h2>
          <div style={styles.skillTags}>
            {achievements.map((achievement, index) => (
              <span key={index} style={{ ...styles.skillTag, backgroundColor: colors.green100, borderColor: colors.green600 }}>
                {achievement.title}{achievement.date && ` (${achievement.date})`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TechnicalTemplate
