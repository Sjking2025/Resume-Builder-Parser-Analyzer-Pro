import React, { useEffect, useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { FaExclamationTriangle } from 'react-icons/fa'

const UnsavedChangesModal = ({ isOpen, onSave, onDiscard, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <FaExclamationTriangle className="text-yellow-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Unsaved Changes</h2>
        </div>
        
        <p className="text-gray-700 mb-6">
          You have unsaved changes to your resume. Would you like to save them before leaving?
        </p>

        <div className="flex flex-col gap-3">
          <button onClick={onSave} className="btn-primary w-full">
            Save as Draft
          </button>
          <button onClick={onCancel} className="btn-secondary w-full">
            Continue Editing
          </button>
          <button
            onClick={onDiscard}
            className="text-red-600 hover:text-red-700 font-medium py-2 transition-colors"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  )
}

const DraftProtection = ({ children }) => {
  const { isDirty, markClean, resume } = useResumeStore()
  const [showModal, setShowModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    // Handle browser navigation (back/forward/refresh/close)
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    // Handle backspace on empty field or browser back
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' && isDirty) {
        const target = e.target
        if (target.tagName === 'INPUT' && target.value === '') {
          // Show modal when backspace is pressed on empty input
          setShowModal(true)
          e.preventDefault()
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDirty])

  const handleSave = () => {
    // Save to localStorage (already handled by Zustand persist)
    markClean()
    setShowModal(false)
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }

  const handleDiscard = () => {
    markClean()
    setShowModal(false)
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }

  const handleCancel = () => {
    setShowModal(false)
    setPendingAction(null)
  }

  return (
    <>
      {children}
      <UnsavedChangesModal
        isOpen={showModal}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onCancel={handleCancel}
      />
    </>
  )
}

export default DraftProtection
