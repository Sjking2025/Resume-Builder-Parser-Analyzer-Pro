import React from 'react'
import { colors, fonts, printStyles, getFontSize, getLineHeight, getMargins } from './PrintStyles'

const ProfessionalTemplate = ({ resume, formatting }) => {
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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: `2px solid ${colors.blue600}`,
    },
    nameSection: {},
    name: {
      fontSize: '26px',
      fontWeight: '700',
      color: colors.gray900,
      marginBottom: '2px',
    },
    location: {
      fontSize: '13px',
      color: colors.gray600,
    },
    contactSection: {
      textAlign: 'right',
      fontSize: '12px',
      color: colors.gray600,
    },
    contactItem: {
      marginBottom: '2px',
    },
    section: {
      marginBottom: '18px',
      ...printStyles.section,
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: colors.blue600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '10px',
      paddingBottom: '4px',
      borderBottom: `1px solid ${colors.gray200}`,
      ...printStyles.header,
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
      fontWeight: '700',
      fontSize: '13px',
      color: colors.gray900,
    },
    entryCompany: {
      color: colors.blue600,
      fontSize: '12px',
      fontWeight: '500',
    },
    entryLocation: {
      color: colors.gray500,
      fontSize: '11px',
    },
    entryDate: {
      color: colors.gray500,
      fontSize: '11px',
      backgroundColor: colors.blue100,
      padding: '2px 8px',
      borderRadius: '4px',
    },
    list: {
      paddingLeft: '16px',
      margin: '6px 0 0 0',
      fontSize: '12px',
      color: colors.gray600,
    },
    listItem: {
      marginBottom: '3px',
    },
    skillsRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginBottom: '8px',
    },
    skillTag: {
      backgroundColor: colors.gray100,
      color: colors.gray700,
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '11px',
    },
    skillTagPrimary: {
      backgroundColor: colors.blue100,
      color: colors.blue600,
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '11px',
    },
    link: {
      color: colors.blue600,
      textDecoration: 'none',
    },
    summaryBox: {
      backgroundColor: colors.gray50,
      padding: '12px 16px',
      borderRadius: '6px',
      borderLeft: `3px solid ${colors.blue600}`,
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.nameSection}>
          <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
          {personalInfo.location && <div style={styles.location}>📍 {personalInfo.location}</div>}
        </div>
        <div style={styles.contactSection}>
          {personalInfo.email && <div style={styles.contactItem}>✉️ {personalInfo.email}</div>}
          {personalInfo.phone && <div style={styles.contactItem}>📞 {personalInfo.phone}</div>}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
            {personalInfo.linkedin && <a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a>}
            {personalInfo.github && <a href={personalInfo.github} style={styles.link}>GitHub</a>}
            {personalInfo.portfolio && <a href={personalInfo.portfolio} style={styles.link}>Portfolio</a>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Professional Summary</h2>
          <div style={styles.summaryBox}>
            <p style={{ margin: 0, fontSize: '12px', color: colors.gray700, lineHeight: '1.6' }}>{personalInfo.summary}</p>
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Work Experience</h2>
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
          <h2 style={styles.sectionTitle}>Projects</h2>
          {projects.map((proj, index) => (
            <div key={index} style={styles.entry}>
              <div style={styles.entryHeader}>
                <div>
                  <div style={styles.entryTitle}>{proj.name}</div>
                  {proj.technologies && <div style={{ fontSize: '11px', color: colors.gray500 }}>{proj.technologies}</div>}
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
          <h2 style={styles.sectionTitle}>Skills</h2>
          {skills.technical.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: colors.gray700, marginBottom: '4px' }}>Technical</div>
              <div style={styles.skillsRow}>
                {skills.technical.map((skill, index) => (
                  <span key={index} style={styles.skillTagPrimary}>{skill}</span>
                ))}
              </div>
            </div>
          )}
          {skills.soft.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: colors.gray700, marginBottom: '4px' }}>Soft Skills</div>
              <div style={styles.skillsRow}>
                {skills.soft.map((skill, index) => (
                  <span key={index} style={styles.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          )}
          {skills.languages.length > 0 && (
            <div style={{ fontSize: '12px', color: colors.gray600 }}>
              <strong>Languages:</strong> {skills.languages.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Certifications & Awards</h2>
          <div style={styles.skillsRow}>
            {achievements.map((achievement, index) => (
              <span key={index} style={{ ...styles.skillTagPrimary, backgroundColor: colors.gold100, color: colors.gold600 }}>
                🏆 {achievement.title}{achievement.date && ` (${achievement.date})`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfessionalTemplate
