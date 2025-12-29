import React from 'react'
import { colors, printStyles, getFontSize, getLineHeight } from './PrintStyles'

// Uses Lato from Google Fonts - elegant, professional, highly readable
const TwoColumnTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume

  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)

  const styles = {
    container: {
      fontFamily: "'Lato', 'Helvetica Neue', Arial, sans-serif",
      fontSize: fontSize.base,
      lineHeight,
      color: colors.gray800,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
      padding: '0',
    },
    header: {
      backgroundColor: colors.gray900,
      color: colors.white,
      padding: '24px 32px',
      textAlign: 'center',
    },
    name: {
      fontSize: '26px',
      fontWeight: '700',
      color: colors.white,
      marginBottom: '8px',
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
    contactRow: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '16px',
      fontSize: '11px',
      color: colors.gray300,
    },
    body: {
      display: 'flex',
      padding: '0',
    },
    leftColumn: {
      width: '40%',
      padding: '24px',
      backgroundColor: colors.gray50,
      borderRight: `1px solid ${colors.gray200}`,
    },
    rightColumn: {
      width: '60%',
      padding: '24px',
    },
    section: {
      marginBottom: '20px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '700',
      color: colors.gray900,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom: '10px',
      paddingBottom: '6px',
      borderBottom: `2px solid ${colors.gray900}`,
      ...printStyles.header,
    },
    entry: {
      marginBottom: '14px',
      ...printStyles.entry,
    },
    entryTitle: {
      fontWeight: '700',
      fontSize: '13px',
      color: colors.gray900,
    },
    entrySubtitle: {
      color: colors.gray600,
      fontSize: '12px',
    },
    entryDate: {
      color: colors.gray500,
      fontSize: '10px',
      marginTop: '2px',
    },
    list: {
      paddingLeft: '14px',
      margin: '6px 0 0 0',
      fontSize: '11px',
      color: colors.gray600,
    },
    listItem: {
      marginBottom: '3px',
    },
    skillItem: {
      fontSize: '11px',
      color: colors.gray700,
      padding: '4px 0',
      borderBottom: `1px solid ${colors.gray200}`,
    },
    link: {
      color: colors.gray300,
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
        <div style={{ ...styles.contactRow, marginTop: '6px' }}>
          {personalInfo.linkedin && <a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github} style={styles.link}>GitHub</a>}
          {personalInfo.portfolio && <a href={personalInfo.portfolio} style={styles.link}>Portfolio</a>}
        </div>
      </div>

      {/* Two Column Body */}
      <div style={styles.body}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Summary */}
          {personalInfo.summary && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>About Me</h2>
              <p style={{ margin: 0, fontSize: '11px', color: colors.gray600, lineHeight: '1.6' }}>{personalInfo.summary}</p>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Education</h2>
              {education.map((edu, idx) => (
                <div key={idx} style={styles.entry}>
                  <div style={styles.entryTitle}>{edu.degree}</div>
                  <div style={styles.entrySubtitle}>{edu.institution}</div>
                  <div style={styles.entryDate}>{edu.graduationDate}{edu.gpa && ` | GPA: ${edu.gpa}`}</div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.technical.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Technical Skills</h2>
              {skills.technical.map((skill, idx) => (
                <div key={idx} style={styles.skillItem}>{skill}</div>
              ))}
            </div>
          )}

          {/* Soft Skills */}
          {skills.soft.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Soft Skills</h2>
              {skills.soft.map((skill, idx) => (
                <div key={idx} style={styles.skillItem}>{skill}</div>
              ))}
            </div>
          )}

          {/* Languages */}
          {skills.languages.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Languages</h2>
              {skills.languages.map((lang, idx) => (
                <div key={idx} style={styles.skillItem}>{lang}</div>
              ))}
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Achievements</h2>
              {achievements.map((ach, idx) => (
                <div key={idx} style={styles.entry}>
                  <div style={{ fontSize: '11px', color: colors.gray700 }}>{ach.title}</div>
                  {ach.date && <div style={{ fontSize: '10px', color: colors.gray500 }}>{ach.date}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={styles.rightColumn}>
          {/* Experience */}
          {experience.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Work Experience</h2>
              {experience.map((exp, idx) => (
                <div key={idx} style={styles.entry}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={styles.entryTitle}>{exp.title}</div>
                    <div style={styles.entryDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                  </div>
                  <div style={styles.entrySubtitle}>{exp.company}{exp.location && `, ${exp.location}`}</div>
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

          {/* Projects */}
          {projects.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Projects</h2>
              {projects.map((proj, idx) => (
                <div key={idx} style={styles.entry}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={styles.entryTitle}>{proj.name}</div>
                    {proj.link && <a href={proj.link} style={{ color: colors.gray600, fontSize: '10px', textDecoration: 'none' }}>View →</a>}
                  </div>
                  {proj.technologies && <div style={{ fontSize: '10px', color: colors.gray500, marginTop: '2px' }}>{proj.technologies}</div>}
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
        </div>
      </div>
    </div>
  )
}

export default TwoColumnTemplate
