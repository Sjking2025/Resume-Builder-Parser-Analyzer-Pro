import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../utils/canvasUtils'
import { FaTimes, FaCheck, FaUndo } from 'react-icons/fa'

const PhotoEditorModal = ({ imageSrc, onSave, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  
  // 1 is square/circle, 3/4 is standard portrait passport ratio
  const [aspectRatio, setAspectRatio] = useState(1)
  const [shape, setShape] = useState('round') // 'round' or 'rect'

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        { horizontal: false, vertical: false },
        aspectRatio
      )
      
      onSave({
        originalImage: imageSrc,
        croppedImage,
        crop,
        zoom,
        rotation,
        aspectRatio,
        shape
      })
    } catch (e) {
      console.error('Failed to crop image', e)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Edit Photo</h2>
          <button 
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative flex-1 bg-gray-900 w-full min-h-[400px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            cropShape={shape}
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>

        {/* Controls */}
        <div className="p-6 bg-white space-y-6 overflow-y-auto">
          {/* Zoom & Rotation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Rotation</span>
                <span>{rotation}°</span>
              </div>
              <input
                type="range"
                value={rotation}
                min={0}
                max={360}
                step={1}
                aria-labelledby="Rotation"
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          </div>

          {/* Aspect Ratio & Shape */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Crop Style</label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setAspectRatio(1); setShape('round') }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                  aspectRatio === 1 && shape === 'round' 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                Circle (1:1)
              </button>
              <button
                onClick={() => { setAspectRatio(1); setShape('rect') }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                  aspectRatio === 1 && shape === 'rect' 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                Square (1:1)
              </button>
              <button
                onClick={() => { setAspectRatio(3/4); setShape('rect') }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                  aspectRatio === 3/4 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                Portrait (3:4)
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setZoom(1)
                setRotation(0)
                setCrop({ x: 0, y: 0 })
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FaUndo /> Reset
            </button>
            <div className="flex-1"></div>
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2 shadow-md shadow-primary-500/20"
            >
              <FaCheck /> Apply Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoEditorModal
