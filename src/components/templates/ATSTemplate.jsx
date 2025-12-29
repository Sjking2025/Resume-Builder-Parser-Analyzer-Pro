import React from 'react'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa'

const ATSTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume
  
  // Standard hex colors for PDF compatibility (html2canvas doesn't support oklch)
  const colors = {
    text: '#111827',        // gray-900
    textSecondary: '#374151', // gray-700
    textMuted: '#4b5563',    // gray-600
    border: '#1f2937',       // gray-800
    borderLight: '#d1d5db',  // gray-300
    link: '#2563eb',         // blue-600
    white: '#ffffff',
  }

  const getFontSize = () => {
    const sizes = {
      small: '12px',
      medium: '14px',
      large: '16px',
    }
    return sizes[formatting.fontSize] || sizes.medium
  }

  const getLineHeight = () => {
    const spacing = {
      compact: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
    return spacing[formatting.lineSpacing] || spacing.normal
  }

  const baseStyle = {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontSize: getFontSize(),
    lineHeight: getLineHeight(),
    color: colors.text,
  }

  return (
    <div 
      className="resume-page"
      style={{
        ...baseStyle,
        backgroundColor: colors.white,
        maxWidth: '210mm',
        margin: '0 auto',
        padding: '40px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }} 
      id="resume-content"
    >
      {/* Header */}
      <div style={{ borderBottom: `2px solid ${colors.border}`, paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.text, marginBottom: '8px', margin: 0 }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: colors.textSecondary }}>
          {personalInfo.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaEnvelope style={{ color: colors.textMuted }} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaPhone style={{ color: colors.textMuted }} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaMapMarkerAlt style={{ color: colors.textMuted }} />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaLinkedin style={{ color: colors.textMuted }} />
              <a href={personalInfo.linkedin} style={{ color: colors.link, textDecoration: 'none' }}>LinkedIn</a>
            </div>
          )}
          {personalInfo.github && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaGithub style={{ color: colors.textMuted }} />
              <a href={personalInfo.github} style={{ color: colors.link, textDecoration: 'none' }}>GitHub</a>
            </div>
          )}
          {personalInfo.portfolio && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaGlobe style={{ color: colors.textMuted }} />
              <a href={personalInfo.portfolio} style={{ color: colors.link, textDecoration: 'none' }}>Portfolio</a>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="section" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '6px', textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Professional Summary
          </h2>
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: '13px' }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="section" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '10px', textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Experience
          </h2>
          {experience.map((exp, index) => (
            <div key={index} className="entry" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                <div>
                  <h3 style={{ fontWeight: '700', color: colors.text, margin: 0, fontSize: '14px' }}>{exp.title}</h3>
                  <div style={{ color: colors.textSecondary, fontSize: '13px' }}>{exp.company} {exp.location && `• ${exp.location}`}</div>
                </div>
                <div style={{ color: colors.textMuted, textAlign: 'right', fontSize: '12px' }}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </div>
              </div>
              {exp.description && (
                <ul style={{ paddingLeft: '18px', color: colors.textSecondary, margin: '4px 0 0 0', fontSize: '12px' }}>
                  {exp.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{line.replace(/^[-•]\s*/, '')}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="section" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '8px', textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={index} className="entry" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontWeight: '700', color: colors.text, margin: 0, fontSize: '14px' }}>
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </h3>
                  <div style={{ color: colors.textSecondary, fontSize: '13px' }}>{edu.institution} {edu.location && `• ${edu.location}`}</div>
                  {edu.gpa && <div style={{ color: colors.textMuted, fontSize: '12px' }}>GPA: {edu.gpa}</div>}
                </div>
                <div style={{ color: colors.textMuted, textAlign: 'right', fontSize: '12px' }}>
                  {edu.graduationDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="section" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '8px', textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Projects
          </h2>
          {projects.map((proj, index) => (
            <div key={index} className="entry" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                <div>
                  <h3 style={{ fontWeight: '700', color: colors.text, margin: 0, fontSize: '14px' }}>{proj.name}</h3>
                  {proj.technologies && (
                    <div style={{ color: colors.textMuted, fontStyle: 'italic', fontSize: '12px' }}>{proj.technologies}</div>
                  )}
                </div>
                {proj.link && (
                  <a href={proj.link} style={{ color: colors.link, textDecoration: 'none', fontSize: '12px' }}>View Project</a>
                )}
              </div>
              {proj.description && (
                <ul style={{ paddingLeft: '18px', color: colors.textSecondary, margin: '4px 0 0 0', fontSize: '12px' }}>
                  {proj.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{line.replace(/^[-•]\s*/, '')}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <div className="section" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '8px', textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Skills
          </h2>
          {skills.technical.length > 0 && (
            <div style={{ marginBottom: '4px', fontSize: '13px' }}>
              <span style={{ fontWeight: '600', color: colors.text }}>Technical: </span>
              <span style={{ color: colors.textSecondary }}>{skills.technical.join(' • ')}</span>
            </div>
          )}
          {skills.soft.length > 0 && (
            <div style={{ marginBottom: '4px', fontSize: '13px' }}>
              <span style={{ fontWeight: '600', color: colors.text }}>Soft Skills: </span>
              <span style={{ color: colors.textSecondary }}>{skills.soft.join(' • ')}</span>
            </div>
          )}
          {skills.languages.length > 0 && (
            <div style={{ marginBottom: '4px', fontSize: '13px' }}>
              <span style={{ fontWeight: '600', color: colors.text }}>Languages: </span>
              <span style={{ color: colors.textSecondary }}>{skills.languages.join(' • ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="section" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '8px', textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Achievements & Certifications
          </h2>
          <ul style={{ paddingLeft: '18px', color: colors.textSecondary, margin: 0, fontSize: '13px' }}>
            {achievements.map((achievement, index) => (
              <li key={index} style={{ marginBottom: '2px' }}>
                {achievement.title} {achievement.date && `(${achievement.date})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ATSTemplate
