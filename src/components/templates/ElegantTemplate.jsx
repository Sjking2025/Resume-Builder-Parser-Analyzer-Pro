import React from 'react'
import { colors, fonts, printStyles, getFontSize, getLineHeight, getMargins } from './PrintStyles'

const ElegantTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume
  
  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)
  const padding = getMargins(formatting.margins)

  const elegantColors = {
    gold: '#b8860b',
    goldLight: '#f5f0e1',
    charcoal: '#36454f',
  }

  const styles = {
    container: {
      fontFamily: fonts.serif,
      fontSize: fontSize.base,
      lineHeight,
      color: elegantColors.charcoal,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
      padding,
      border: `1px solid ${colors.gray200}`,
    },
    header: {
      textAlign: 'center',
      marginBottom: '28px',
      paddingBottom: '20px',
      position: 'relative',
    },
    headerDecor: {
      position: 'absolute',
      bottom: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '120px',
      height: '2px',
      backgroundColor: elegantColors.gold,
    },
    name: {
      fontSize: '32px',
      fontWeight: '400',
      color: elegantColors.charcoal,
      marginBottom: '8px',
      letterSpacing: '4px',
      textTransform: 'uppercase',
    },
    contactRow: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '24px',
      fontSize: '11px',
      color: colors.gray600,
      letterSpacing: '0.5px',
    },
    section: {
      marginBottom: '24px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: '400',
      color: elegantColors.gold,
      textTransform: 'uppercase',
      letterSpacing: '3px',
      marginBottom: '14px',
      textAlign: 'center',
      ...printStyles.header,
    },
    sectionDivider: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '14px',
    },
    dividerLine: {
      flex: '1',
      height: '1px',
      backgroundColor: colors.gray300,
    },
    entry: {
      marginBottom: '16px',
      ...printStyles.entry,
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '4px',
    },
    entryTitle: {
      fontWeight: '600',
      fontSize: '14px',
      color: elegantColors.charcoal,
    },
    entrySubtitle: {
      fontStyle: 'italic',
      color: colors.gray600,
      fontSize: '12px',
    },
    entryDate: {
      color: elegantColors.gold,
      fontSize: '11px',
      fontStyle: 'italic',
    },
    list: {
      paddingLeft: '20px',
      margin: '8px 0 0 0',
      fontSize: '12px',
      color: colors.gray600,
    },
    listItem: {
      marginBottom: '4px',
    },
    skillsElegant: {
      textAlign: 'center',
      fontSize: '12px',
      color: colors.gray600,
    },
    link: {
      color: elegantColors.gold,
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
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        <div style={{ ...styles.contactRow, marginTop: '8px' }}>
          {personalInfo.linkedin && <a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github} style={styles.link}>GitHub</a>}
          {personalInfo.portfolio && <a href={personalInfo.portfolio} style={styles.link}>Portfolio</a>}
        </div>
        <div style={styles.headerDecor}></div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div style={styles.section}>
          <p style={{ margin: 0, fontSize: '12px', color: colors.gray600, lineHeight: '1.8', textAlign: 'center', fontStyle: 'italic', padding: '0 20px' }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionDivider}>
            <span style={styles.dividerLine}></span>
            <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Experience</h2>
            <span style={styles.dividerLine}></span>
          </div>
          {experience.map((exp, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{exp.title}</div>
                  <div style={styles.entrySubtitle}>{exp.company}{exp.location && ` — ${exp.location}`}</div>
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
          <div style={styles.sectionDivider}>
            <span style={styles.dividerLine}></span>
            <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Education</h2>
            <span style={styles.dividerLine}></span>
          </div>
          {education.map((edu, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                  <div style={styles.entrySubtitle}>{edu.institution}{edu.location && ` — ${edu.location}`}</div>
                  {edu.gpa && <div style={{ fontSize: '11px', color: colors.gray500, marginTop: '2px' }}>GPA: {edu.gpa}</div>}
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
          <div style={styles.sectionDivider}>
            <span style={styles.dividerLine}></span>
            <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Projects</h2>
            <span style={styles.dividerLine}></span>
          </div>
          {projects.map((proj, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{proj.name}</div>
                  {proj.technologies && <div style={{ fontSize: '11px', fontStyle: 'italic', color: colors.gray500 }}>{proj.technologies}</div>}
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
          <div style={styles.sectionDivider}>
            <span style={styles.dividerLine}></span>
            <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Expertise</h2>
            <span style={styles.dividerLine}></span>
          </div>
          <div style={styles.skillsElegant}>
            {skills.technical.length > 0 && <p style={{ margin: '0 0 6px 0' }}>{skills.technical.join(' • ')}</p>}
            {skills.soft.length > 0 && <p style={{ margin: '0 0 6px 0', fontStyle: 'italic' }}>{skills.soft.join(' • ')}</p>}
            {skills.languages.length > 0 && <p style={{ margin: 0 }}>Languages: {skills.languages.join(', ')}</p>}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionDivider}>
            <span style={styles.dividerLine}></span>
            <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Honors</h2>
            <span style={styles.dividerLine}></span>
          </div>
          <div style={{ textAlign: 'center' }}>
            {achievements.map((achievement, index) => (
              <span key={index} style={{ fontSize: '12px', color: colors.gray600 }}>
                {achievement.title}{achievement.date && ` (${achievement.date})`}
                {index < achievements.length - 1 && ' • '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ElegantTemplate
