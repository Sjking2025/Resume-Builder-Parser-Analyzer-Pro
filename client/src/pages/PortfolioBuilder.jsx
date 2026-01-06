import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHome, FaGlobe, FaSpinner, FaDownload, FaEdit, FaRocket, FaCog, FaEye } from 'react-icons/fa'
import useResumeStore from '../store/useResumeStore'
import usePortfolioStore from '../store/usePortfolioStore'
import { API_ENDPOINTS } from '../config/api'
import ThemeSelector from '../components/portfolio/ThemeSelector'
import PortfolioPreview from '../components/portfolio/PortfolioPreview'
import { themeMap } from '../components/portfolio/PortfolioPreview'

/**
 * PortfolioBuilder - Main page for generating and customizing portfolio
 */
const PortfolioBuilder = () => {
  const navigate = useNavigate()
  const { resume } = useResumeStore()
  const {
    portfolioData,
    setPortfolioData,
    selectedTheme,
    setSelectedTheme,
    settings,
    updateSettings,
    isEnhancing,
    setEnhancing,
    setEnhanceError,
    enhanceError,
    lastGenerated
  } = usePortfolioStore()

  const [activeTab, setActiveTab] = useState('theme') // 'theme' or 'settings'
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Check if resume has content
  const hasResumeContent = resume.personalInfo?.fullName || 
    resume.experience?.length > 0 || 
    resume.education?.length > 0 ||
    resume.projects?.length > 0

  // Generate portfolio with AI enhancement
  const handleGeneratePortfolio = async () => {
    if (!hasResumeContent) {
      setEnhanceError('Please add content to your resume first')
      return
    }

    setEnhancing(true)
    setEnhanceError(null)

    try {
      const response = await fetch(API_ENDPOINTS.portfolioEnhance, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_data: resume })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || 'Failed to enhance portfolio')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setPortfolioData(result.data)
        // Use AI-suggested theme if available
        if (result.data.meta?.suggestedTheme && themeMap[result.data.meta.suggestedTheme]) {
          setSelectedTheme(result.data.meta.suggestedTheme)
        }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      setEnhanceError(err.message)
    } finally {
      setEnhancing(false)
    }
  }

  // Export portfolio as HTML
  const handleExportHTML = () => {
    if (!portfolioData) return

    const isTechnical = selectedTheme === 'technical'
    const themeStyles = isTechnical ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
    
    // Helper to generate skill bars
    const generateSkillBars = (skills) => {
      if (!skills || skills.length === 0) return ''
      return skills.map(skill => {
        const name = typeof skill === 'string' ? skill : skill.name
        const level = typeof skill === 'object' ? skill.level : 75
        return `
          <div class="mb-4">
            <div class="flex justify-between mb-1">
              <span class="${isTechnical ? 'text-gray-300' : 'text-gray-600'}">${name}</span>
              <span class="text-sm ${isTechnical ? 'text-gray-400' : 'text-gray-500'}">${level}%</span>
            </div>
            <div class="h-2 rounded-full ${isTechnical ? 'bg-gray-700' : 'bg-gray-200'}">
              <div class="h-full rounded-full ${isTechnical ? 'bg-green-500' : 'bg-blue-500'}" style="width: ${level}%"></div>
            </div>
          </div>`
      }).join('')
    }

    // Helper to generate project cards
    const generateProjects = (projects) => {
      if (!projects || projects.length === 0) return ''
      return projects.map(project => `
        <div class="${isTechnical ? 'bg-gray-900 border-gray-700 hover:border-green-500/50' : 'bg-white border-gray-200'} rounded-2xl p-6 border transition-all ${project.featured ? (isTechnical ? 'border-2 border-green-500' : 'border-2 border-blue-500') : ''}">
          ${project.featured ? `<div class="flex items-center gap-1 text-yellow-500 text-sm font-medium mb-3">⭐ Featured</div>` : ''}
          <h3 class="text-xl font-bold mb-2 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">${project.name}</h3>
          ${project.tagline ? `<p class="text-sm font-medium mb-3 ${isTechnical ? 'text-green-400' : 'text-blue-600'}">${project.tagline}</p>` : ''}
          <p class="mb-4 ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">${project.description}</p>
          ${project.impact ? `<p class="text-sm font-medium mb-4 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">📈 ${project.impact}</p>` : ''}
          ${project.tech && project.tech.length > 0 ? `
            <div class="flex flex-wrap gap-2 mb-4">
              ${project.tech.map(t => `<span class="px-2 py-1 rounded text-xs font-medium ${isTechnical ? 'bg-gray-800 text-green-400 border border-green-500/30' : 'bg-blue-100 text-blue-700'}">${t}</span>`).join('')}
            </div>
          ` : ''}
          <div class="flex gap-4 mt-auto pt-4">
            ${project.github ? `<a href="${project.github}" target="_blank" class="flex items-center gap-2 text-sm font-medium ${isTechnical ? 'text-green-400 hover:text-green-300' : 'text-blue-600 hover:text-blue-800'}">💻 Code</a>` : ''}
            ${project.demo ? `<a href="${project.demo}" target="_blank" class="flex items-center gap-2 text-sm font-medium ${isTechnical ? 'text-green-400 hover:text-green-300' : 'text-blue-600 hover:text-blue-800'}">🔗 Live Demo</a>` : ''}
          </div>
        </div>
      `).join('')
    }

    // Helper to generate experience timeline
    const generateExperience = (experience) => {
      if (!experience || experience.length === 0) return ''
      return experience.map(exp => `
        <div class="relative pl-12 md:pl-20 mb-8">
          <div class="absolute left-2 md:left-6 top-2 w-4 h-4 rounded-full ${isTechnical ? 'bg-green-500' : 'bg-blue-500'}"></div>
          <div class="${isTechnical ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl p-6 border">
            <p class="text-sm font-medium mb-2 ${isTechnical ? 'text-green-400' : 'text-blue-600'}">${exp.period}</p>
            <h3 class="text-xl font-bold ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">${exp.title}</h3>
            <p class="text-lg mb-3 ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">${exp.company}</p>
            ${exp.description ? `<p class="mb-4 ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">${exp.description}</p>` : ''}
            ${exp.highlights && exp.highlights.length > 0 ? `
              <ul class="space-y-2">
                ${exp.highlights.map(h => `<li class="flex items-start gap-2 ${isTechnical ? 'text-gray-400' : 'text-gray-600'}"><span class="${isTechnical ? 'text-green-400' : 'text-blue-600'}">•</span>${h}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        </div>
      `).join('')
    }

    // Helper to generate education cards
    const generateEducation = (education) => {
      if (!education || education.length === 0) return ''
      return education.map(edu => `
        <div class="${isTechnical ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border flex gap-4">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isTechnical ? 'bg-green-900/50 text-green-400' : 'bg-blue-100 text-blue-600'}">🎓</div>
          <div>
            <h3 class="text-lg font-bold ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">${edu.degree}</h3>
            <p class="${isTechnical ? 'text-gray-400' : 'text-gray-600'}">${edu.institution}</p>
            <p class="text-sm ${isTechnical ? 'text-green-400' : 'text-blue-600'}">${edu.year}</p>
            ${edu.highlights && edu.highlights.length > 0 ? `
              <ul class="mt-2 space-y-1">
                ${edu.highlights.map(h => `<li class="text-sm ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">• ${h}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        </div>
      `).join('')
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolioData.meta?.title || portfolioData.hero?.name + ' - Portfolio' || 'My Portfolio'}</title>
  <meta name="description" content="${portfolioData.meta?.description || ''}">
  <meta name="keywords" content="${(portfolioData.meta?.keywords || []).join(', ')}">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4, h5, h6 { font-family: 'Outfit', sans-serif; }
    html { scroll-behavior: smooth; }
    
    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes floatBg {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-20px, -20px) scale(1.1); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.5; }
    }
    @keyframes growWidth {
      from { width: 0; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
    .animate-delay-100 { animation-delay: 0.1s; }
    .animate-delay-200 { animation-delay: 0.2s; }
    .animate-delay-300 { animation-delay: 0.3s; }
    .animate-delay-400 { animation-delay: 0.4s; }
    .animate-float { animation: floatBg 8s ease-in-out infinite; }
    .animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }
    .skill-bar { animation: growWidth 1.5s ease-out forwards; }
    
    /* Transitions */
    .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
    .hover-scale { transition: transform 0.3s ease; }
    .hover-scale:hover { transform: scale(1.05); }
    .hover-glow { transition: box-shadow 0.3s ease; }
    .hover-glow:hover { box-shadow: 0 0 30px ${isTechnical ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}; }
    
    /* Gradient text */
    .gradient-text { 
      background: linear-gradient(135deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'}); 
      -webkit-background-clip: text; 
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Cards */
    .card-glass {
      background: ${isTechnical ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
      backdrop-filter: blur(12px);
      border: 1px solid ${isTechnical ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)'};
    }
    
    /* Section styling */
    .section-title::after {
      content: '';
      display: block;
      width: 60px;
      height: 4px;
      margin-top: 12px;
      border-radius: 2px;
      background: linear-gradient(135deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'});
    }
  </style>
</head>
<body class="${themeStyles}">
  <!-- Navigation -->
  <nav class="fixed top-0 left-0 right-0 ${isTechnical ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md z-50 border-b ${isTechnical ? 'border-gray-800' : 'border-gray-200'} shadow-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
      <span class="font-bold text-lg sm:text-xl gradient-text">${portfolioData.hero?.name || 'Portfolio'}</span>
      <div class="hidden md:flex gap-4 lg:gap-6">
        <a href="#about" class="transition-all duration-300 hover:scale-105 ${isTechnical ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-blue-600'}">About</a>
        <a href="#skills" class="transition-all duration-300 hover:scale-105 ${isTechnical ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-blue-600'}">Skills</a>
        <a href="#projects" class="transition-all duration-300 hover:scale-105 ${isTechnical ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-blue-600'}">Projects</a>
        <a href="#experience" class="transition-all duration-300 hover:scale-105 ${isTechnical ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-blue-600'}">Experience</a>
        <a href="#education" class="transition-all duration-300 hover:scale-105 ${isTechnical ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-blue-600'}">Education</a>
        <a href="#contact" class="transition-all duration-300 hover:scale-105 ${isTechnical ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-blue-600'}">Contact</a>
      </div>
      <button onclick="document.getElementById('mobile-menu').classList.toggle('hidden')" class="md:hidden p-2 rounded-lg ${isTechnical ? 'text-green-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </div>
    <div id="mobile-menu" class="hidden md:hidden ${isTechnical ? 'bg-gray-900' : 'bg-white'} border-t ${isTechnical ? 'border-gray-800' : 'border-gray-200'} px-4 py-3">
      <a href="#about" onclick="this.parentElement.classList.add('hidden')" class="block py-3 border-b ${isTechnical ? 'border-gray-800 text-gray-400' : 'border-gray-100 text-gray-600'}">About</a>
      <a href="#skills" onclick="this.parentElement.classList.add('hidden')" class="block py-3 border-b ${isTechnical ? 'border-gray-800 text-gray-400' : 'border-gray-100 text-gray-600'}">Skills</a>
      <a href="#projects" onclick="this.parentElement.classList.add('hidden')" class="block py-3 border-b ${isTechnical ? 'border-gray-800 text-gray-400' : 'border-gray-100 text-gray-600'}">Projects</a>
      <a href="#experience" onclick="this.parentElement.classList.add('hidden')" class="block py-3 border-b ${isTechnical ? 'border-gray-800 text-gray-400' : 'border-gray-100 text-gray-600'}">Experience</a>
      <a href="#education" onclick="this.parentElement.classList.add('hidden')" class="block py-3 border-b ${isTechnical ? 'border-gray-800 text-gray-400' : 'border-gray-100 text-gray-600'}">Education</a>
      <a href="#contact" onclick="this.parentElement.classList.add('hidden')" class="block py-3 ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">Contact</a>
    </div>
  </nav>

  <main class="pt-14 sm:pt-16">
    ${isTechnical ? `
    <!-- Terminal Header Bar -->
    <div class="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
      <div class="flex gap-1.5">
        <div class="w-3 h-3 rounded-full bg-red-500 hover:opacity-80 transition-opacity"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-500 hover:opacity-80 transition-opacity"></div>
        <div class="w-3 h-3 rounded-full bg-green-500 hover:opacity-80 transition-opacity"></div>
      </div>
      <span class="text-gray-400 text-xs sm:text-sm ml-4 font-mono">~/portfolio/${portfolioData.hero?.name?.toLowerCase().replace(/\s+/g, '-') || 'developer'}</span>
    </div>
    ` : ''}

    <!-- Hero Section -->
    <section id="hero" class="min-h-[100vh] flex items-center justify-center relative overflow-hidden px-4 sm:px-6 py-16 sm:py-20" style="background: ${isTechnical ? 'linear-gradient(135deg, #111827, #1f2937, #111827)' : 'linear-gradient(135deg, #ffffff, #eff6ff, #e0e7ff)'};">
      <!-- Animated Background Blobs -->
      <div class="absolute -top-32 -right-32 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl animate-pulse-slow animate-float" style="background: ${isTechnical ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)'};"></div>
      <div class="absolute -bottom-32 -left-32 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl animate-pulse-slow animate-float" style="background: ${isTechnical ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)'}; animation-delay: 2s;"></div>
      
      <div class="max-w-4xl mx-auto text-center relative z-10">
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 animate-fadeInUp ${isTechnical ? 'text-green-400' : 'text-gray-900'}">${portfolioData.hero?.name || 'Your Name'}</h1>
        <p class="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-6 gradient-text animate-fadeInUp animate-delay-100">${portfolioData.hero?.headline || 'Professional'}</p>
        ${portfolioData.hero?.tagline ? `<p class="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed ${isTechnical ? 'text-gray-400' : 'text-gray-600'} animate-fadeInUp animate-delay-200">${portfolioData.hero.tagline}</p>` : ''}
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fadeInUp animate-delay-300">
          <a href="#contact" class="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover-scale shadow-lg ${isTechnical ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-gray-900 shadow-green-500/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30'}">${portfolioData.hero?.ctaText || 'Get In Touch'}</a>
          <a href="#projects" class="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover-scale ${isTechnical ? 'border-2 border-green-500 text-green-500 hover:bg-gray-800' : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'}">View My Work</a>
        </div>
        
        <!-- Scroll Indicator -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block" style="animation: bounce 2s infinite;">
          <div class="w-6 h-10 border-2 rounded-full flex justify-center pt-2 ${isTechnical ? 'border-green-500' : 'border-gray-400'}">
            <div class="w-1.5 h-2.5 rounded-full ${isTechnical ? 'bg-green-500' : 'bg-gray-400'}"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-20 px-6 ${isTechnical ? 'bg-gray-800' : 'bg-gray-50'}">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-8 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">${portfolioData.about?.title || 'About Me'}</h2>
        <div class="${isTechnical ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 shadow-lg border">
          <div class="text-lg leading-relaxed ${isTechnical ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-line">${portfolioData.about?.content || 'Welcome to my portfolio.'}</div>
          ${portfolioData.about?.highlights && portfolioData.about.highlights.length > 0 ? `
            <div class="mt-8 flex flex-wrap gap-3">
              ${portfolioData.about.highlights.map(h => `<span class="px-4 py-2 rounded-full text-sm font-medium ${isTechnical ? 'bg-green-900/50 text-green-400 border border-green-500/30' : 'bg-blue-100 text-blue-800'}">${h}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section id="skills" class="py-20 px-6 ${isTechnical ? 'bg-gray-900' : 'bg-white'}">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-12 ${isTechnical ? 'text-green-400' : 'text-gray-900'}">Skills & Technologies</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          ${portfolioData.skills?.technical && portfolioData.skills.technical.length > 0 ? `
            <div>
              <h3 class="text-xl font-semibold mb-6 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Technical Skills</h3>
              ${generateSkillBars(portfolioData.skills.technical)}
            </div>
          ` : ''}
          <div class="space-y-8">
            ${portfolioData.skills?.soft && portfolioData.skills.soft.length > 0 ? `
              <div>
                <h3 class="text-xl font-semibold mb-4 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Soft Skills</h3>
                <div class="flex flex-wrap gap-2">
                  ${portfolioData.skills.soft.map(s => `<span class="px-4 py-2 rounded-full text-sm font-medium ${isTechnical ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-700'}">${s}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${portfolioData.skills?.tools && portfolioData.skills.tools.length > 0 ? `
              <div>
                <h3 class="text-xl font-semibold mb-4 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Tools & Platforms</h3>
                <div class="flex flex-wrap gap-2">
                  ${portfolioData.skills.tools.map(t => `<span class="px-4 py-2 rounded-lg text-sm font-medium ${isTechnical ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200'}">${t}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="py-20 px-6 ${isTechnical ? 'bg-gray-800' : 'bg-gray-50'}">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-12 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Featured Projects</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${generateProjects(portfolioData.projects)}
        </div>
      </div>
    </section>

    <!-- Experience Section -->
    <section id="experience" class="py-20 px-6 ${isTechnical ? 'bg-gray-900' : 'bg-white'}">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-12 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Work Experience</h2>
        <div class="relative">
          <div class="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 ${isTechnical ? 'bg-gray-700' : 'bg-blue-200'}"></div>
          ${generateExperience(portfolioData.experience)}
        </div>
      </div>
    </section>

    <!-- Education Section -->
    <section id="education" class="py-20 px-6 ${isTechnical ? 'bg-gray-800' : 'bg-gray-50'}">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-12 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Education</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateEducation(portfolioData.education)}
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-20 px-6 ${isTechnical ? 'bg-gray-900' : 'bg-white'}">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4 ${isTechnical ? 'text-green-400' : 'text-gray-900'}">Let's Connect</h2>
        <p class="text-lg mb-12 ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">I'm always open to discussing new opportunities and interesting projects.</p>
        ${portfolioData.contact?.location ? `<p class="flex items-center justify-center gap-2 mb-8 ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">📍 ${portfolioData.contact.location}</p>` : ''}
        <div class="flex flex-wrap justify-center gap-4">
          ${portfolioData.contact?.email ? `<a href="mailto:${portfolioData.contact.email}" class="flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${isTechnical ? 'bg-green-500 hover:bg-green-600 text-gray-900' : 'bg-blue-600 hover:bg-blue-700 text-white'}">📧 Email</a>` : ''}
          ${portfolioData.contact?.linkedin ? `<a href="${portfolioData.contact.linkedin.startsWith('http') ? portfolioData.contact.linkedin : 'https://linkedin.com/in/' + portfolioData.contact.linkedin}" target="_blank" class="flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${isTechnical ? 'bg-green-500 hover:bg-green-600 text-gray-900' : 'bg-blue-600 hover:bg-blue-700 text-white'}">💼 LinkedIn</a>` : ''}
          ${portfolioData.contact?.github ? `<a href="${portfolioData.contact.github.startsWith('http') ? portfolioData.contact.github : 'https://github.com/' + portfolioData.contact.github}" target="_blank" class="flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${isTechnical ? 'bg-green-500 hover:bg-green-600 text-gray-900' : 'bg-blue-600 hover:bg-blue-700 text-white'}">💻 GitHub</a>` : ''}
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="py-8 text-center border-t ${isTechnical ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500'}">
    <p>© ${new Date().getFullYear()} ${portfolioData.hero?.name || ''} • Built with Resume Builder Platform</p>
  </footer>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${portfolioData.hero?.name?.toLowerCase().replace(/\s+/g, '-') || 'portfolio'}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2"
              >
                <FaHome /> Home
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-primary-500 bg-clip-text text-transparent flex items-center gap-2">
                <FaGlobe /> Portfolio Generator
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/editor')}
                className="btn-secondary flex items-center gap-2"
              >
                <FaEdit /> Edit Resume
              </button>
              {portfolioData && (
                <button
                  onClick={handleExportHTML}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaDownload /> Export HTML
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Generate Button */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <button
                onClick={handleGeneratePortfolio}
                disabled={isEnhancing || !hasResumeContent}
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isEnhancing ? (
                  <>
                    <FaSpinner className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <FaRocket /> Generate Portfolio
                  </>
                )}
              </button>
              
              {!hasResumeContent && (
                <p className="text-sm text-yellow-600 mt-3 text-center">
                  Add resume content first
                </p>
              )}
              
              {enhanceError && (
                <p className="text-sm text-red-600 mt-3 text-center">
                  {enhanceError}
                </p>
              )}
              
              {lastGenerated && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Last generated: {new Date(lastGenerated).toLocaleString()}
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('theme')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'theme'
                      ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Theme
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Settings
                </button>
              </div>
              
              <div className="p-4">
                {activeTab === 'theme' && (
                  <ThemeSelector
                    selectedTheme={selectedTheme}
                    onSelect={setSelectedTheme}
                  />
                )}
                
                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Privacy Settings</h3>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.showEmail}
                        onChange={(e) => updateSettings({ showEmail: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-gray-700">Show Email</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.showLocation}
                        onChange={(e) => updateSettings({ showLocation: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-gray-700">Show Location</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.enableDownload}
                        onChange={(e) => updateSettings({ enableDownload: e.target.checked })}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-gray-700">Allow Resume Download</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Button (Mobile) */}
            {portfolioData && (
              <button
                onClick={() => setShowPreviewModal(true)}
                className="lg:hidden w-full bg-white rounded-xl shadow-lg p-4 flex items-center justify-center gap-2 text-primary-600 font-medium"
              >
                <FaEye /> View Full Preview
              </button>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-4 min-h-[600px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Preview</h2>
                {portfolioData && (
                  <span className="text-sm text-gray-500">
                    Theme: {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}
                  </span>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[70vh] overflow-y-auto">
                <PortfolioPreview
                  portfolioData={portfolioData}
                  selectedTheme={selectedTheme}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full Preview Modal (Mobile) */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Full Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <PortfolioPreview
                portfolioData={portfolioData}
                selectedTheme={selectedTheme}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioBuilder
