import React, { useState, useRef } from 'react'
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

    // Open window synchronously to avoid popup blocker after async calls
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9fafb;">
            <div style="text-align: center;">
              <h2>Generating PDF...</h2>
              <p style="color: #6b7280;">Please wait while your resume is being prepared.</p>
            </div>
          </body>
        </html>
      `)
    }
    
    try {
      // Get the resume HTML with inline styles
      const resumeHTML = resumeRef.current.innerHTML
      const fullName = resume.personalInfo?.fullName || 'Resume'
      
      const completeHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${fullName} - Resume</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Georgia&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body {
              font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
              font-size: 14px;
              line-height: 1.5;
              color: #111827;
              background: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .resume-wrapper { max-width: 210mm; margin: 0 auto; background: white; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            h1, h2, h3, h4, h5, h6 { page-break-after: avoid; break-after: avoid; }
            .section, [style*="marginBottom"] { page-break-inside: avoid; break-inside: avoid; }
            .entry, [style*="paddingLeft"] { page-break-inside: avoid; break-inside: avoid; }
            @media print {
              @page { size: A4; margin: 8mm 8mm 8mm 8mm; }
              html, body { width: 210mm; min-height: 297mm; }
              .resume-wrapper { width: 100%; max-width: none; margin: 0; padding: 0; }
              [style*="gradient"], [style*="background"] { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              li { page-break-inside: avoid; break-inside: avoid; }
              h2 { page-break-after: avoid; break-after: avoid; margin-top: 0 !important; }
              .page-break { page-break-before: always; }
            }
            @media screen {
              body { padding: 20px; background: #f3f4f6; }
              .resume-wrapper { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            }
          </style>
        </head>
        <body>
          <div class="resume-wrapper">
            ${resumeHTML}
          </div>
        </body>
        </html>
      `

      let pdfDownloaded = false

      // Try backend PDF generation first
      try {
        const { API_ENDPOINTS } = await import('../../config/api')
        const response = await fetch(API_ENDPOINTS.exportPdf, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: completeHtml, filename: `${fullName.replace(/\s+/g, '_')}_Resume.pdf` })
        })

        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/pdf')) {
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${fullName.replace(/\s+/g, '_')}_Resume.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
            pdfDownloaded = true
            
            // Close the helper print window if server PDF download succeeded
            if (printWindow && !printWindow.closed) {
              printWindow.close()
            }
          }
        }
      } catch (backendError) {
        console.warn('Backend PDF generation unavailable, using browser print fallback:', backendError)
      }

      // If backend PDF was not generated, fallback to browser print in the already-opened window
      if (!pdfDownloaded) {
        if (!printWindow || printWindow.closed) {
          alert('Please allow popups to export the PDF.')
          return
        }

        printWindow.document.open()
        printWindow.document.write(completeHtml.replace('</body>', `
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                }, 500);
              };
            </script>
          </body>
        `))
        printWindow.document.close()
      }
      
    } catch (error) {
      console.error('Error exporting PDF:', error)
      if (printWindow && !printWindow.closed) printWindow.close()
      alert('Failed to export PDF. Please try again.')
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
