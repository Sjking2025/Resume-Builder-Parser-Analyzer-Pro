import React from 'react'
import { colors, fonts, printStyles, getFontSize, getLineHeight } from './PrintStyles'

const CompactTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume
  
  const fontSize = getFontSize('small') // Always use small font for compact
  const lineHeight = '1.35'

  const styles = {
    container: {
      fontFamily: fonts.sansSerif,
      fontSize: '11px',
      lineHeight,
      color: colors.gray900,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
      padding: '24px 28px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      borderBottom: `1px solid ${colors.gray300}`,
      paddingBottom: '10px',
      marginBottom: '12px',
    },
    nameSection: {
      flex: '1',
    },
    name: {
      fontSize: '20px',
      fontWeight: '700',
      color: colors.gray900,
      marginBottom: '2px',
    },
    contactSection: {
      textAlign: 'right',
      fontSize: '10px',
      color: colors.gray600,
      lineHeight: '1.5',
    },
    twoColumn: {
      display: 'flex',
      gap: '20px',
    },
    mainColumn: {
      flex: '2',
    },
    sideColumn: {
      flex: '1',
    },
    section: {
      marginBottom: '10px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: '700',
      color: colors.gray800,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `1px solid ${colors.gray200}`,
      paddingBottom: '2px',
      marginBottom: '6px',
      ...printStyles.header,
    },
    entry: {
      marginBottom: '8px',
      ...printStyles.entry,
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    entryTitle: {
      fontWeight: '600',
      fontSize: '11px',
      color: colors.gray900,
    },
    entrySubtitle: {
      color: colors.gray600,
      fontSize: '10px',
    },
    entryDate: {
      color: colors.gray500,
      fontSize: '10px',
    },
    list: {
      paddingLeft: '12px',
      margin: '2px 0 0 0',
      fontSize: '10px',
      color: colors.gray700,
    },
    listItem: {
      marginBottom: '1px',
    },
    skillsCompact: {
      fontSize: '10px',
      color: colors.gray700,
      marginBottom: '4px',
    },
    link: {
      color: colors.gray600,
      textDecoration: 'none',
    },
    summaryText: {
      margin: 0,
      fontSize: '10px',
      color: colors.gray700,
      lineHeight: '1.4',
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Compact Header */}
      <div style={styles.header}>
        <div style={styles.nameSection}>
          <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
          {personalInfo.summary && (
            <p style={styles.summaryText}>{personalInfo.summary}</p>
          )}
        </div>
        <div style={styles.contactSection}>
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            {personalInfo.linkedin && <a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a>}
            {personalInfo.github && <a href={personalInfo.github} style={styles.link}>GitHub</a>}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoColumn}>
        {/* Main Column */}
        <div style={styles.mainColumn}>
          {/* Experience */}
          {experience.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Experience</h2>
              {experience.map((exp, index) => (
                <div key={index} style={styles.entry}>
                  <div style={styles.entryHeader}>
                    <div>
                      <span style={styles.entryTitle}>{exp.title}</span>
                      <span style={styles.entrySubtitle}> | {exp.company}</span>
                    </div>
                    <div style={styles.entryDate}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</div>
                  </div>
                  {exp.description && (
                    <ul style={styles.list}>
                      {exp.description.split('\n').filter(Boolean).slice(0, 3).map((line, i) => (
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
              {projects.map((proj, index) => (
                <div key={index} style={styles.entry}>
                  <div style={styles.entryHeader}>
                    <span style={styles.entryTitle}>{proj.name}</span>
                    {proj.technologies && <span style={{ fontSize: '9px', color: colors.gray500 }}>{proj.technologies}</span>}
                  </div>
                  {proj.description && (
                    <ul style={styles.list}>
                      {proj.description.split('\n').filter(Boolean).slice(0, 2).map((line, i) => (
                        <li key={i} style={styles.listItem}>{line.replace(/^[-•]\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side Column */}
        <div style={styles.sideColumn}>
          {/* Education */}
          {education.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Education</h2>
              {education.map((edu, index) => (
                <div key={index} style={{ marginBottom: '6px' }}>
                  <div style={styles.entryTitle}>{edu.degree}</div>
                  <div style={{ fontSize: '10px', color: colors.gray600 }}>{edu.institution}</div>
                  <div style={{ fontSize: '9px', color: colors.gray500 }}>{edu.graduationDate}{edu.gpa && ` | GPA: ${edu.gpa}`}</div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {(skills.technical.length > 0 || skills.soft.length > 0) && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Skills</h2>
              {skills.technical.length > 0 && (
                <div style={styles.skillsCompact}>
                  <strong>Tech:</strong> {skills.technical.join(', ')}
                </div>
              )}
              {skills.soft.length > 0 && (
                <div style={styles.skillsCompact}>
                  <strong>Soft:</strong> {skills.soft.join(', ')}
                </div>
              )}
              {skills.languages.length > 0 && (
                <div style={styles.skillsCompact}>
                  <strong>Lang:</strong> {skills.languages.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Awards</h2>
              {achievements.map((achievement, index) => (
                <div key={index} style={{ fontSize: '10px', color: colors.gray600, marginBottom: '2px' }}>
                  • {achievement.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompactTemplate
