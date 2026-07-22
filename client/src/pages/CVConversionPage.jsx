import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useResumeStore from '../store/useResumeStore'
import { FaExchangeAlt, FaSpinner, FaArrowLeft, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import { API_ENDPOINTS, apiFetch } from '../config/api'

const CVConversionPage = () => {
  const navigate = useNavigate()
  const { resume, loadResume } = useResumeStore()
  
  const [config, setConfig] = useState({
    targetPages: 1,
    style: 'standard',
    experienceLevel: 'mid',
    industry: ''
  })
  
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState(null)
  
  // If no resume in store, go back
  if (!resume || !resume.personalInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <FaExclamationTriangle className="text-5xl text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No CV Data Found</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Please upload a CV first from the editor or home page before attempting conversion.
        </p>
        <button
          onClick={() => navigate('/editor')}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Go to Editor
        </button>
      </div>
    )
  }

  const handleConvert = async () => {
    setIsConverting(true)
    setError(null)
    
    try {
      const response = await apiFetch(API_ENDPOINTS.convertCvToResume, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cv_data: resume,
          config: config
        })
      })
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || errData.error || 'Failed to convert CV')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // Load the new resume data and navigate to editor
        loadResume({
          ...result.data,
          id: resume.id,
          templateId: resume.templateId,
          documentType: 'resume' // Ensure it's now marked as resume
        })
        navigate('/editor')
      } else {
        throw new Error(result.error || 'Conversion returned unsuccessful status')
      }
    } catch (err) {
      setError(err.message)
      setIsConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/editor')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium transition-colors"
        >
          <FaArrowLeft /> Back to Editor
        </button>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FaExchangeAlt /> AI CV-to-Resume Conversion
            </h1>
            <p className="text-purple-100 text-lg">
              Distill your comprehensive Curriculum Vitae into a focused, high-impact Resume tailored for industry roles.
            </p>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              {/* Target Pages */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Target Length
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map(num => (
                    <button
                      key={num}
                      onClick={() => setConfig({...config, targetPages: num})}
                      className={`py-3 px-4 rounded-xl font-medium border-2 transition-all ${
                        config.targetPages === num
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {num} Page{num > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Style */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Tone & Style
                </label>
                <select
                  value={config.style}
                  onChange={(e) => setConfig({...config, style: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                >
                  <option value="standard">Standard Professional</option>
                  <option value="aggressive">Impact & Results Oriented (Aggressive)</option>
                  <option value="conservative">Conservative / Traditional</option>
                  <option value="creative">Creative / Modern</option>
                </select>
              </div>
              
              {/* Experience Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Your Experience Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'junior', label: 'Junior / Entry' },
                    { id: 'mid', label: 'Mid-Level' },
                    { id: 'senior', label: 'Senior / Exec' }
                  ].map(level => (
                    <button
                      key={level.id}
                      onClick={() => setConfig({...config, experienceLevel: level.id})}
                      className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        config.experienceLevel === level.id
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Target Industry */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Target Industry (Optional)
                </label>
                <input
                  type="text"
                  value={config.industry}
                  onChange={(e) => setConfig({...config, industry: e.target.value})}
                  placeholder="e.g. Software Engineering, Finance, Healthcare"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Providing an industry helps the AI prioritize relevant skills and experiences from your CV.
                </p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              {/* Submit Button */}
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className={`w-full mt-4 py-4 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
                  isConverting
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {isConverting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Converting (This may take up to a minute)...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Generate Resume
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CVConversionPage
