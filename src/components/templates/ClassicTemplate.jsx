import React from 'react'
import { colors, fonts, printStyles, getFontSize, getLineHeight, getMargins } from './PrintStyles'

const ClassicTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume
  
  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)
  const padding = getMargins(formatting.margins)

  const styles = {
    container: {
      fontFamily: fonts.serif,
      fontSize: fontSize.base,
      lineHeight,
      color: colors.gray900,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
      padding,
    },
    header: {
      textAlign: 'center',
      borderBottom: `2px solid ${colors.black}`,
      paddingBottom: '16px',
      marginBottom: '20px',
    },
    name: {
      fontSize: fontSize.h1,
      fontWeight: '700',
      color: colors.black,
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '2px',
    },
    contactRow: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '16px',
      fontSize: '12px',
      color: colors.gray700,
    },
    section: {
      marginBottom: '18px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: fontSize.h2,
      fontWeight: '700',
      color: colors.black,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      borderBottom: `1px solid ${colors.gray400}`,
      paddingBottom: '4px',
      marginBottom: '10px',
      ...printStyles.header,
    },
    entry: {
      marginBottom: '12px',
      ...printStyles.entry,
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '4px',
    },
    entryTitle: {
      fontWeight: '700',
      fontSize: fontSize.h3,
      color: colors.black,
    },
    entrySubtitle: {
      fontStyle: 'italic',
      color: colors.gray700,
      fontSize: '12px',
    },
    entryDate: {
      color: colors.gray600,
      fontSize: '11px',
      textAlign: 'right',
    },
    list: {
      paddingLeft: '18px',
      margin: '4px 0 0 0',
      fontSize: '12px',
      color: colors.gray700,
    },
    listItem: {
      marginBottom: '2px',
    },
    skillLine: {
      marginBottom: '4px',
      fontSize: '12px',
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

      {/* Summary */}
      {personalInfo.summary && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Professional Summary</h2>
          <p style={{ margin: 0, fontSize: '12px', color: colors.gray700 }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Professional Experience</h2>
          {experience.map((exp, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{exp.title}</div>
                  <div style={styles.entrySubtitle}>{exp.company}{exp.location && `, ${exp.location}`}</div>
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
          <h2 style={styles.sectionTitle}>Education</h2>
          {education.map((edu, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                  <div style={styles.entrySubtitle}>{edu.institution}{edu.location && `, ${edu.location}`}</div>
                  {edu.gpa && <div style={{ fontSize: '11px', color: colors.gray600 }}>GPA: {edu.gpa}</div>}
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
          <h2 style={styles.sectionTitle}>Projects</h2>
          {projects.map((proj, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{proj.name}</div>
                  {proj.technologies && <div style={{ fontSize: '11px', fontStyle: 'italic', color: colors.gray600 }}>{proj.technologies}</div>}
                </div>
                {proj.link && <a href={proj.link} style={{ ...styles.link, fontSize: '11px' }}>View Project</a>}
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
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Skills</h2>
          {skills.technical.length > 0 && (
            <div style={styles.skillLine}>
              <strong>Technical:</strong> {skills.technical.join(', ')}
            </div>
          )}
          {skills.soft.length > 0 && (
            <div style={styles.skillLine}>
              <strong>Soft Skills:</strong> {skills.soft.join(', ')}
            </div>
          )}
          {skills.languages.length > 0 && (
            <div style={styles.skillLine}>
              <strong>Languages:</strong> {skills.languages.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Achievements & Certifications</h2>
          <ul style={{ ...styles.list, paddingLeft: '18px' }}>
            {achievements.map((achievement, index) => (
              <li key={index} style={styles.listItem}>
                {achievement.title}{achievement.date && ` (${achievement.date})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ClassicTemplate
