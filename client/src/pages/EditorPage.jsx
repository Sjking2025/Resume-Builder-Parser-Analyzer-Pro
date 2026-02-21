import React, { useState } from 'react'
import useResumeStore from '../store/useResumeStore'
import PersonalInfoForm from '../components/editor/PersonalInfoForm'
import EducationForm from '../components/editor/EducationForm'
import SkillsForm from '../components/editor/SkillsForm'
import ExperienceForm from '../components/editor/ExperienceForm'
import ProjectsForm from '../components/editor/ProjectsForm'
import AchievementsForm from '../components/editor/AchievementsForm'
import LivePreview from '../components/preview/LivePreview'
import ResumeImportModal from '../components/import/ResumeImportModal'
import { FaPalette, FaHome, FaFileUpload } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const EditorPage = () => {
  const { setTemplate, resume, formatting, updateFormatting, isDirty, loadResume } = useResumeStore()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('personal')
  const [showImportModal, setShowImportModal] = useState(false)

  // Handle resume import from parsed PDF
  const handleImport = (parsedData) => {
    // Define empty personal info to ensure we clear data if it's missing in parsed content
    const emptyPersonalInfo = {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
      summary: '',
    }

    loadResume({
      ...resume,
      id: resume.id,
      templateId: resume.templateId, // Keep current template
      personalInfo: parsedData.personalInfo || emptyPersonalInfo,
      education: parsedData.education || [],
      experience: parsedData.experience || [],
      projects: parsedData.projects || [],
      skills: parsedData.skills || { technical: [], soft: [], languages: [] },
      achievements: parsedData.achievements || [],
    })
  }

  const sections = [
    { id: 'personal', name: 'Personal Info', component: PersonalInfoForm },
    { id: 'experience', name: 'Experience', component: ExperienceForm },
    { id: 'education', name: 'Education', component: EducationForm },
    { id: 'projects', name: 'Projects', component: ProjectsForm },
    { id: 'skills', name: 'Skills', component: SkillsForm },
    { id: 'achievements', name: 'Achievements', component: AchievementsForm },
  ]

  // All 12 templates (2 original + 10 new)
  const templates = [
    { id: 'ats', name: 'ATS Friendly', category: 'Standard' },
    { id: 'modern', name: 'Modern', category: 'Standard' },
    { id: 'classic', name: 'Classic', category: 'Traditional' },
    { id: 'executive', name: 'Executive', category: 'Professional' },
    { id: 'minimal', name: 'Minimal', category: 'Clean' },
    { id: 'compact', name: 'Compact', category: 'Dense' },
    { id: 'creative', name: 'Creative', category: 'Modern' },
    { id: 'corporate', name: 'Corporate', category: 'Professional' },
    { id: 'academic', name: 'Academic', category: 'Education' },
    { id: 'technical', name: 'Technical', category: 'Tech' },
    { id: 'elegant', name: 'Elegant', category: 'Premium' },
    { id: 'professional', name: 'Professional', category: 'Universal' },
  ]

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component

  return (
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 no-print" style={{
        background: 'rgba(9, 9, 11, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div className="max-w-screen-2xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gradient-forge" style={{ fontFamily: 'var(--font-family-display)', letterSpacing: '-0.02em' }}>
                Resume Builder
              </h1>
              {isDirty && (
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  background: 'rgba(234,179,8,0.1)',
                  color: '#eab308',
                  border: '1px solid rgba(234,179,8,0.15)',
                }}>
                  Unsaved Changes
                </span>
              )}
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: 'rgba(6,182,212,0.08)',
                  color: '#06b6d4',
                  border: '1px solid rgba(6,182,212,0.15)',
                  cursor: 'pointer',
                }}
              >
                <FaFileUpload /> Import Resume
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Template Selector */}
              <div className="flex items-center gap-2">
                <FaPalette style={{ color: '#71717a' }} />
                <select
                  value={resume.templateId}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="input-field text-sm py-1.5 min-w-[180px]"
                >
                  <optgroup label="Standard">
                    <option value="ats">ATS Friendly</option>
                    <option value="modern">Modern</option>
                  </optgroup>
                  <optgroup label="Traditional">
                    <option value="classic">Classic (Serif)</option>
                    <option value="elegant">Elegant</option>
                  </optgroup>
                  <optgroup label="Professional">
                    <option value="executive">Executive</option>
                    <option value="corporate">Corporate</option>
                    <option value="professional">Professional</option>
                  </optgroup>
                  <optgroup label="Modern">
                    <option value="minimal">Minimal</option>
                    <option value="creative">Creative</option>
                  </optgroup>
                  <optgroup label="Specialized">
                    <option value="technical">Technical</option>
                    <option value="academic">Academic</option>
                    <option value="compact">Compact</option>
                  </optgroup>
                  <optgroup label="Sidebar Layouts">
                    <option value="sidebar">Sidebar (Split)</option>
                    <option value="twocolumn">Two Column</option>
                    <option value="modernsplit">Modern Split</option>
                    <option value="boldheader">Bold Header</option>
                    <option value="cleangrid">Clean Grid (2:1)</option>
                    <option value="blueaccent">Blue Accent</option>
                  </optgroup>
                </select>
              </div>

              {/* Font Size */}
              <select
                value={formatting.fontSize}
                onChange={(e) => updateFormatting({ fontSize: e.target.value })}
                className="input-field text-sm py-1.5"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>

              {/* Line Spacing */}
              <select
                value={formatting.lineSpacing}
                onChange={(e) => updateFormatting({ lineSpacing: e.target.value })}
                className="input-field text-sm py-1.5"
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="relaxed">Relaxed</option>
              </select>

              {/* Color Scheme (for templates that support it) */}
              <select
                value={formatting.colorScheme}
                onChange={(e) => updateFormatting({ colorScheme: e.target.value })}
                className="input-field text-sm py-1.5"
              >
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="green">Green</option>
              </select>
              
              {/* Export Mode */}
              <select
                value={formatting.exportMode || 'digital'}
                onChange={(e) => updateFormatting({ exportMode: e.target.value })}
                className="input-field text-sm py-1.5"
                title="Digital: Shows URLs for AI analysis | Print: Shows labels only"
              >
                <option value="digital">Digital/ATS</option>
                <option value="print">Print Copy</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Editor */}
          <div className="flex flex-col h-full">
            {/* Section Tabs */}
            <div className="rounded-xl p-2 mb-4 flex flex-wrap gap-2" style={{
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  style={{
                    background: activeSection === section.id ? 'rgba(249,115,22,0.12)' : 'transparent',
                    color: activeSection === section.id ? '#f97316' : '#71717a',
                    border: activeSection === section.id ? '1px solid rgba(249,115,22,0.2)' : '1px solid transparent',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family-display)',
                    fontSize: '0.875rem',
                  }}
                >
                  {section.name}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-auto">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="rounded-xl overflow-hidden h-full" style={{
            background: '#fff',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <LivePreview />
          </div>
        </div>
      </div>

      {/* Resume Import Modal */}
      <ResumeImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  )
}

export default EditorPage
