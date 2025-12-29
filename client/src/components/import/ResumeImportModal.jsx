import React, { useState, useCallback } from 'react'
import { FaUpload, FaSpinner, FaCheck, FaTimes, FaFileAlt } from 'react-icons/fa'
import { API_ENDPOINTS } from '../../config/api'

/**
 * ResumeImportModal - Upload and parse existing resume PDF to auto-fill form
 */
const ResumeImportModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [progress, setProgress] = useState(0)

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile)
      setError(null)
    } else {
      setError('Please upload a PDF file')
    }
  }, [])

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please upload a PDF file')
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

  // Parse resume using AI
  const handleParse = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(API_ENDPOINTS.importResume, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || errData.error || 'Failed to parse resume')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setProgress(100)
        // Small delay to show completion before switching view
        setTimeout(() => {
          setParsedData(result.data)
          setIsLoading(false)
        }, 300)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  // Confirm import
  const handleConfirmImport = () => {
    if (parsedData) {
      onImport(parsedData)
      handleClose()
    }
  }

  // Reset and close
  const handleClose = () => {
    setFile(null)
    setError(null)
    setParsedData(null)
    setIsLoading(false)
    setProgress(0)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Import Resume</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!parsedData ? (
            <>
              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
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
                    <button
                      onClick={() => setFile(null)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag & drop your resume PDF here
                    </p>
                    <p className="text-sm text-gray-400 mb-4">or</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
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
                      Parsing Resume...
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      Extract Data
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
                AI will extract your resume data and auto-fill the form fields
              </p>
            </>
          ) : (
            /* Preview Parsed Data */
            <>
              <div className="flex items-center gap-2 mb-4 text-green-600">
                <FaCheck />
                <span className="font-semibold">Resume parsed successfully!</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-auto text-sm">
                <div className="mb-2">
                  <span className="font-semibold">Name:</span>{' '}
                  {parsedData.personalInfo?.fullName || 'Not found'}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Email:</span>{' '}
                  {parsedData.personalInfo?.email || 'Not found'}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Education:</span>{' '}
                  {parsedData.education?.length || 0} entries
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Experience:</span>{' '}
                  {parsedData.experience?.length || 0} entries
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Projects:</span>{' '}
                  {parsedData.projects?.length || 0} entries
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Skills:</span>{' '}
                  {(parsedData.skills?.technical?.length || 0) +
                    (parsedData.skills?.soft?.length || 0)}{' '}
                  total
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setParsedData(null)}
                  className="flex-1 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Try Another
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaCheck />
                  Import to Editor
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeImportModal
