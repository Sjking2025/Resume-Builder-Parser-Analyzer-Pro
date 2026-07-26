import React, { useRef } from 'react'
import { FaListUl } from 'react-icons/fa'

const BulletTextarea = ({ value, onChange, placeholder, rows = 5, className = '' }) => {
  const textareaRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const cursorPosition = e.target.selectionStart
      const textBeforeCursor = value.substring(0, cursorPosition)
      const textAfterCursor = value.substring(cursorPosition)
      
      const lines = textBeforeCursor.split('\n')
      const currentLine = lines[lines.length - 1]
      
      // Check if current line is an empty bullet
      const isEmptyBullet = /^(\s*)[•-]\s*$/.test(currentLine)
      
      if (isEmptyBullet) {
        // Remove the empty bullet on Enter (act as a normal Enter now)
        const newTextBefore = textBeforeCursor.substring(0, textBeforeCursor.length - currentLine.length)
        const newValue = newTextBefore + '\n' + textAfterCursor
        onChange({ target: { value: newValue } })
        
        // Restore cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorPosition - currentLine.length + 1
          }
        }, 0)
      } else {
        // Find if current line has a bullet to inherit indentation
        const bulletMatch = currentLine.match(/^(\s*)[•-]\s*/)
        // Use the same bullet prefix if it exists, otherwise just default bullet
        const bulletPrefix = bulletMatch ? bulletMatch[0] : '• '
        
        const insertion = '\n' + bulletPrefix
        const newValue = textBeforeCursor + insertion + textAfterCursor
        
        onChange({ target: { value: newValue } })
        
        // Move cursor after the inserted bullet
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorPosition + insertion.length
          }
        }, 0)
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const cursorPosition = e.target.selectionStart
      const textBeforeCursor = value.substring(0, cursorPosition)
      const textAfterCursor = value.substring(cursorPosition)
      
      const lines = textBeforeCursor.split('\n')
      const currentLineIndex = lines.length - 1
      const currentLine = lines[currentLineIndex]
      
      let newValue = ''
      let newCursorPos = cursorPosition
      
      if (e.shiftKey) {
        // Outdent (remove up to 2 spaces)
        const spaceMatch = currentLine.match(/^ {1,2}/)
        if (spaceMatch) {
          const removedSpaces = spaceMatch[0].length
          lines[currentLineIndex] = currentLine.substring(removedSpaces)
          newValue = lines.join('\n') + textAfterCursor
          newCursorPos = cursorPosition - removedSpaces
        } else {
          return // Nothing to outdent
        }
      } else {
        // Indent (add 2 spaces at the beginning of the line)
        lines[currentLineIndex] = '  ' + currentLine
        newValue = lines.join('\n') + textAfterCursor
        newCursorPos = cursorPosition + 2
      }
      
      onChange({ target: { value: newValue } })
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursorPos
        }
      }, 0)
    }
  }

  const formatAsBullets = () => {
    if (!value) return
    
    // Split by newlines, periods followed by space, or semicolons
    const rawSegments = value.split(/(?:\n|(?<=[a-zA-Z0-9])\.\s+|;\s+)/)
    
    const formattedLines = rawSegments
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0)
      .map(segment => {
        // Clean up existing bullets or dashes at the start
        let cleaned = segment.replace(/^[-•*]\s*/, '')
        // Ensure it ends with a period if it doesn't already
        if (!cleaned.endsWith('.') && cleaned.length > 3) {
          cleaned += '.'
        }
        return `• ${cleaned}`
      })
      
    onChange({ target: { value: formattedLines.join('\n') } })
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`${className} pb-10 min-h-[120px]`}
      />
      
      <div className="absolute bottom-2 right-2">
        <button
          onClick={formatAsBullets}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors shadow-sm border border-primary-200"
          title="Auto-format paragraphs into bullet points"
        >
          <FaListUl className="text-[10px]" />
          Format as Bullets
        </button>
      </div>
    </div>
  )
}

export default BulletTextarea
