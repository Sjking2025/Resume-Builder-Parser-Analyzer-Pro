import React from 'react'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaGlobe, FaBriefcase, FaGraduationCap, FaCode, FaTrophy } from 'react-icons/fa'

const ModernTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume
  
  // Standard hex colors for PDF compatibility (html2canvas doesn't support oklch)
  const colorSchemes = {
    blue: {
      primary: '#2563eb',
      primaryDark: '#1d4ed8',
      primaryLight: '#eff6ff',
      gradient: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
    },
    purple: {
      primary: '#9333ea',
      primaryDark: '#7e22ce',
      primaryLight: '#faf5ff',
      gradient: 'linear-gradient(135deg, #7e22ce 0%, #9333ea 100%)',
    },
    green: {
      primary: '#16a34a',
      primaryDark: '#15803d',
      primaryLight: '#f0fdf4',
      gradient: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
    },
  }

  const colors = {
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#4b5563',
    textLight: '#6b7280',
    border: '#e5e7eb',
    borderDark: '#d1d5db',
    bgGray: '#f3f4f6',
    white: '#ffffff',
  }

  const scheme = colorSchemes[formatting.colorScheme] || colorSchemes.blue

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
      style={{
        ...baseStyle,
        backgroundColor: colors.white,
        maxWidth: '210mm',
        margin: '0 auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
      }} 
      id="resume-content"
    >
      {/* Header with gradient */}
      <div style={{ background: scheme.gradient, color: colors.white, padding: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', margin: 0 }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', opacity: '0.9' }}>
          {personalInfo.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaEnvelope />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaPhone />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaMapMarkerAlt />
              <span>{personalInfo.location}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
          {personalInfo.linkedin && (
            <a href={personalInfo.linkedin} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.white, textDecoration: 'none' }}>
              <FaLinkedin />
              <span>LinkedIn</span>
            </a>
          )}
          {personalInfo.github && (
            <a href={personalInfo.github} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.white, textDecoration: 'none' }}>
              <FaGithub />
              <span>GitHub</span>
            </a>
          )}
          {personalInfo.portfolio && (
            <a href={personalInfo.portfolio} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.white, textDecoration: 'none' }}>
              <FaGlobe />
              <span>Portfolio</span>
            </a>
          )}
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Summary */}
        {personalInfo.summary && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              backgroundColor: scheme.primaryLight, 
              borderRadius: '8px', 
              padding: '16px', 
              borderLeft: `4px solid ${scheme.primary}` 
            }}>
              <p style={{ color: colors.textSecondary, fontStyle: 'italic', margin: 0 }}>{personalInfo.summary}</p>
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: scheme.primary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBriefcase />
              Experience
            </h2>
            {experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '20px', paddingLeft: '16px', borderLeft: `2px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontWeight: '700', color: colors.text, fontSize: '16px', margin: 0 }}>{exp.title}</h3>
                    <div style={{ color: scheme.primary, fontWeight: '600' }}>{exp.company}</div>
                    {exp.location && <div style={{ color: colors.textMuted, fontSize: '13px' }}>{exp.location}</div>}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: '13px', backgroundColor: colors.bgGray, padding: '4px 12px', borderRadius: '16px' }}>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </div>
                </div>
                {exp.description && (
                  <ul style={{ paddingLeft: '20px', color: colors.textSecondary, margin: '8px 0 0 8px' }}>
                    {exp.description.split('\n').filter(Boolean).map((line, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{line.replace(/^[-•]\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: scheme.primary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaGraduationCap />
              Education
            </h2>
            {education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '16px', paddingLeft: '16px', borderLeft: `2px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontWeight: '700', color: colors.text, margin: 0, fontSize: '15px' }}>
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h3>
                    <div style={{ color: scheme.primary, fontWeight: '600' }}>{edu.institution}</div>
                    {edu.location && <div style={{ color: colors.textMuted, fontSize: '13px' }}>{edu.location}</div>}
                    {edu.gpa && <div style={{ color: colors.textSecondary, fontSize: '13px' }}>GPA: {edu.gpa}</div>}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: '13px', backgroundColor: colors.bgGray, padding: '4px 12px', borderRadius: '16px' }}>
                    {edu.graduationDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: scheme.primary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCode />
              Projects
            </h2>
            {projects.map((proj, index) => (
              <div key={index} style={{ marginBottom: '20px', paddingLeft: '16px', borderLeft: `2px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontWeight: '700', color: colors.text, margin: 0, fontSize: '15px' }}>{proj.name}</h3>
                    {proj.technologies && (
                      <div style={{ color: colors.textMuted, fontStyle: 'italic', fontSize: '13px' }}>{proj.technologies}</div>
                    )}
                  </div>
                  {proj.link && (
                    <a href={proj.link} style={{ color: scheme.primary, textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                      View →
                    </a>
                  )}
                </div>
                {proj.description && (
                  <ul style={{ paddingLeft: '20px', color: colors.textSecondary, margin: '8px 0 0 8px' }}>
                    {proj.description.split('\n').filter(Boolean).map((line, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{line.replace(/^[-•]\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: scheme.primary, marginBottom: '16px' }}>Skills</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {skills.technical.length > 0 && (
                <div>
                  <span style={{ fontWeight: '600', color: colors.text }}>Technical: </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    {skills.technical.map((skill, index) => (
                      <span key={index} style={{ 
                        backgroundColor: scheme.primaryLight, 
                        color: scheme.primary, 
                        padding: '4px 12px', 
                        borderRadius: '16px', 
                        fontSize: '13px', 
                        fontWeight: '500' 
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {skills.soft.length > 0 && (
                <div>
                  <span style={{ fontWeight: '600', color: colors.text }}>Soft Skills: </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    {skills.soft.map((skill, index) => (
                      <span key={index} style={{ 
                        backgroundColor: colors.bgGray, 
                        color: colors.textSecondary, 
                        padding: '4px 12px', 
                        borderRadius: '16px', 
                        fontSize: '13px', 
                        fontWeight: '500' 
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {skills.languages.length > 0 && (
                <div>
                  <span style={{ fontWeight: '600', color: colors.text }}>Languages: </span>
                  <span style={{ color: colors.textSecondary }}>{skills.languages.join(' • ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: scheme.primary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaTrophy />
              Achievements & Certifications
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {achievements.map((achievement, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: scheme.primary, marginTop: '2px' }}>✓</span>
                  <span style={{ color: colors.textSecondary }}>
                    {achievement.title} {achievement.date && <span style={{ color: colors.textLight }}>({achievement.date})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModernTemplate
