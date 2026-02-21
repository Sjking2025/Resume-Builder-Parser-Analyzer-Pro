import React from 'react'

const Footer = () => {
  return (
    <footer
      className="relative no-print"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(9, 9, 11, 0.95)',
      }}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)',
        }}
      />
      <div className="max-w-7xl mx-auto px-6 py-6 text-center">
        <p style={{ color: '#52525b', fontSize: '0.875rem', fontFamily: 'var(--font-family-display)' }}>
          Built with <span style={{ color: '#f97316' }}>♦</span> for students everywhere
        </p>
        <p style={{ color: '#3f3f46', fontSize: '0.75rem', marginTop: '0.375rem' }}>
          Open source • Privacy focused • Student first
        </p>
      </div>
    </footer>
  )
}

export default Footer
