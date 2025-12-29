import React from 'react'
import { colors, fonts, printStyles, getFontSize, getLineHeight, getMargins } from './PrintStyles'

const CorporateTemplate = ({ resume, formatting }) => {
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
      padding: '0',
    },
    headerBar: {
      backgroundColor: colors.navy800,
      color: colors.white,
      padding: '24px 40px',
      marginBottom: '20px',
    },
    name: {
      fontSize: '26px',
      fontWeight: '700',
      color: colors.white,
      marginBottom: '6px',
    },
    contactRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      fontSize: '11px',
      color: colors.gray200,
    },
    body: {
      padding: '0 40px 40px 40px',
    },
    section: {
      marginBottom: '18px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: '700',
      color: colors.navy800,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      borderBottom: `2px solid ${colors.navy800}`,
      paddingBottom: '4px',
      marginBottom: '12px',
      ...printStyles.header,
    },
    entry: {
      marginBottom: '12px',
      display: 'grid',
      gridTemplateColumns: '120px 1fr',
      gap: '16px',
      ...printStyles.entry,
    },
    entryDate: {
      color: colors.gray500,
      fontSize: '11px',
      textAlign: 'right',
      paddingTop: '2px',
    },
    entryContent: {},
    entryTitle: {
      fontWeight: '700',
      fontSize: '13px',
      color: colors.gray900,
    },
    entryCompany: {
      fontWeight: '600',
      color: colors.navy600,
      fontSize: '12px',
    },
    entryLocation: {
      color: colors.gray500,
      fontSize: '11px',
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
    skillsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '8px',
      fontSize: '11px',
    },
    skillCategory: {
      padding: '8px',
      backgroundColor: colors.gray50,
      borderRadius: '4px',
    },
    skillCategoryTitle: {
      fontWeight: '700',
      color: colors.navy800,
      fontSize: '10px',
      textTransform: 'uppercase',
      marginBottom: '4px',
    },
    link: {
      color: colors.gray200,
      textDecoration: 'none',
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Header Bar */}
      <div style={styles.headerBar}>
        <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        <div style={styles.contactRow}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a>}
          {personalInfo.github && <a href={personalInfo.github} style={styles.link}>GitHub</a>}
        </div>
      </div>

      <div style={styles.body}>
        {/* Summary */}
        {personalInfo.summary && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Professional Profile</h2>
            <p style={{ margin: 0, fontSize: '12px', color: colors.gray700, lineHeight: '1.6' }}>{personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Professional Experience</h2>
            {experience.map((exp, index) => (
              <div key={index} style={styles.entry}>
                <div style={styles.entryDate}>{exp.startDate}<br />–<br />{exp.current ? 'Present' : exp.endDate}</div>
                <div style={styles.entryContent}>
                  <div style={styles.entryTitle}>{exp.title}</div>
                  <div style={styles.entryCompany}>{exp.company}</div>
                  {exp.location && <div style={styles.entryLocation}>{exp.location}</div>}
                  {exp.description && (
                    <ul style={styles.list}>
                      {exp.description.split('\n').filter(Boolean).map((line, i) => (
                        <li key={i} style={styles.listItem}>{line.replace(/^[-•]\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
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
                <div style={styles.entryDate}>{edu.graduationDate}</div>
                <div style={styles.entryContent}>
                  <div style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                  <div style={styles.entryCompany}>{edu.institution}</div>
                  {edu.location && <div style={styles.entryLocation}>{edu.location}</div>}
                  {edu.gpa && <div style={{ fontSize: '11px', color: colors.gray600, marginTop: '2px' }}>GPA: {edu.gpa}</div>}
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
              <div key={index} style={{ ...styles.entry, gridTemplateColumns: '1fr' }}>
                <div style={styles.entryContent}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={styles.entryTitle}>{proj.name}</div>
                    {proj.link && <a href={proj.link} style={{ color: colors.navy600, fontSize: '11px', textDecoration: 'none' }}>View</a>}
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
                  <div style={styles.skillCategoryTitle}>Technical</div>
                  <div style={{ color: colors.gray700 }}>{skills.technical.join(' • ')}</div>
                </div>
              )}
              {skills.soft.length > 0 && (
                <div style={styles.skillCategory}>
                  <div style={styles.skillCategoryTitle}>Professional</div>
                  <div style={{ color: colors.gray700 }}>{skills.soft.join(' • ')}</div>
                </div>
              )}
              {skills.languages.length > 0 && (
                <div style={styles.skillCategory}>
                  <div style={styles.skillCategoryTitle}>Languages</div>
                  <div style={{ color: colors.gray700 }}>{skills.languages.join(' • ')}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Awards & Certifications</h2>
            <ul style={{ ...styles.list, paddingLeft: '16px' }}>
              {achievements.map((achievement, index) => (
                <li key={index} style={styles.listItem}>
                  <strong>{achievement.title}</strong>{achievement.date && ` (${achievement.date})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default CorporateTemplate
