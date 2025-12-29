import React from 'react'
import { colors, printStyles, getFontSize, getLineHeight } from './PrintStyles'

// Uses Roboto from Google Fonts - clean, modern, professional
const SidebarTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume

  const fontSize = getFontSize(formatting.fontSize)
  const lineHeight = getLineHeight(formatting.lineSpacing)

  const accentColors = {
    blue: { primary: '#1e40af', light: '#dbeafe', bg: '#1e3a5f' },
    purple: { primary: '#6b21a8', light: '#f3e8ff', bg: '#4c1d95' },
    green: { primary: '#166534', light: '#dcfce7', bg: '#14532d' },
  }
  const accent = accentColors[formatting.colorScheme] || accentColors.blue

  const styles = {
    container: {
      fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif",
      fontSize: fontSize.base,
      lineHeight,
      color: colors.gray800,
      backgroundColor: colors.white,
      maxWidth: '210mm',
      margin: '0 auto',
      display: 'flex',
      minHeight: '297mm',
    },
    sidebar: {
      width: '35%',
      backgroundColor: accent.bg,
      color: colors.white,
      padding: '28px 20px',
    },
    main: {
      width: '65%',
      padding: '28px 24px',
      backgroundColor: colors.white,
    },
    name: {
      fontSize: '22px',
      fontWeight: '700',
      color: colors.white,
      marginBottom: '4px',
      letterSpacing: '0.5px',
    },
    contactItem: {
      fontSize: '11px',
      color: colors.gray200,
      marginBottom: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    sidebarSection: {
      marginBottom: '20px',
      ...printStyles.section,
    },
    sidebarTitle: {
      fontSize: '11px',
      fontWeight: '700',
      color: accent.light,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom: '10px',
      paddingBottom: '4px',
      borderBottom: `1px solid ${accent.light}40`,
      ...printStyles.header,
    },
    mainSection: {
      marginBottom: '18px',
      ...printStyles.section,
    },
    mainTitle: {
      fontSize: '13px',
      fontWeight: '700',
      color: accent.primary,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '10px',
      paddingBottom: '4px',
      borderBottom: `2px solid ${accent.primary}`,
      ...printStyles.header,
    },
    entry: {
      marginBottom: '12px',
      ...printStyles.entry,
    },
    entryTitle: {
      fontWeight: '600',
      fontSize: '13px',
      color: colors.gray900,
    },
    entryCompany: {
      color: accent.primary,
      fontSize: '12px',
      fontWeight: '500',
    },
    entryDate: {
      color: colors.gray500,
      fontSize: '10px',
    },
    list: {
      paddingLeft: '14px',
      margin: '4px 0 0 0',
      fontSize: '11px',
      color: colors.gray600,
    },
    listItem: {
      marginBottom: '2px',
    },
    skillTag: {
      display: 'inline-block',
      backgroundColor: `${colors.white}20`,
      color: colors.white,
      padding: '3px 8px',
      borderRadius: '3px',
      fontSize: '10px',
      marginRight: '4px',
      marginBottom: '4px',
    },
    link: {
      color: colors.gray200,
      textDecoration: 'none',
      fontSize: '10px',
    },
  }

  return (
    <div style={styles.container} className="resume-page">
      {/* Left Sidebar */}
      <div style={styles.sidebar}>
        {/* Name & Contact */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
          <div style={{ marginTop: '12px' }}>
            {personalInfo.email && <div style={styles.contactItem}>✉ {personalInfo.email}</div>}
            {personalInfo.phone && <div style={styles.contactItem}>📞 {personalInfo.phone}</div>}
            {personalInfo.location && <div style={styles.contactItem}>📍 {personalInfo.location}</div>}
            {personalInfo.linkedin && <div style={styles.contactItem}><a href={personalInfo.linkedin} style={styles.link}>LinkedIn</a></div>}
            {personalInfo.github && <div style={styles.contactItem}><a href={personalInfo.github} style={styles.link}>GitHub</a></div>}
            {personalInfo.portfolio && <div style={styles.contactItem}><a href={personalInfo.portfolio} style={styles.link}>Portfolio</a></div>}
          </div>
        </div>

        {/* Skills */}
        {(skills.technical.length > 0 || skills.soft.length > 0) && (
          <div style={styles.sidebarSection}>
            <h2 style={styles.sidebarTitle}>Skills</h2>
            {skills.technical.map((skill, idx) => (
              <span key={idx} style={styles.skillTag}>{skill}</span>
            ))}
            {skills.soft.map((skill, idx) => (
              <span key={`soft-${idx}`} style={{ ...styles.skillTag, backgroundColor: `${accent.light}30` }}>{skill}</span>
            ))}
          </div>
        )}

        {/* Languages */}
        {skills.languages.length > 0 && (
          <div style={styles.sidebarSection}>
            <h2 style={styles.sidebarTitle}>Languages</h2>
            {skills.languages.map((lang, idx) => (
              <div key={idx} style={{ fontSize: '11px', color: colors.gray200, marginBottom: '3px' }}>• {lang}</div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={styles.sidebarSection}>
            <h2 style={styles.sidebarTitle}>Education</h2>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: '600', fontSize: '12px', color: colors.white }}>{edu.degree}</div>
                <div style={{ fontSize: '11px', color: colors.gray300 }}>{edu.institution}</div>
                <div style={{ fontSize: '10px', color: colors.gray400 }}>{edu.graduationDate}{edu.gpa && ` • GPA: ${edu.gpa}`}</div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div style={styles.sidebarSection}>
            <h2 style={styles.sidebarTitle}>Achievements</h2>
            {achievements.map((ach, idx) => (
              <div key={idx} style={{ fontSize: '11px', color: colors.gray200, marginBottom: '4px' }}>
                🏆 {ach.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Summary */}
        {personalInfo.summary && (
          <div style={styles.mainSection}>
            <h2 style={styles.mainTitle}>Profile</h2>
            <p style={{ margin: 0, fontSize: '12px', color: colors.gray600, lineHeight: '1.6' }}>{personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={styles.mainSection}>
            <h2 style={styles.mainTitle}>Experience</h2>
            {experience.map((exp, idx) => (
              <div key={idx} style={styles.entry}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={styles.entryTitle}>{proj.name}</div>
                  {proj.link && <a href={proj.link} style={{ color: accent.primary, fontSize: '10px', textDecoration: 'none' }}>View →</a>}
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

export default SidebarTemplate
