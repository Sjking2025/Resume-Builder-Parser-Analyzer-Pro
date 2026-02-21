import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/editor', label: 'Editor' },
    { to: '/analyze', label: 'AI Analysis' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/skill-gap', label: 'Skill Gap' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 no-print"
      style={{
        background: 'rgba(9, 9, 11, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 group" style={{ textDecoration: 'none' }}>
            <span
              className="text-xl font-bold"
              style={{
                fontFamily: 'var(--font-family-display)',
                letterSpacing: '-0.03em',
                color: '#fafafa',
              }}
            >
              Resume<span style={{ color: '#f97316' }}>Forge</span>
            </span>
            <span className="text-lg" style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.4))' }}>⚡</span>
          </NavLink>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
                  style={{
                    textDecoration: 'none',
                    color: isActive ? '#f97316' : '#71717a',
                    fontFamily: 'var(--font-family-display)',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.target.style.color = '#a1a1aa'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.target.style.color = '#71717a'
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                      style={{ background: '#f97316' }}
                    />
                  )}
                </NavLink>
              )
            })}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className="md:hidden py-4 animate-slide-down"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            {links.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    textDecoration: 'none',
                    color: isActive ? '#f97316' : '#71717a',
                    background: isActive ? 'rgba(249,115,22,0.06)' : 'transparent',
                    borderRadius: '0.5rem',
                    fontFamily: 'var(--font-family-display)',
                  }}
                >
                  {link.label}
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
