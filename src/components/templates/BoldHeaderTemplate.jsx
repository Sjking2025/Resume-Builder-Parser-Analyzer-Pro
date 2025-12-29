import React from 'react'
import { colors, printStyles, getFontSize, getLineHeight } from './PrintStyles'

// Uses Source Sans Pro from Google Fonts - clean, professional, highly readable
const BoldHeaderTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume

  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)

  const accentColors = {
    blue: { primary: '#2563eb', dark: '#1d4ed8', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' },
    purple: { primary: '#7c3aed', dark: '#6d28d9', gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)' },
    green: { primary: '#059669', dark: '#047857', gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
  }
  const accent = accentColors[formatting.colorScheme] || accentColors.blue

  const styles = {
    container: {
      fontFamily: "'Source Sans Pro', 'Segoe UI', Arial, sans-serif",
      fontSize: fontSize.base,
      lineHeight,
      color: colors.gray800,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
    },
    header: {
      background: accent.gradient,
      color: colors.white,
      padding: '32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    nameSection: {
      flex: '1',
    },
    name: {
      fontSize: '32px',
      fontWeight: '700',
      color: colors.white,
      marginBottom: '8px',
      letterSpacing: '1px',
    },
    summary: {
      fontSize: '12px',
      color: colors.gray200,
      lineHeight: '1.5',
      maxWidth: '400px',
    },
    contactSection: {
      textAlign: 'right',
      fontSize: '11px',
      color: colors.gray200,
    },
    contactItem: {
      marginBottom: '4px',
    },
    body: {
      display: 'flex',
    },
    sidebar: {
      width: '30%',
      backgroundColor: colors.gray50,
      padding: '24px 20px',
      borderRight: `1px solid ${colors.gray200}`,
    },
    main: {
      width: '70%',
      padding: '24px',
    },
    sideSection: {
      marginBottom: '20px',
      ...printStyles.section,
    },
    sideTitle: {
      fontSize: '11px',
      fontWeight: '700',
      color: accent.dark,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '10px',
      paddingBottom: '4px',
      borderBottom: `2px solid ${accent.primary}`,
      ...printStyles.header,
    },
    mainSection: {
      marginBottom: '20px',
      ...printStyles.section,
    },
    mainTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: accent.dark,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '12px',
      paddingLeft: '12px',
      borderLeft: `3px solid ${accent.primary}`,
      ...printStyles.header,
    },
    entry: {
      marginBottom: '14px',
      ...printStyles.entry,
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '4px',
    },
    entryTitle: {
      fontWeight: '700',
      fontSize: '13px',
      color: colors.gray900,
    },
    entryCompany: {
      color: accent.primary,
      fontSize: '12px',
      fontWeight: '600',
    },
    entryDate: {
      color: colors.white,
      backgroundColor: accent.primary,
      fontSize: '10px',
      padding: '2px 8px',
      borderRadius: '10px',
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
    skillChip: {
      display: 'inline-block',
      backgroundColor: colors.white,
      border: `1px solid ${colors.gray300}`,
      color: colors.gray700,
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '10px',
      marginRight: '4px',
      marginBottom: '4px',
    },
    link: {
      color: colors.gray200,
      textDecoration: 'none',
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Bold Header */}
      <div style={styles.header}>
        <div style={styles.nameSection}>
          <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
          {personalInfo.summary && (
            <p style={styles.summary}>{personalInfo.summary}</p>
          )}
        </div>
        <div style={styles.contactSection}>
          {personalInfo.email && <div style={styles.contactItem}>✉️ {personalInfo.email}</div>}
          {personalInfo.phone && <div style={styles.contactItem}>📞 {personalInfo.phone}</div>}
          {personalInfo.location && <div style={styles.contactItem}>📍 {personalInfo.location}</div>}
          {personalInfo.linkedin && <div style={styles.contactItem}><a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a></div>}
          {personalInfo.github && <div style={styles.contactItem}><a href={personalInfo.github} style={styles.link}>GitHub</a></div>}
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Education */}
          {education.length > 0 && (
            <div style={styles.sideSection}>
              <h2 style={styles.sideTitle}>Education</h2>
              {education.map((edu, idx) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: '600', fontSize: '12px', color: colors.gray900 }}>{edu.degree}</div>
                  <div style={{ fontSize: '11px', color: colors.gray600 }}>{edu.institution}</div>
                  <div style={{ fontSize: '10px', color: colors.gray500 }}>{edu.graduationDate}</div>
                  {edu.gpa && <div style={{ fontSize: '10px', color: accent.primary }}>GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.technical.length > 0 && (
            <div style={styles.sideSection}>
              <h2 style={styles.sideTitle}>Skills</h2>
              {skills.technical.map((skill, idx) => (
                <span key={idx} style={styles.skillChip}>{skill}</span>
              ))}
            </div>
          )}

          {/* Soft Skills */}
          {skills.soft.length > 0 && (
            <div style={styles.sideSection}>
              <h2 style={styles.sideTitle}>Strengths</h2>
              {skills.soft.map((skill, idx) => (
                <div key={idx} style={{ fontSize: '11px', color: colors.gray600, marginBottom: '4px' }}>✓ {skill}</div>
              ))}
            </div>
          )}

          {/* Languages */}
          {skills.languages.length > 0 && (
            <div style={styles.sideSection}>
              <h2 style={styles.sideTitle}>Languages</h2>
              {skills.languages.map((lang, idx) => (
                <div key={idx} style={{ fontSize: '11px', color: colors.gray600, marginBottom: '4px' }}>• {lang}</div>
              ))}
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div style={styles.sideSection}>
              <h2 style={styles.sideTitle}>Awards</h2>
              {achievements.map((ach, idx) => (
                <div key={idx} style={{ fontSize: '11px', color: colors.gray600, marginBottom: '6px' }}>
                  🏆 {ach.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={styles.main}>
          {/* Experience */}
          {experience.length > 0 && (
            <div style={styles.mainSection}>
              <h2 style={styles.mainTitle}>Professional Experience</h2>
              {experience.map((exp, idx) => (
                <div key={idx} style={styles.entry}>
                  <div style={styles.entryHeader}>
                    <div>
                      <div style={styles.entryTitle}>{exp.title}</div>
                      <div style={styles.entryCompany}>{exp.company}{exp.location && ` • ${exp.location}`}</div>
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

          {/* Projects */}
          {projects.length > 0 && (
            <div style={styles.mainSection}>
              <h2 style={styles.mainTitle}>Projects</h2>
              {projects.map((proj, idx) => (
                <div key={idx} style={styles.entry}>
                  <div style={styles.entryHeader}>
                    <div>
                      <div style={styles.entryTitle}>{proj.name}</div>
                      {proj.technologies && <div style={{ fontSize: '10px', color: colors.gray500 }}>{proj.technologies}</div>}
                    </div>
                    {proj.link && <a href={proj.link} style={{ color: accent.primary, fontSize: '10px', textDecoration: 'none' }}>View →</a>}
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
        </div>
      </div>
    </div>
  )
}

export default BoldHeaderTemplate
