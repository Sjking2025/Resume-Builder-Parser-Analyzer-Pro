import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFileAlt, FaRocket, FaShieldAlt, FaStar, FaArrowRight } from 'react-icons/fa'

const HomePage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <FaFileAlt className="text-4xl text-primary-500" />,
      title: 'Professional Templates',
      description: 'Choose from ATS-optimized and modern templates designed to impress recruiters',
    },
    {
      icon: <FaRocket className="text-4xl text-accent-500" />,
      title: 'AI-Powered (Coming Soon)',
      description: 'Get intelligent suggestions and optimize your resume for any job description',
    },
    {
      icon: <FaShieldAlt className="text-4xl text-green-500" />,
      title: 'Privacy First',
      description: 'Your data stays on your device. No accounts required, no watermarks, 100% free',
    },
    {
      icon: <FaStar className="text-4xl text-yellow-500" />,
      title: 'Smart Features',
      description: 'Auto-save, draft protection, and real-time preview for seamless editing experience',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent animate-slide-down">
            Build Your Dream Resume
          </h1>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed animate-fade-in">
            100% free, AI-powered resume builder with professional templates.
            <br />
            <span className="font-semibold text-primary-600">No watermarks. No paywalls. No BS.</span>
          </p>
          
          <button
            onClick={() => navigate('/editor')}
            className="btn-primary text-lg px-10 py-4 animate-slide-up inline-flex items-center gap-3"
          >
            Start Building Free <FaArrowRight />
          </button>

          <p className="text-sm text-gray-600 mt-4">No account required • Your data stays private</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="section-card text-center hover:scale-105 transition-transform duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="mt-24 glass-effect rounded-3xl p-12 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">
            Why Students Love Us
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✓</span>
              <p><strong>100% Free Forever:</strong> No hidden costs or premium tiers. Everyone gets full access.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✓</span>
              <p><strong>ATS-Optimized:</strong> Templates designed to pass Applicant Tracking Systems used by companies.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✓</span>
              <p><strong>Draft Protection:</strong> Never lose your work. Auto-save keeps your resume safe.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✓</span>
              <p><strong>Privacy Respected:</strong> No login required. Your resume data never leaves your browser.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✓</span>
              <p><strong>Student-First:</strong> Built by students, for students. We understand the struggle.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Join thousands of students who trust our platform
          </p>
          <button
            onClick={() => navigate('/editor')}
            className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-3"
          >
            Create Resume Now <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            Built with ❤️ for students everywhere
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Open source • Privacy focused • Student first
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
