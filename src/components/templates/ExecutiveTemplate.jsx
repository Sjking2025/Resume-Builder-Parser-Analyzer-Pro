import React from 'react'
import { colors, fonts, printStyles, getFontSize, getLineHeight, getMargins } from './PrintStyles'

const ExecutiveTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume
  
  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)
  const padding = getMargins(formatting.margins)

  const styles = {
    container: {
      fontFamily: fonts.sansSerif,
      fontSize: fontSize.base,
      lineHeight,
      color: colors.gray900,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
      padding,
    },
    header: {
      borderBottom: `3px solid ${colors.navy800}`,
      paddingBottom: '20px',
      marginBottom: '24px',
    },
    name: {
      fontSize: '32px',
      fontWeight: '800',
      color: colors.navy800,
      marginBottom: '8px',
      letterSpacing: '1px',
    },
    title: {
      fontSize: '16px',
      fontWeight: '500',
      color: colors.gray600,
      marginBottom: '12px',
    },
    contactGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      fontSize: '12px',
      color: colors.gray700,
    },
    section: {
      marginBottom: '20px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: colors.navy800,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      borderBottom: `2px solid ${colors.navy800}`,
      paddingBottom: '6px',
      marginBottom: '14px',
      ...printStyles.header,
    },
    entry: {
      marginBottom: '14px',
      paddingLeft: '12px',
      borderLeft: `3px solid ${colors.navy100}`,
      ...printStyles.entry,
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    entryTitle: {
      fontWeight: '700',
      fontSize: '14px',
      color: colors.gray900,
    },
    entryCompany: {
      fontWeight: '600',
      color: colors.navy800,
      fontSize: '13px',
    },
    entryLocation: {
      color: colors.gray600,
      fontSize: '12px',
    },
    entryDate: {
      color: colors.gray600,
      fontSize: '11px',
      fontWeight: '600',
      backgroundColor: colors.gray100,
      padding: '2px 8px',
      borderRadius: '4px',
    },
    list: {
      paddingLeft: '16px',
      margin: '8px 0 0 0',
      fontSize: '12px',
      color: colors.gray700,
    },
    listItem: {
      marginBottom: '3px',
    },
    skillsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      fontSize: '12px',
    },
    skillCategory: {
      marginBottom: '6px',
    },
    link: {
      color: colors.navy800,
      textDecoration: 'none',
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        <div style={styles.contactGrid}>
          {personalInfo.email && <span>✉ {personalInfo.email}</span>}
          {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
          {personalInfo.location && <span>📍 {personalInfo.location}</span>}
          {personalInfo.linkedin && <a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github} style={styles.link}>GitHub</a>}
          {personalInfo.portfolio && <a href={personalInfo.portfolio} style={styles.link}>Portfolio</a>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Executive Summary</h2>
          <p style={{ margin: 0, fontSize: '13px', color: colors.gray700, lineHeight: '1.6' }}>{personalInfo.summary}</p>
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
                  <div style={styles.entryCompany}>{exp.company}</div>
                  {exp.location && <div style={styles.entryLocation}>{exp.location}</div>}
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
                  <div style={styles.entryCompany}>{edu.institution}</div>
                  {edu.location && <div style={styles.entryLocation}>{edu.location}</div>}
                  {edu.gpa && <div style={{ fontSize: '11px', color: colors.gray600, marginTop: '2px' }}>GPA: {edu.gpa}</div>}
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
          <h2 style={styles.sectionTitle}>Key Projects</h2>
          {projects.map((proj, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{proj.name}</div>
                  {proj.technologies && <div style={{ fontSize: '11px', color: colors.gray600 }}>{proj.technologies}</div>}
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
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Core Competencies</h2>
          <div style={styles.skillsGrid}>
            {skills.technical.length > 0 && (
              <div style={styles.skillCategory}>
                <strong style={{ color: colors.navy800 }}>Technical:</strong>
                <div style={{ color: colors.gray700, marginTop: '2px' }}>{skills.technical.join(' • ')}</div>
              </div>
            )}
            {skills.soft.length > 0 && (
              <div style={styles.skillCategory}>
                <strong style={{ color: colors.navy800 }}>Leadership:</strong>
                <div style={{ color: colors.gray700, marginTop: '2px' }}>{skills.soft.join(' • ')}</div>
              </div>
            )}
          </div>
          {skills.languages.length > 0 && (
            <div style={{ ...styles.skillCategory, marginTop: '8px' }}>
              <strong style={{ color: colors.navy800 }}>Languages:</strong> {skills.languages.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Awards & Certifications</h2>
          <ul style={{ ...styles.list, paddingLeft: '16px' }}>
            {achievements.map((achievement, index) => (
              <li key={index} style={styles.listItem}>
                <strong>{achievement.title}</strong>{achievement.date && ` — ${achievement.date}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ExecutiveTemplate
