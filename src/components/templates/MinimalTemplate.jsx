import React from 'react'
import { colors, fonts, printStyles, getFontSize, getLineHeight, getMargins } from './PrintStyles'

const MinimalTemplate = ({ resume, formatting }) => {
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
      marginBottom: '32px',
    },
    name: {
      fontSize: '28px',
      fontWeight: '300',
      color: colors.gray900,
      marginBottom: '8px',
      letterSpacing: '4px',
      textTransform: 'uppercase',
    },
    contactRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      fontSize: '11px',
      color: colors.gray500,
      letterSpacing: '0.5px',
    },
    section: {
      marginBottom: '24px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: '600',
      color: colors.gray400,
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginBottom: '12px',
      ...printStyles.header,
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
      fontWeight: '500',
      fontSize: '13px',
      color: colors.gray900,
    },
    entrySubtitle: {
      color: colors.gray600,
      fontSize: '12px',
    },
    entryDate: {
      color: colors.gray400,
      fontSize: '11px',
    },
    list: {
      paddingLeft: '0',
      margin: '6px 0 0 0',
      listStyle: 'none',
      fontSize: '12px',
      color: colors.gray600,
    },
    listItem: {
      marginBottom: '4px',
      paddingLeft: '12px',
      position: 'relative',
    },
    skillLine: {
      marginBottom: '6px',
      fontSize: '12px',
      color: colors.gray600,
    },
    link: {
      color: colors.gray500,
      textDecoration: 'none',
    },
    divider: {
      height: '1px',
      backgroundColor: colors.gray200,
      margin: '20px 0',
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
          {personalInfo.linkedin && <a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github} style={styles.link}>GitHub</a>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div style={styles.section}>
          <p style={{ margin: 0, fontSize: '12px', color: colors.gray600, lineHeight: '1.7' }}>{personalInfo.summary}</p>
        </div>
      )}

      <div style={styles.divider} />

      {/* Experience */}
      {experience.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Experience</h2>
          {experience.map((exp, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <span style={styles.entryTitle}>{exp.title}</span>
                  <span style={{ color: colors.gray400 }}> — </span>
                  <span style={styles.entrySubtitle}>{exp.company}</span>
                </div>
                <div style={styles.entryDate}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</div>
              </div>
              {exp.description && (
                <ul style={styles.list}>
                  {exp.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} style={styles.listItem}>– {line.replace(/^[-•]\s*/, '')}</li>
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
                  <span style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                  <span style={{ color: colors.gray400 }}> — </span>
                  <span style={styles.entrySubtitle}>{edu.institution}</span>
                </div>
                <div style={styles.entryDate}>{edu.graduationDate}</div>
              </div>
              {edu.gpa && <div style={{ fontSize: '11px', color: colors.gray500, marginTop: '2px' }}>GPA: {edu.gpa}</div>}
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
                <span style={styles.entryTitle}>{proj.name}</span>
                {proj.technologies && <span style={{ fontSize: '11px', color: colors.gray400 }}>{proj.technologies}</span>}
              </div>
              {proj.description && (
                <ul style={styles.list}>
                  {proj.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} style={styles.listItem}>– {line.replace(/^[-•]\s*/, '')}</li>
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
            <div style={styles.skillLine}>{skills.technical.join(' · ')}</div>
          )}
          {skills.soft.length > 0 && (
            <div style={styles.skillLine}>{skills.soft.join(' · ')}</div>
          )}
          {skills.languages.length > 0 && (
            <div style={styles.skillLine}>{skills.languages.join(' · ')}</div>
          )}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Achievements</h2>
          {achievements.map((achievement, index) => (
            <div key={index} style={{ fontSize: '12px', color: colors.gray600, marginBottom: '4px' }}>
              {achievement.title}{achievement.date && ` — ${achievement.date}`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MinimalTemplate
