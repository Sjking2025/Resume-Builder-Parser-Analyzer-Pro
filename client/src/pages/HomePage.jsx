import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFileAlt, FaRocket, FaShieldAlt, FaStar, FaArrowRight, FaGlobe, FaBullseye } from 'react-icons/fa'

const HomePage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <FaFileAlt />,
      title: 'Professional Templates',
      description: 'Choose from 18 ATS-optimized and modern templates designed to impress recruiters',
      color: '#f97316',
    },
    {
      icon: <FaRocket />,
      title: 'AI-Powered Features',
      description: 'Import resumes from PDF, get AI analysis, ATS scoring, and job description matching',
      color: '#06b6d4',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Privacy First',
      description: 'Your data stays on your device. No accounts required, no watermarks, 100% free',
      color: '#22c55e',
    },
    {
      icon: <FaStar />,
      title: 'Smart Features',
      description: 'Auto-save, draft protection, and real-time preview for seamless editing experience',
      color: '#eab308',
    },
  ]

  return (
    <div className="relative z-10 min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-24 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 animate-fade-in" style={{
            background: 'rgba(249, 115, 22, 0.08)',
            border: '1px solid rgba(249, 115, 22, 0.15)',
          }}>
            <span style={{ color: '#f97316', fontSize: '0.75rem' }}>⚡</span>
            <span style={{ color: '#a1a1aa', fontSize: '0.8rem', fontFamily: 'var(--font-family-display)' }}>100% Free • No Watermarks</span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-down"
            style={{ fontFamily: 'var(--font-family-display)', letterSpacing: '-0.04em' }}
          >
            <span className="text-gradient-ember">Build Your</span>
            <br />
            <span style={{ color: '#fafafa' }}>Dream Resume</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 leading-relaxed animate-fade-in max-w-2xl mx-auto" style={{ color: '#71717a' }}>
            AI-powered resume builder with professional templates.
            <br />
            <span style={{ color: '#a1a1aa', fontWeight: 500 }}>No paywalls. No BS. Just results.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
            <button
              onClick={() => navigate('/editor')}
              className="btn-primary text-lg px-10 py-4 animate-slide-up inline-flex items-center gap-3"
            >
              Start Building Free <FaArrowRight />
            </button>
            <button
              onClick={() => navigate('/analyze')}
              className="btn-secondary text-lg px-10 py-4 animate-slide-up inline-flex items-center gap-3"
              style={{ animationDelay: '60ms' }}
            >
              <FaRocket style={{ color: '#06b6d4' }} /> AI Analysis
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              className="btn-secondary text-lg px-10 py-4 animate-slide-up inline-flex items-center gap-3"
              style={{ animationDelay: '120ms' }}
            >
              <FaGlobe style={{ color: '#22c55e' }} /> Portfolio
            </button>
            <button
              onClick={() => navigate('/skill-gap')}
              className="btn-secondary text-lg px-10 py-4 animate-slide-up inline-flex items-center gap-3"
              style={{ animationDelay: '180ms' }}
            >
              <FaBullseye style={{ color: '#eab308' }} /> Skill Gap
            </button>
          </div>

          <p className="text-sm mt-5 animate-fade-in" style={{ color: '#3f3f46', animationDelay: '300ms' }}>
            No account required • Your data stays private
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-24 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="section-card text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5 text-xl"
                style={{
                  background: `${feature.color}12`,
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#71717a' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Why Students Love Us */}
        <div
          className="mt-28 glass-effect rounded-2xl p-10 md:p-14 max-w-3xl mx-auto animate-fade-in"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-10"
            style={{ fontFamily: 'var(--font-family-display)', letterSpacing: '-0.03em', color: '#fafafa' }}
          >
            Why Students <span className="text-gradient-forge">Love Us</span>
          </h2>
          <div className="space-y-5">
            {[
              ['100% Free Forever:', 'No hidden costs or premium tiers. Everyone gets full access.'],
              ['ATS-Optimized:', 'Templates designed to pass Applicant Tracking Systems.'],
              ['Draft Protection:', 'Never lose your work. Auto-save keeps your resume safe.'],
              ['Privacy Respected:', 'No login required. Your resume data never leaves your browser.'],
              ['Student-First:', 'Built by students, for students. We understand the struggle.'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex items-start gap-3.5">
                <span
                  className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}
                >
                  ✓
                </span>
                <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
                  <strong style={{ color: '#d4d4d8' }}>{title}</strong> {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-28 mb-12">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-family-display)', letterSpacing: '-0.03em', color: '#fafafa' }}
          >
            Ready to <span className="text-gradient-forge">Land Your Dream Job?</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: '#71717a' }}>
            Join thousands of students who trust our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/editor')}
              className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-3"
            >
              Create Resume Now <FaArrowRight />
            </button>
            <button
              onClick={() => navigate('/analyze')}
              className="btn-secondary text-lg px-10 py-4 inline-flex items-center gap-3"
            >
              <FaRocket style={{ color: '#06b6d4' }} /> Try AI Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
