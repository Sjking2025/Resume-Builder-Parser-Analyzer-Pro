import React from 'react'
import { colors, fonts, printStyles, getFontSize, getLineHeight, getMargins } from './PrintStyles'

const AcademicTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume
  
  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)
  const padding = getMargins(formatting.margins)

  const styles = {
    container: {
      fontFamily: fonts.serif,
      fontSize: fontSize.base,
      lineHeight,
      color: colors.gray800,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
      padding,
    },
    header: {
      textAlign: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: `1px solid ${colors.gray300}`,
    },
    name: {
      fontSize: '24px',
      fontWeight: '700',
      color: colors.gray900,
      marginBottom: '6px',
    },
    contactRow: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '16px',
      fontSize: '11px',
      color: colors.gray600,
    },
    section: {
      marginBottom: '20px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: colors.gray800,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      borderBottom: `1px solid ${colors.gray400}`,
      paddingBottom: '4px',
      marginBottom: '12px',
      ...printStyles.header,
    },
    entry: {
      marginBottom: '14px',
      ...printStyles.entry,
    },
    entryHeader: {
      marginBottom: '4px',
    },
    entryTitle: {
      fontWeight: '700',
      fontSize: '13px',
      color: colors.gray900,
      display: 'inline',
    },
    entryInstitution: {
      fontStyle: 'italic',
      color: colors.gray700,
      fontSize: '12px',
    },
    entryDate: {
      color: colors.gray600,
      fontSize: '11px',
      float: 'right',
    },
    entryGPA: {
      fontSize: '12px',
      color: colors.gray700,
      marginTop: '2px',
    },
    list: {
      paddingLeft: '20px',
      margin: '6px 0 0 0',
      fontSize: '12px',
      color: colors.gray700,
    },
    listItem: {
      marginBottom: '3px',
    },
    publicationStyle: {
      fontSize: '12px',
      color: colors.gray700,
      marginBottom: '6px',
      paddingLeft: '20px',
      textIndent: '-20px',
    },
    skillsSection: {
      fontSize: '12px',
      color: colors.gray700,
    },
    link: {
      color: colors.gray700,
      textDecoration: 'none',
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        <div style={styles.contactRow}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>|</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        <div style={{ ...styles.contactRow, marginTop: '4px' }}>
          {personalInfo.linkedin && <a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github} style={styles.link}>GitHub</a>}
          {personalInfo.portfolio && <a href={personalInfo.portfolio} style={styles.link}>Portfolio</a>}
        </div>
      </div>

      {/* Education - First for academic template */}
      {education.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Education</h2>
          {education.map((edu, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <span style={styles.entryDate}>{edu.graduationDate}</span>
                <div style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                <div style={styles.entryInstitution}>{edu.institution}{edu.location && `, ${edu.location}`}</div>
                {edu.gpa && <div style={styles.entryGPA}>GPA: {edu.gpa}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary / Research Interests */}
      {personalInfo.summary && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Research Interests</h2>
          <p style={{ margin: 0, fontSize: '12px', color: colors.gray700, lineHeight: '1.6' }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Experience</h2>
          {experience.map((exp, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <span style={styles.entryDate}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                <div style={styles.entryTitle}>{exp.title}</div>
                <div style={styles.entryInstitution}>{exp.company}{exp.location && `, ${exp.location}`}</div>
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

      {/* Projects / Publications */}
      {projects.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Projects & Publications</h2>
          {projects.map((proj, index) => (
            <div key={index} style={styles.publicationStyle}>
              <strong>{proj.name}</strong>
              {proj.technologies && <span> ({proj.technologies})</span>}
              {proj.description && <span>. {proj.description.split('\n')[0]}</span>}
              {proj.link && <span>. Available at: <a href={proj.link} style={styles.link}>{proj.link}</a></span>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Skills & Competencies</h2>
          <div style={styles.skillsSection}>
            {skills.technical.length > 0 && (
              <p style={{ margin: '0 0 6px 0' }}><strong>Technical Skills:</strong> {skills.technical.join(', ')}</p>
            )}
            {skills.soft.length > 0 && (
              <p style={{ margin: '0 0 6px 0' }}><strong>Soft Skills:</strong> {skills.soft.join(', ')}</p>
            )}
            {skills.languages.length > 0 && (
              <p style={{ margin: 0 }}><strong>Languages:</strong> {skills.languages.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Achievements / Honors */}
      {achievements.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Honors & Awards</h2>
          {achievements.map((achievement, index) => (
            <div key={index} style={{ fontSize: '12px', color: colors.gray700, marginBottom: '4px' }}>
              <strong>{achievement.title}</strong>{achievement.date && `, ${achievement.date}`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AcademicTemplate
