import React, { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import useResumeStore from '../../store/useResumeStore'
// Existing templates
import ATSTemplate from '../templates/ATSTemplate'
import ModernTemplate from '../templates/ModernTemplate'
// Single-column templates
import ClassicTemplate from '../templates/ClassicTemplate'
import ExecutiveTemplate from '../templates/ExecutiveTemplate'
import MinimalTemplate from '../templates/MinimalTemplate'
import CompactTemplate from '../templates/CompactTemplate'
import CreativeTemplate from '../templates/CreativeTemplate'
import CorporateTemplate from '../templates/CorporateTemplate'
import AcademicTemplate from '../templates/AcademicTemplate'
import TechnicalTemplate from '../templates/TechnicalTemplate'
import ElegantTemplate from '../templates/ElegantTemplate'
import ProfessionalTemplate from '../templates/ProfessionalTemplate'
// Sidebar/Split layout templates
import SidebarTemplate from '../templates/SidebarTemplate'
import TwoColumnTemplate from '../templates/TwoColumnTemplate'
import ModernSplitTemplate from '../templates/ModernSplitTemplate'
import BoldHeaderTemplate from '../templates/BoldHeaderTemplate'
import CleanGridTemplate from '../templates/CleanGridTemplate'
import BlueAccentTemplate from '../templates/BlueAccentTemplate'
import { FaDownload, FaSpinner } from 'react-icons/fa'

// Template map for easy switching
const templateMap = {
  ats: ATSTemplate,
  modern: ModernTemplate,
  classic: ClassicTemplate,
  executive: ExecutiveTemplate,
  minimal: MinimalTemplate,
  compact: CompactTemplate,
  creative: CreativeTemplate,
  corporate: CorporateTemplate,
  academic: AcademicTemplate,
  technical: TechnicalTemplate,
  elegant: ElegantTemplate,
  professional: ProfessionalTemplate,
  // Sidebar layouts
  sidebar: SidebarTemplate,
  twocolumn: TwoColumnTemplate,
  modernsplit: ModernSplitTemplate,
  boldheader: BoldHeaderTemplate,
  cleangrid: CleanGridTemplate,
  blueaccent: BlueAccentTemplate,
}

const LivePreview = () => {
  const { resume, formatting } = useResumeStore()
  const [isExporting, setIsExporting] = useState(false)
  const resumeRef = useRef(null)

  const handleExportPDF = async () => {
    if (!resumeRef.current) return
    
    setIsExporting(true)

    try {
      const element = resumeRef.current
      
      // Capture the element using html2canvas with scale: 2 for high definition
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      
      // Standard A4 dimensions in mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgHeight = (canvas.height * pdfWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
      heightLeft -= pageHeight

      // Handle multi-page if the resume content spans multiple pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fullName = resume.personalInfo?.fullName || 'Resume'
      const cleanFileName = `${fullName.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`
      
      // Save directly to user's downloads folder as a valid PDF
      pdf.save(cleanFileName)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Get the correct template component
  const Template = templateMap[resume.templateId] || ATSTemplate

  return (
    <div className="h-full flex flex-col">
      {/* Export Controls */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center no-print">
        <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="btn-primary flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <FaSpinner className="animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FaDownload />
              Export PDF
            </>
          )}
        </button>
      </div>

      {/* Resume Preview */}
      <div className="flex-1 overflow-auto bg-gray-100 p-8">
        <div ref={resumeRef} className="animate-fade-in">
          <Template resume={resume} formatting={formatting} />
        </div>
      </div>
    </div>
  )
}

export default LivePreview
