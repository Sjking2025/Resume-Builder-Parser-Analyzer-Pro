import React from 'react'
import { renderSkillsList } from '../../utils/renderSkills'
import GenericSection from './GenericSection'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa'

const ATSTemplate = ({ resume, formatting }) => {
  const { personalInfo, education, skills, projects, experience, achievements } = resume
  const exportMode = formatting?.exportMode || 'digital'
  
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
      tight: '1.15',
      compact: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
    return spacing[formatting.lineSpacing] || spacing.normal
  }

  const getSpacing = () => {
    const s = formatting.lineSpacing;
    if (s === 'tight') {
      return { headerPadding: '8px', headerMargin: '12px', sectionMargin: '12px', itemMargin: '6px', titleMargin: '4px', listGap: '2px', rootPadding: '24px' };
    } else if (s === 'compact') {
      return { headerPadding: '12px', headerMargin: '16px', sectionMargin: '16px', itemMargin: '8px', titleMargin: '6px', listGap: '2px', rootPadding: '32px' };
    } else if (s === 'relaxed') {
      return { headerPadding: '20px', headerMargin: '32px', sectionMargin: '28px', itemMargin: '16px', titleMargin: '12px', listGap: '6px', rootPadding: '48px' };
    }
    // normal
    return { headerPadding: '16px', headerMargin: '24px', sectionMargin: '20px', itemMargin: '12px', titleMargin: '8px', listGap: '4px', rootPadding: '40px' };
  }
  const spacing = getSpacing();

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
        padding: spacing.rootPadding,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }} 
      id="resume-content"
    >
      {/* Header */}
      <div style={{ borderBottom: `2px solid ${colors.border}`, paddingBottom: spacing.headerPadding, marginBottom: spacing.headerMargin }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.text, marginBottom: spacing.titleMargin, margin: 0 }}>
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
              <a href={personalInfo.linkedin} style={{ color: colors.link, textDecoration: 'none' }}>
                {exportMode === 'digital' ? personalInfo.linkedin : 'LinkedIn'}
              </a>
            </div>
          )}
          {personalInfo.github && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaGithub style={{ color: colors.textMuted }} />
              <a href={personalInfo.github} style={{ color: colors.link, textDecoration: 'none' }}>
                {exportMode === 'digital' ? personalInfo.github : 'GitHub'}
              </a>
            </div>
          )}
          {personalInfo.portfolio && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaGlobe style={{ color: colors.textMuted }} />
              <a href={personalInfo.portfolio} style={{ color: colors.link, textDecoration: 'none' }}>
                {exportMode === 'digital' ? personalInfo.portfolio : 'Portfolio'}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="section" style={{ marginBottom: spacing.sectionMargin }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: spacing.titleMargin, textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Professional Summary
          </h2>
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: '13px' }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="section" style={{ marginBottom: spacing.sectionMargin }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: spacing.titleMargin, textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Experience
          </h2>
          {experience.map((exp, index) => (
            <div key={index} className="entry" style={{ marginBottom: spacing.itemMargin }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.listGap }}>
                <div>
                  <h3 style={{ fontWeight: '700', color: colors.text, margin: 0, fontSize: '14px' }}>{exp.title}</h3>
                  <div style={{ color: colors.textSecondary, fontSize: '13px' }}>{exp.company} {exp.location && `• ${exp.location}`}</div>
                </div>
                <div style={{ color: colors.textMuted, textAlign: 'right', fontSize: '12px' }}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </div>
              </div>
              {exp.description && (
                <ul style={{ paddingLeft: '18px', color: colors.textSecondary, margin: `${spacing.listGap} 0 0 0`, fontSize: '12px' }}>
                  {exp.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} style={{ marginLeft: `${(line.match(/^\s*/)[0].length) * 8}px`, marginBottom: spacing.listGap }}>{line.replace(/^\s*[-•]\s*/, '')}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="section" style={{ marginBottom: spacing.sectionMargin }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: spacing.titleMargin, textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={index} className="entry" style={{ marginBottom: spacing.itemMargin }}>
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
        <div className="section" style={{ marginBottom: spacing.sectionMargin }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: spacing.titleMargin, textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Projects
          </h2>
          {projects.map((proj, index) => (
            <div key={index} className="entry" style={{ marginBottom: spacing.itemMargin }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.listGap }}>
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
                <ul style={{ paddingLeft: '18px', color: colors.textSecondary, margin: `${spacing.listGap} 0 0 0`, fontSize: '12px' }}>
                  {proj.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} style={{ marginLeft: `${(line.match(/^\s*/)[0].length) * 8}px`, marginBottom: spacing.listGap }}>{line.replace(/^\s*[-•]\s*/, '')}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0 || (skills.useCategorizedTechnical && skills.technicalCategories && skills.technicalCategories.some(cat => cat.skills.length > 0))) && (
        <div className="section" style={{ marginBottom: spacing.sectionMargin }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: spacing.titleMargin, textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Skills
          </h2>
          
          {formatting?.skillsLayout === 'compact-categorized' ? (() => {
            const allSkillCategories = [];
            
            if (skills.useCategorizedTechnical && skills.technicalCategories) {
              skills.technicalCategories.forEach(cat => {
                if (cat.skills && cat.skills.length > 0) {
                  allSkillCategories.push({ name: cat.name, skills: cat.skills });
                }
              });
            } else if (skills.technical.length > 0) {
              allSkillCategories.push({ name: 'Technical', skills: skills.technical });
            }
            
            if (skills.includeSoftSkills !== false && skills.soft.length > 0) {
              allSkillCategories.push({ name: 'Soft Skills', skills: skills.soft });
            }
            
            if (skills.languages.length > 0) {
              allSkillCategories.push({ name: 'Languages', skills: skills.languages });
            }
            
            const rows = [];
            for (let i = 0; i < allSkillCategories.length; i += 2) {
              rows.push(allSkillCategories.slice(i, i + 2));
            }
            
            return (
              <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                {rows.map((row, rIdx) => (
                  <div key={`comp-row-${rIdx}`} style={{ display: 'flex', marginBottom: spacing.listGap }}>
                    <div style={{ flex: '1 1 0%', paddingRight: '12px' }}>
                      <span style={{ fontWeight: '600', color: colors.text }}>{row[0].name}: </span>
                      <span style={{ color: colors.textSecondary }}>{row[0].skills.join(', ')}</span>
                    </div>
                    {row[1] && (
                      <div style={{ flex: '1 1 0%', paddingLeft: '12px' }}>
                        <span style={{ fontWeight: '600', color: colors.text }}>{row[1].name}: </span>
                        <span style={{ color: colors.textSecondary }}>{row[1].skills.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })() : (
            <>
              {skills.useCategorizedTechnical && skills.technicalCategories ? (
                skills.technicalCategories.map((cat, idx) => cat.skills && cat.skills.length > 0 && (
                  <div key={`cat-${idx}`} style={{ marginBottom: spacing.listGap, fontSize: '13px' }}>
                    <span style={{ fontWeight: '600', color: colors.text }}>{cat.name}: </span>
                    <span style={{ color: colors.textSecondary }}>{renderSkillsList(cat.skills, formatting?.skillsLayout)}</span>
                  </div>
                ))
              ) : (
                skills.technical.length > 0 && (
                  <div style={{ marginBottom: spacing.listGap, fontSize: '13px' }}>
                    <span style={{ fontWeight: '600', color: colors.text }}>Technical: </span>
                    <span style={{ color: colors.textSecondary }}>{renderSkillsList(skills.technical, formatting?.skillsLayout)}</span>
                  </div>
                )
              )}

              {(skills.includeSoftSkills !== false && skills.soft.length > 0) && (
                <div style={{ marginBottom: spacing.listGap, fontSize: '13px' }}>
                  <span style={{ fontWeight: '600', color: colors.text }}>Soft Skills: </span>
                  <span style={{ color: colors.textSecondary }}>{renderSkillsList(skills.soft, formatting?.skillsLayout)}</span>
                </div>
              )}
              {skills.languages.length > 0 && (
                <div style={{ marginBottom: spacing.listGap, fontSize: '13px' }}>
                  <span style={{ fontWeight: '600', color: colors.text }}>Languages: </span>
                  <span style={{ color: colors.textSecondary }}>{renderSkillsList(skills.languages, formatting?.skillsLayout)}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="section" style={{ marginBottom: spacing.sectionMargin }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: spacing.titleMargin, textTransform: 'uppercase', borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px' }}>
            Achievements & Certifications
          </h2>
          <ul style={{ paddingLeft: '18px', color: colors.textSecondary, margin: 0, fontSize: '13px' }}>
            {achievements.map((achievement, index) => (
              <li key={index} style={{ marginBottom: spacing.listGap }}>
                {achievement.title} {achievement.date && `(${achievement.date})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CV Sections */}
      {resume.documentType === 'cv' && [
        "publications", "research", "certifications", "awards", "patents",
        "conferences", "workshops", "internships", "leadership", "volunteer",
        "interests", "references"
      ].map(key => (
        <GenericSection key={key} title={key} items={resume[key]} />
      ))}

      {/* Custom Sections */}
      {resume.customSections && resume.customSections.map((section, idx) => (
        <GenericSection key={idx} title={section.title} items={section.items} />
      ))}
    </div>
  )
}

export default ATSTemplate
