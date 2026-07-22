import React, { useState } from 'react'
import useResumeStore from '../store/useResumeStore'
import PersonalInfoForm from '../components/editor/PersonalInfoForm'
import EducationForm from '../components/editor/EducationForm'
import SkillsForm from '../components/editor/SkillsForm'
import ExperienceForm from '../components/editor/ExperienceForm'
import ProjectsForm from '../components/editor/ProjectsForm'
import AchievementsForm from '../components/editor/AchievementsForm'
import GenericSectionForm from '../components/editor/GenericSectionForm'
import CustomSectionForm from '../components/editor/CustomSectionForm'
import LivePreview from '../components/preview/LivePreview'
import ResumeImportModal from '../components/import/ResumeImportModal'
import { FaPalette, FaHome, FaFileUpload, FaExchangeAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { CV_SECTION_LABELS, CV_SECTION_KEYS } from '../store/useResumeStore'

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
      // Ensure CV sections are retained if present
      documentType: parsedData.documentType || 'resume',
      ...CV_SECTION_KEYS.reduce((acc, key) => ({ ...acc, [key]: parsedData[key] || [] }), {}),
      customSections: parsedData.customSections || [],
    })
  }

  // Base resume sections
  const baseSections = [
    { id: 'personal', name: 'Personal Info', component: PersonalInfoForm },
    { id: 'experience', name: 'Experience', component: ExperienceForm },
    { id: 'education', name: 'Education', component: EducationForm },
    { id: 'projects', name: 'Projects', component: ProjectsForm },
    { id: 'skills', name: 'Skills', component: SkillsForm },
    { id: 'achievements', name: 'Achievements', component: AchievementsForm },
  ]

  // Add CV sections dynamically if they have data or if in CV mode
  const cvSections = resume.documentType === 'cv' ? CV_SECTION_KEYS.map(key => ({
    id: key,
    name: CV_SECTION_LABELS[key],
    component: () => <GenericSectionForm sectionKey={key} fields={[
      { name: 'title', label: 'Title / Name', placeholder: 'Enter title' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Details...' },
      { name: 'date', label: 'Date / Year', placeholder: 'e.g. 2024' },
      // Optional fields for certain sections
      ...(key === 'publications' ? [{ name: 'url', label: 'URL / DOI', placeholder: 'https://...' }] : [])
    ]} />
  })) : []

  // Custom sections tab
  const customSectionTab = resume.documentType === 'cv' || (resume.customSections && resume.customSections.length > 0)
    ? [{ id: 'custom', name: 'Custom Sections', component: CustomSectionForm }]
    : []

  const sections = [...baseSections, ...cvSections, ...customSectionTab]

  // All 12 templates (2 original + 10 new)
  const templates = [
    { id: 'ats', name: 'ATS Friendly', category: 'Standard', supportsPhoto: false },
    { id: 'modern', name: 'Modern', category: 'Standard', supportsPhoto: true },
    { id: 'classic', name: 'Classic', category: 'Traditional', supportsPhoto: false },
    { id: 'executive', name: 'Executive', category: 'Professional', supportsPhoto: true },
    { id: 'minimal', name: 'Minimal', category: 'Clean', supportsPhoto: false },
    { id: 'compact', name: 'Compact', category: 'Dense', supportsPhoto: false },
    { id: 'creative', name: 'Creative', category: 'Modern', supportsPhoto: true },
    { id: 'corporate', name: 'Corporate', category: 'Professional', supportsPhoto: true },
    { id: 'academic', name: 'Academic', category: 'Education', supportsPhoto: false },
    { id: 'technical', name: 'Technical', category: 'Tech', supportsPhoto: false },
    { id: 'elegant', name: 'Elegant', category: 'Premium', supportsPhoto: true },
    { id: 'professional', name: 'Professional', category: 'Universal', supportsPhoto: true },
  ]

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2"
              >
                <FaHome /> Home
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Resume Builder
              </h1>
              {isDirty && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  Unsaved Changes
                </span>
              )}
              {resume.documentType === 'cv' && (
                <button
                  onClick={() => navigate('/convert')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                >
                  <FaExchangeAlt /> Convert to Resume
                </button>
              )}
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                <FaFileUpload /> {resume.documentType === 'cv' ? 'Import Document' : 'Import Resume'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Template Selector */}
              <div className="flex items-center gap-2">
                <FaPalette className="text-gray-600" />
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

              {/* Skills Layout */}
              <select
                value={formatting.skillsLayout || 'tags'}
                onChange={(e) => updateFormatting({ skillsLayout: e.target.value })}
                className="input-field text-sm py-1.5"
                title="Format of the skills section"
              >
                <option value="tags">Pill Tags</option>
                <option value="bullets">Bullets</option>
                <option value="comma">Comma Separated</option>
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
            <div className="bg-white rounded-xl shadow-md p-2 mb-4 flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
            <LivePreview />
          </div>
        </div>
      </div>

      {/* Resume Import Modal */}
      <ResumeImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        onNavigateToConversion={(data) => {
          // Pre-load data into store before navigating
          handleImport({ ...data, documentType: 'cv' })
          navigate('/convert')
        }}
      />
    </div>
  )
}

export default EditorPage
