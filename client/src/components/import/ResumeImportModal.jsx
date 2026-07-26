import React, { useState, useCallback } from 'react'
import { FaUpload, FaSpinner, FaCheck, FaTimes, FaFileAlt, FaMagic, FaExchangeAlt, FaRobot } from 'react-icons/fa'
import { API_ENDPOINTS } from '../../config/api'
import { useAIRequest } from '../../hooks/useAIRequest'
import PreflightIndicator from '../ai/PreflightIndicator'

/**
 * ResumeImportModal - Upload and parse existing resume/CV PDF/DOCX
 */
const ResumeImportModal = ({ isOpen, onClose, onImport, onNavigateToConversion }) => {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const { execute, isLoading, error, setError, cancel, preflightState } = useAIRequest()
  
  const [parsedData, setParsedData] = useState(null)
  const [documentDetection, setDocumentDetection] = useState(null)
  const [progress, setProgress] = useState(0)
  
  // Steps: 'upload' -> 'parsing' -> 'detection' -> 'preview'
  // Conversion config happens on a dedicated page as per Phase 6 of the plan.
  const [step, setStep] = useState('upload')

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }, [])

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    validateAndSetFile(selectedFile)
  }

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const validExtensions = ['.pdf', '.docx']
    const isDocx = selectedFile.name.toLowerCase().endsWith('.docx')
    const isPdf = selectedFile.name.toLowerCase().endsWith('.pdf')
    
    if (validTypes.includes(selectedFile.type) || isDocx || isPdf) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please upload a PDF or DOCX file')
    }
  }

  // Simulate progress during parsing
  React.useEffect(() => {
    let interval
    if (isLoading) {
      setProgress(10)
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 5 // Slow increment
        })
      }, 400)
    } else {
      setProgress(0)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  // Parse document using AI
  const handleParse = async () => {
    if (!file) return

    setError(null)
    setStep('parsing')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await execute(API_ENDPOINTS.importDocument, {
        method: 'POST',
        body: formData
      })
      
      if (result && result.success && result.data) {
        setProgress(100)
        setTimeout(() => {
          setParsedData(result.data)
          setDocumentDetection(result.documentDetection || { type: 'resume', confidence: 100 })
          setStep('detection')
        }, 300)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Import error:', err)
      // Error is automatically set by useAIRequest
      setStep('upload')
    }
  }

  // Edit directly
  const handleEditDirectly = () => {
    if (parsedData) {
      // Mark document type based on selection if confidence was low and they picked
      const dataToImport = { ...parsedData, documentType: documentDetection.type }
      onImport(dataToImport)
      handleClose()
    }
  }
  
  // Go to convert CV page
  const handleConvertToResume = () => {
    if (parsedData && onNavigateToConversion) {
      onNavigateToConversion(parsedData)
      handleClose()
    }
  }

  // Reset and close
  const handleClose = () => {
    cancel()
    setFile(null)
    setParsedData(null)
    setDocumentDetection(null)
    setError(null)
    setStep('upload')
    setProgress(0)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <PreflightIndicator preflightState={preflightState} />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {step === 'upload' ? 'Import Document' : step === 'parsing' ? 'Extracting...' : 'Review Document'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' || step === 'parsing' ? (
            <>
              {/* Upload Area */}
              <div
                onDrop={step === 'upload' ? handleDrop : undefined}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (step === 'upload') setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-primary-500 bg-primary-50'
                    : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <FaFileAlt className="text-4xl text-green-500" />
                    <p className="font-medium text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    {step === 'upload' && (
                      <button
                        onClick={() => setFile(null)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag & drop your Resume or CV (PDF/DOCX)
                    </p>
                    <p className="text-sm text-gray-400 mb-4">or</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <span className="bg-primary-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-600 transition-colors">
                        Browse Files
                      </span>
                    </label>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Parse Button */}
              <button
                onClick={handleParse}
                disabled={!file || isLoading}
                className={`mt-6 w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                  !file || isLoading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:shadow-lg'
                }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Parsing Document...
                    </>
                  ) : (
                    <>
                      <FaRobot />
                      AI Extract Data
                    </>
                  )}
                </div>
                {/* Progress Bar */}
                {isLoading && (
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                )}
              </button>

              <p className="mt-4 text-xs text-gray-400 text-center">
                AI will detect if this is a CV or Resume and extract all sections
              </p>
            </>
          ) : step === 'detection' ? (
            <>
              {/* Detection Step */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <FaMagic size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {documentDetection?.type === 'cv' ? 'Curriculum Vitae Detected' : 'Resume Detected'}
                </h3>
                <p className="text-gray-600 mt-2">
                  Confidence: <span className="font-semibold text-blue-600">{documentDetection?.confidence}%</span>
                </p>
                
                {documentDetection?.confidence < 75 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                    <p className="text-sm text-yellow-800 font-medium mb-2">We're not entirely sure. Please confirm:</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="docType" checked={documentDetection.type === 'resume'} onChange={() => setDocumentDetection({...documentDetection, type: 'resume'})} />
                        Resume
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="docType" checked={documentDetection.type === 'cv'} onChange={() => setDocumentDetection({...documentDetection, type: 'cv'})} />
                        CV
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Stats */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">Education:</span> <span className="font-semibold">{parsedData?.education?.length || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Experience:</span> <span className="font-semibold">{parsedData?.experience?.length || 0}</span>
                </div>
                {documentDetection?.type === 'cv' && (
                  <>
                    <div>
                      <span className="text-gray-500">Publications:</span> <span className="font-semibold">{parsedData?.publications?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Research:</span> <span className="font-semibold">{parsedData?.research?.length || 0}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {documentDetection?.type === 'cv' ? (
                  <>
                    <button
                      onClick={handleConvertToResume}
                      className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <FaExchangeAlt />
                      Convert CV to Resume (AI)
                    </button>
                    <button
                      onClick={handleEditDirectly}
                      className="w-full py-4 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaCheck />
                      Edit as full CV
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditDirectly}
                    className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <FaCheck />
                    Import to Editor
                  </button>
                )}
                
                <button
                  onClick={() => setStep('upload')}
                  className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Try a different file
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
    </>
  )
}

export default ResumeImportModal
