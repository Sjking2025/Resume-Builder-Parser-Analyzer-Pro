import React from 'react'
import { colors, printStyles, getFontSize, getLineHeight } from './PrintStyles'

// Uses Montserrat from Google Fonts - modern, geometric, professional
const ModernSplitTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume

  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)

  const accentColors = {
    blue: { primary: '#0ea5e9', dark: '#0284c7', bg: '#f0f9ff' },
    purple: { primary: '#a855f7', dark: '#9333ea', bg: '#faf5ff' },
    green: { primary: '#22c55e', dark: '#16a34a', bg: '#f0fdf4' },
  }
  const accent = accentColors[formatting.colorScheme] || accentColors.blue

  const styles = {
    container: {
      fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif",
      fontSize: fontSize.base,
      lineHeight,
      color: colors.gray800,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
      display: 'flex',
      minHeight: '297mm',
    },
    leftPanel: {
      width: '32%',
      backgroundColor: accent.bg,
      padding: '28px 20px',
      borderRight: `3px solid ${accent.primary}`,
    },
    rightPanel: {
      width: '68%',
      padding: '28px 24px',
    },
    name: {
      fontSize: '20px',
      fontWeight: '800',
      color: colors.gray900,
      marginBottom: '4px',
      lineHeight: '1.2',
    },
    title: {
      fontSize: '11px',
      fontWeight: '500',
      color: accent.dark,
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    contactSection: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: `1px solid ${accent.primary}40`,
    },
    contactItem: {
      fontSize: '10px',
      color: colors.gray600,
      marginBottom: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    leftSection: {
      marginBottom: '18px',
      ...printStyles.section,
    },
    leftTitle: {
      fontSize: '10px',
      fontWeight: '700',
      color: accent.dark,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom: '8px',
      ...printStyles.header,
    },
    rightSection: {
      marginBottom: '20px',
      ...printStyles.section,
    },
    rightTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: colors.gray900,
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: `2px solid ${accent.primary}`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      ...printStyles.header,
    },
    entry: {
      marginBottom: '14px',
      padding: '10px',
      backgroundColor: colors.gray50,
      borderRadius: '6px',
      borderLeft: `3px solid ${accent.primary}`,
      ...printStyles.entry,
    },
    entryTitle: {
      fontWeight: '700',
      fontSize: '13px',
      color: colors.gray900,
    },
    entryCompany: {
      color: accent.dark,
      fontSize: '11px',
      fontWeight: '600',
    },
    entryDate: {
      color: colors.gray500,
      fontSize: '10px',
    },
    list: {
      paddingLeft: '14px',
      margin: '6px 0 0 0',
      fontSize: '11px',
      color: colors.gray600,
    },
    listItem: {
      marginBottom: '2px',
    },
    skillBar: {
      marginBottom: '8px',
    },
    skillName: {
      fontSize: '10px',
      color: colors.gray700,
      marginBottom: '2px',
    },
    skillBarBg: {
      height: '4px',
      backgroundColor: colors.gray200,
      borderRadius: '2px',
    },
    skillBarFill: {
      height: '100%',
      backgroundColor: accent.primary,
      borderRadius: '2px',
    },
    link: {
      color: accent.dark,
      textDecoration: 'none',
      fontSize: '10px',
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        {/* Name */}
        <div>
          <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        </div>

        {/* Contact */}
        <div style={styles.contactSection}>
          {personalInfo.email && <div style={styles.contactItem}>✉️ {personalInfo.email}</div>}
          {personalInfo.phone && <div style={styles.contactItem}>📞 {personalInfo.phone}</div>}
          {personalInfo.location && <div style={styles.contactItem}>📍 {personalInfo.location}</div>}
          {personalInfo.linkedin && <div style={styles.contactItem}><a href={personalInfo.linkedin} style={styles.link}>🔗 LinkedIn</a></div>}
          {personalInfo.github && <div style={styles.contactItem}><a href={personalInfo.github} style={styles.link}>💻 GitHub</a></div>}
        </div>

        {/* Skills with visual bars */}
        {skills.technical.length > 0 && (
          <div style={{ ...styles.leftSection, marginTop: '20px' }}>
            <h2 style={styles.leftTitle}>Technical Skills</h2>
            {skills.technical.slice(0, 8).map((skill, idx) => (
              <div key={idx} style={styles.skillBar}>
                <div style={styles.skillName}>{skill}</div>
                <div style={styles.skillBarBg}>
                  <div style={{ ...styles.skillBarFill, width: `${85 - (idx * 5)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Soft Skills */}
        {skills.soft.length > 0 && (
          <div style={styles.leftSection}>
            <h2 style={styles.leftTitle}>Soft Skills</h2>
            {skills.soft.map((skill, idx) => (
              <div key={idx} style={{ fontSize: '10px', color: colors.gray600, marginBottom: '4px' }}>• {skill}</div>
            ))}
          </div>
        )}

        {/* Languages */}
        {skills.languages.length > 0 && (
          <div style={styles.leftSection}>
            <h2 style={styles.leftTitle}>Languages</h2>
            {skills.languages.map((lang, idx) => (
              <div key={idx} style={{ fontSize: '10px', color: colors.gray600, marginBottom: '4px' }}>• {lang}</div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div style={styles.leftSection}>
            <h2 style={styles.leftTitle}>Achievements</h2>
            {achievements.map((ach, idx) => (
              <div key={idx} style={{ fontSize: '10px', color: colors.gray600, marginBottom: '6px' }}>
                🏆 {ach.title}
                {ach.date && <div style={{ fontSize: '9px', color: colors.gray400 }}>{ach.date}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        {/* Summary */}
        {personalInfo.summary && (
          <div style={styles.rightSection}>
            <h2 style={styles.rightTitle}>Profile Summary</h2>
            <p style={{ margin: 0, fontSize: '12px', color: colors.gray600, lineHeight: '1.6' }}>{personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={styles.rightSection}>
            <h2 style={styles.rightTitle}>Work Experience</h2>
            {experience.map((exp, idx) => (
              <div key={idx} style={styles.entry}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={styles.entryTitle}>{exp.title}</div>
                    <div style={styles.entryCompany}>{exp.company}</div>
                  </div>
                  <div style={styles.entryDate}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
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
          <div style={styles.rightSection}>
            <h2 style={styles.rightTitle}>Education</h2>
            {education.map((edu, idx) => (
              <div key={idx} style={styles.entry}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                    <div style={styles.entryCompany}>{edu.institution}</div>
                  </div>
                  <div style={styles.entryDate}>{edu.graduationDate}{edu.gpa && ` | GPA: ${edu.gpa}`}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={styles.rightSection}>
            <h2 style={styles.rightTitle}>Projects</h2>
            {projects.map((proj, idx) => (
              <div key={idx} style={styles.entry}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={styles.entryTitle}>{proj.name}</div>
                  {proj.link && <a href={proj.link} style={styles.link}>View →</a>}
                </div>
                {proj.technologies && <div style={{ fontSize: '10px', color: colors.gray500 }}>{proj.technologies}</div>}
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
  )
}

export default ModernSplitTemplate
