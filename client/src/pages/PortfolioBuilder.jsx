import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHome, FaGlobe, FaSpinner, FaDownload, FaEdit, FaRocket, FaCog, FaEye, FaDesktop, FaTabletAlt, FaMobileAlt } from 'react-icons/fa'
import useResumeStore from '../store/useResumeStore'
import usePortfolioStore from '../store/usePortfolioStore'
import { API_ENDPOINTS } from '../config/api'
import ThemeSelector from '../components/portfolio/ThemeSelector'
import PortfolioPreview from '../components/portfolio/PortfolioPreview'
import GenerationProgress from '../components/portfolio/GenerationProgress'
import { themeMap } from '../components/portfolio/PortfolioPreview'

// Device presets for responsive preview
const DEVICE_PRESETS = {
  desktop: { width: '100%', icon: FaDesktop, label: 'Desktop' },
  tablet: { width: '768px', icon: FaTabletAlt, label: 'Tablet' },
  mobile: { width: '375px', icon: FaMobileAlt, label: 'Mobile' }
}

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
  const [selectedDevice, setSelectedDevice] = useState('desktop') // 'desktop', 'tablet', 'mobile'
  
  // Streaming progress state
  const [streamProgress, setStreamProgress] = useState(0)
  const [streamStatus, setStreamStatus] = useState('')
  const [completedSections, setCompletedSections] = useState([])
  const [currentSection, setCurrentSection] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  // Check if resume has content
  const hasResumeContent = resume.personalInfo?.fullName || 
    resume.experience?.length > 0 || 
    resume.education?.length > 0 ||
    resume.projects?.length > 0

  // Generate portfolio using SSE streaming for real-time updates
  const handleGeneratePortfolio = async () => {
    if (!hasResumeContent) {
      setEnhanceError('Please add content to your resume first')
      return
    }

    // Reset state
    setEnhancing(true)
    setEnhanceError(null)
    setIsStreaming(true)
    setStreamProgress(0)
    setStreamStatus('Initializing...')
    setCompletedSections([])
    setCurrentSection('')

    // Initialize with empty portfolio structure
    let buildingPortfolio = {
      hero: {}, about: {}, skills: {}, projects: [], 
      experience: [], education: [], contact: {}, meta: {}
    }

    try {
      const response = await fetch(API_ENDPOINTS.portfolioEnhanceStream, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_data: resume })
      })

      if (!response.ok) {
        throw new Error('Failed to start stream')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        // Decode the chunk
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              // Handle error
              if (data.error) {
                setEnhanceError(data.error)
                break
              }

              // Update progress
              setStreamProgress(data.progress || 0)
              setStreamStatus(data.status || '')
              
              // Update current section
              if (data.section) {
                setCurrentSection(data.section)
                
                // Update portfolio data progressively
                buildingPortfolio[data.section] = data.data
                setPortfolioData({ ...buildingPortfolio })
                
                // Mark section as completed
                setCompletedSections(prev => [...prev, data.section])
              }

              // Handle completion
              if (data.complete) {
                setStreamStatus('Portfolio ready! ✨')
                
                // Set suggested theme
                if (buildingPortfolio.meta?.suggestedTheme && themeMap[buildingPortfolio.meta.suggestedTheme]) {
                  setSelectedTheme(buildingPortfolio.meta.suggestedTheme)
                }
                
                // Close modal after short delay
                setTimeout(() => {
                  setIsStreaming(false)
                }, 1500)
              }

            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }

    } catch (err) {
      console.error('Streaming error:', err)
      setEnhanceError(err.message)
      
      // Fallback to direct transformation
      const { transformResumeToPortfolio } = await import('../utils/transformResumeToPortfolio')
      const fallback = transformResumeToPortfolio(resume)
      if (fallback) {
        setPortfolioData(fallback)
        if (fallback.meta?.suggestedTheme && themeMap[fallback.meta.suggestedTheme]) {
          setSelectedTheme(fallback.meta.suggestedTheme)
        }
      }
      setIsStreaming(false)
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
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.05); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.1); }
    }
    @keyframes growWidth {
      from { width: 0; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes scrollDown {
      0%, 100% { transform: translateY(0); opacity: 1; }
      50% { transform: translateY(4px); opacity: 0.5; }
    }
    
    .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
    .animate-bounce { animation: bounce 2s ease-in-out infinite; }
    .animate-scroll-down { animation: scrollDown 1.5s ease-in-out infinite; }
    .skill-bar { animation: growWidth 1.5s ease-out forwards; }
    
    /* Hover Effects */
    .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
    .hover-scale { transition: transform 0.3s ease; }
    .hover-scale:hover { transform: scale(1.05); }
    .hover-glow { transition: box-shadow 0.3s ease; }
    .hover-glow:hover { box-shadow: 0 0 25px ${isTechnical ? 'rgba(34,197,94,0.4)' : 'rgba(59,130,246,0.4)'}; }
    .smooth-transition { transition: all 0.3s ease; }
    
    /* Gradient text */
    .gradient-text { 
      background: linear-gradient(135deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'}); 
      -webkit-background-clip: text; 
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Glassmorphism Cards */
    .card-glass {
      background: ${isTechnical ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
      backdrop-filter: blur(12px);
      border: 1px solid ${isTechnical ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)'};
    }
    
    /* Line clamp */
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
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
    <section id="hero" class="min-h-[90vh] flex items-center justify-center relative overflow-hidden px-3 sm:px-6 py-12 sm:py-20" style="background: ${isTechnical ? 'linear-gradient(135deg, #111827, #1f2937, #111827)' : 'linear-gradient(135deg, #ffffff, #eff6ff, #e0e7ff)'};">
      <!-- Animated Background Blobs -->
      <div class="absolute -top-16 -right-16 w-32 sm:w-64 md:w-80 h-32 sm:h-64 md:h-80 rounded-full blur-3xl opacity-30 animate-float" style="background: ${isTechnical ? '#22c55e' : '#3b82f6'};"></div>
      <div class="absolute -bottom-16 -left-16 w-32 sm:w-64 md:w-80 h-32 sm:h-64 md:h-80 rounded-full blur-3xl opacity-20 animate-float" style="background: ${isTechnical ? '#10b981' : '#6366f1'}; animation-delay: 2s;"></div>
      
      <div class="w-full max-w-4xl mx-auto text-center relative z-10 px-2">
        <h1 class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 animate-fadeInUp leading-tight ${isTechnical ? 'text-green-400' : 'text-gray-900'}">${portfolioData.hero?.name || 'Your Name'}</h1>
        <p class="text-sm sm:text-lg md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4 gradient-text animate-fadeInUp stagger-1">${portfolioData.hero?.headline || 'Professional'}</p>
        ${portfolioData.hero?.tagline ? `<p class="text-xs sm:text-sm md:text-base mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed ${isTechnical ? 'text-gray-400' : 'text-gray-600'} animate-fadeInUp stagger-2 px-2">${portfolioData.hero.tagline}</p>` : ''}
        <div class="flex flex-col gap-2 sm:flex-row sm:gap-3 justify-center animate-fadeInUp stagger-3 px-4 sm:px-0">
          <a href="#contact" class="w-full sm:w-auto text-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm hover-scale smooth-transition shadow-lg ${isTechnical ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}">${portfolioData.hero?.ctaText || 'Get In Touch'}</a>
          <a href="#projects" class="w-full sm:w-auto text-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm hover-scale smooth-transition ${isTechnical ? 'border-2 border-green-500 text-green-500' : 'border-2 border-blue-600 text-blue-600'}">View My Work</a>
        </div>
        
        <!-- Scroll indicator - hidden mobile -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:block animate-bounce">
          <div class="w-5 h-8 border-2 rounded-full flex justify-center pt-1.5 ${isTechnical ? 'border-green-500' : 'border-gray-400'}">
            <div class="w-1 h-2 rounded-full animate-scroll-down ${isTechnical ? 'bg-green-500' : 'bg-gray-400'}"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-10 sm:py-14 lg:py-20 px-3 sm:px-6" style="background: ${isTechnical ? 'linear-gradient(180deg, #1f2937, #111827)' : 'linear-gradient(180deg, #f9fafb, #ffffff)'};">
      <div class="max-w-4xl mx-auto">
        <div class="mb-6 sm:mb-8 animate-fadeInUp">
          <h2 class="text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">${portfolioData.about?.title || 'About Me'}</h2>
          <div class="h-1 w-12 sm:w-16 rounded-full" style="background: linear-gradient(90deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'});"></div>
        </div>
        <div class="card-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover-lift animate-fadeInUp stagger-1">
          <div class="text-xs sm:text-sm lg:text-base leading-relaxed ${isTechnical ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-line">${portfolioData.about?.content || 'Welcome to my portfolio.'}</div>
          ${portfolioData.about?.highlights && portfolioData.about.highlights.length > 0 ? `
            <div class="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
              ${portfolioData.about.highlights.map(h => `<span class="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium smooth-transition hover-scale ${isTechnical ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'}">${h}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section id="skills" class="py-10 sm:py-14 lg:py-20 px-3 sm:px-6 ${isTechnical ? 'bg-gray-900' : 'bg-white'}">
      <div class="max-w-4xl mx-auto">
        <div class="mb-6 sm:mb-10 animate-fadeInUp">
          <h2 class="text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${isTechnical ? 'text-green-400' : 'text-gray-900'}">Skills & Technologies</h2>
          <div class="h-1 w-12 sm:w-16 rounded-full" style="background: linear-gradient(90deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'});"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          ${portfolioData.skills?.technical && portfolioData.skills.technical.length > 0 ? `
            <div class="animate-fadeInUp stagger-1">
              <h3 class="text-sm sm:text-base font-semibold mb-3 sm:mb-4 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Technical Skills</h3>
              <div class="space-y-2.5 sm:space-y-3">
                ${portfolioData.skills.technical.map((skill, idx) => {
                  const name = typeof skill === 'string' ? skill : skill.name
                  const level = typeof skill === 'object' ? skill.level : 75
                  return `
                    <div class="group">
                      <div class="flex justify-between mb-1">
                        <span class="text-[10px] sm:text-xs font-medium smooth-transition ${isTechnical ? 'text-gray-300 group-hover:text-green-400' : 'text-gray-600 group-hover:text-blue-600'}">${name}</span>
                        <span class="text-[10px] sm:text-xs ${isTechnical ? 'text-gray-400' : 'text-gray-500'}">${level}%</span>
                      </div>
                      <div class="h-1.5 sm:h-2 rounded-full ${isTechnical ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden">
                        <div class="h-full rounded-full skill-bar" style="width: ${level}%; background: linear-gradient(90deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'}); animation-delay: ${idx * 0.1}s;"></div>
                      </div>
                    </div>`
                }).join('')}
              </div>
            </div>
          ` : ''}
          <div class="space-y-5 sm:space-y-6 animate-fadeInUp stagger-2">
            ${portfolioData.skills?.soft && portfolioData.skills.soft.length > 0 ? `
              <div>
                <h3 class="text-sm sm:text-base font-semibold mb-2 sm:mb-3 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Soft Skills</h3>
                <div class="flex flex-wrap gap-1 sm:gap-1.5">
                  ${portfolioData.skills.soft.map(s => `<span class="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium smooth-transition hover-scale ${isTechnical ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-green-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">${s}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${portfolioData.skills?.tools && portfolioData.skills.tools.length > 0 ? `
              <div>
                <h3 class="text-sm sm:text-base font-semibold mb-2 sm:mb-3 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Tools & Platforms</h3>
                <div class="flex flex-wrap gap-1 sm:gap-1.5">
                  ${portfolioData.skills.tools.map(t => `<span class="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium smooth-transition hover-scale ${isTechnical ? 'bg-green-900/30 text-green-400 border border-green-500/30 hover:bg-green-900/50' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'}">${t}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="py-10 sm:py-14 lg:py-20 px-3 sm:px-6" style="background: ${isTechnical ? 'linear-gradient(180deg, #1f2937, #111827)' : 'linear-gradient(180deg, #f9fafb, #f3f4f6)'};">
      <div class="max-w-5xl mx-auto">
        <div class="mb-6 sm:mb-10 animate-fadeInUp">
          <h2 class="text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Featured Projects</h2>
          <div class="h-1 w-12 sm:w-16 rounded-full" style="background: linear-gradient(90deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'});"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          ${(portfolioData.projects || []).map((project, idx) => `
            <div class="card-glass rounded-xl p-3 sm:p-4 hover-lift animate-fadeInUp ${project.featured ? (isTechnical ? 'ring-2 ring-green-500' : 'ring-2 ring-blue-500') : ''}" style="animation-delay: ${idx * 0.1}s">
              ${project.featured ? `<div class="flex items-center gap-1 text-yellow-500 text-[10px] sm:text-xs font-medium mb-2">⭐ Featured</div>` : ''}
              <h3 class="text-sm sm:text-base font-bold mb-1 line-clamp-2 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">${project.name}</h3>
              ${project.tagline ? `<p class="text-[10px] sm:text-xs font-medium mb-1.5 ${isTechnical ? 'text-green-400' : 'text-blue-600'}">${project.tagline}</p>` : ''}
              <p class="text-[10px] sm:text-xs mb-2 line-clamp-3 ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">${project.description}</p>
              ${project.impact ? `<p class="text-[10px] sm:text-xs font-semibold mb-2 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">📈 ${project.impact}</p>` : ''}
              ${project.tech && project.tech.length > 0 ? `
                <div class="flex flex-wrap gap-1 mb-2">
                  ${project.tech.slice(0, 4).map(t => `<span class="px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-medium smooth-transition hover-scale ${isTechnical ? 'bg-gray-900 text-green-400 border border-green-500/30' : 'bg-blue-100 text-blue-700'}">${t}</span>`).join('')}
                  ${project.tech.length > 4 ? `<span class="px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-medium opacity-60 ${isTechnical ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-600'}">+${project.tech.length - 4}</span>` : ''}
                </div>
              ` : ''}
              <div class="flex gap-3 mt-auto pt-2 border-t ${isTechnical ? 'border-gray-700' : 'border-gray-200'}">
                ${project.github ? `<a href="${project.github}" target="_blank" class="flex items-center gap-1 text-[10px] sm:text-xs font-medium smooth-transition hover-scale ${isTechnical ? 'text-green-400 hover:text-green-300' : 'text-blue-600 hover:text-blue-700'}">💻 Code</a>` : ''}
                ${project.demo ? `<a href="${project.demo}" target="_blank" class="flex items-center gap-1 text-[10px] sm:text-xs font-medium smooth-transition hover-scale ${isTechnical ? 'text-green-400 hover:text-green-300' : 'text-blue-600 hover:text-blue-700'}">🔗 Demo</a>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Experience Section -->
    <section id="experience" class="py-10 sm:py-14 lg:py-20 px-3 sm:px-6 ${isTechnical ? 'bg-gray-900' : 'bg-white'}">
      <div class="max-w-3xl mx-auto">
        <div class="mb-6 sm:mb-10 animate-fadeInUp">
          <h2 class="text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Work Experience</h2>
          <div class="h-1 w-12 sm:w-16 rounded-full" style="background: linear-gradient(90deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'});"></div>
        </div>
        <div class="relative">
          <div class="absolute left-2.5 sm:left-3 top-0 bottom-0 w-0.5" style="background: linear-gradient(180deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'});"></div>
          <div class="space-y-4 sm:space-y-6">
            ${(portfolioData.experience || []).map((exp, idx) => `
              <div class="relative pl-7 sm:pl-10 animate-fadeInUp" style="animation-delay: ${idx * 0.15}s">
                <div class="absolute left-1 sm:left-1.5 top-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full" style="background: linear-gradient(135deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'}); box-shadow: 0 0 10px ${isTechnical ? 'rgba(34,197,94,0.4)' : 'rgba(59,130,246,0.4)'};"></div>
                <div class="card-glass rounded-lg sm:rounded-xl p-3 sm:p-4 border ${isTechnical ? 'border-gray-700' : 'border-gray-200'} hover-lift">
                  <p class="text-[9px] sm:text-[10px] font-semibold mb-0.5 ${isTechnical ? 'text-green-400' : 'text-blue-600'}">${exp.period}</p>
                  <h3 class="text-xs sm:text-sm lg:text-base font-bold ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">${exp.title}</h3>
                  <p class="text-[10px] sm:text-xs mb-1.5 ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">${exp.company}</p>
                  ${exp.description ? `<p class="text-[10px] sm:text-xs mb-1.5 ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">${exp.description}</p>` : ''}
                  ${exp.highlights && exp.highlights.length > 0 ? `
                    <ul class="space-y-0.5 sm:space-y-1">
                      ${exp.highlights.slice(0, 3).map(h => `<li class="flex items-start gap-1.5 text-[9px] sm:text-[10px] ${isTechnical ? 'text-gray-400' : 'text-gray-600'}"><span class="mt-1 w-1 h-1 rounded-full flex-shrink-0" style="background: ${isTechnical ? '#22c55e' : '#3b82f6'};"></span><span class="line-clamp-2">${h}</span></li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- Education Section -->
    <section id="education" class="py-10 sm:py-14 lg:py-20 px-3 sm:px-6" style="background: ${isTechnical ? 'linear-gradient(180deg, #1f2937, #111827)' : 'linear-gradient(180deg, #f9fafb, #f3f4f6)'};">
      <div class="max-w-3xl mx-auto">
        <div class="mb-6 sm:mb-10 animate-fadeInUp">
          <h2 class="text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">Education</h2>
          <div class="h-1 w-12 sm:w-16 rounded-full" style="background: linear-gradient(90deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'});"></div>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:gap-4">
          ${(portfolioData.education || []).map((edu, idx) => `
            <div class="group card-glass rounded-lg sm:rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-4 border ${isTechnical ? 'border-gray-700' : 'border-gray-200'} hover-lift animate-fadeInUp" style="animation-delay: ${idx * 0.1}s">
              <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 smooth-transition" style="background: linear-gradient(135deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'});">
                <span class="text-sm sm:text-lg">🎓</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs sm:text-sm font-bold truncate ${isTechnical ? 'text-gray-100' : 'text-gray-900'}">${edu.degree}</h3>
                <p class="text-[10px] sm:text-xs truncate ${isTechnical ? 'text-gray-400' : 'text-gray-600'}">${edu.institution}</p>
                <p class="text-[9px] sm:text-[10px] font-semibold ${isTechnical ? 'text-green-400' : 'text-blue-600'}">${edu.year}</p>
                ${edu.highlights && edu.highlights.length > 0 ? `
                  <ul class="mt-1.5 space-y-0.5">
                    ${edu.highlights.slice(0, 2).map(h => `<li class="flex items-start gap-1 text-[9px] sm:text-[10px] ${isTechnical ? 'text-gray-400' : 'text-gray-600'}"><span class="mt-0.5 w-1 h-1 rounded-full flex-shrink-0" style="background: ${isTechnical ? '#22c55e' : '#3b82f6'};"></span><span class="line-clamp-1">${h}</span></li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-10 sm:py-14 lg:py-20 px-3 sm:px-6 relative overflow-hidden" style="background: ${isTechnical ? 'linear-gradient(135deg, #111827, #1f2937, #111827)' : 'linear-gradient(135deg, #ffffff, #eff6ff, #e0e7ff)'};">
      <div class="absolute -top-16 -right-16 w-32 sm:w-48 h-32 sm:h-48 rounded-full blur-3xl opacity-20 animate-pulse-glow" style="background: ${isTechnical ? '#22c55e' : '#3b82f6'};"></div>
      <div class="absolute -bottom-16 -left-16 w-32 sm:w-48 h-32 sm:h-48 rounded-full blur-3xl opacity-15 animate-pulse-glow" style="background: ${isTechnical ? '#10b981' : '#6366f1'}; animation-delay: 1s;"></div>
      
      <div class="max-w-3xl mx-auto text-center relative z-10">
        <div class="mb-4 sm:mb-6 animate-fadeInUp">
          <h2 class="text-lg sm:text-2xl md:text-3xl font-bold mb-2 ${isTechnical ? 'text-green-400' : 'text-gray-900'}">Let's Connect</h2>
          <div class="h-1 w-12 sm:w-16 rounded-full mx-auto" style="background: linear-gradient(90deg, ${isTechnical ? '#22c55e, #10b981' : '#3b82f6, #6366f1'});"></div>
        </div>
        <p class="text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-6 max-w-md mx-auto ${isTechnical ? 'text-gray-400' : 'text-gray-600'} animate-fadeInUp stagger-1">I'm always open to discussing new opportunities and interesting projects.</p>
        ${portfolioData.contact?.location ? `<p class="flex items-center justify-center gap-1.5 mb-4 sm:mb-6 text-[10px] sm:text-xs ${isTechnical ? 'text-gray-400' : 'text-gray-600'} animate-fadeInUp stagger-2">📍 ${portfolioData.contact.location}</p>` : ''}
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center animate-fadeInUp stagger-3 px-4 sm:px-0">
          ${portfolioData.contact?.email ? `<a href="mailto:${portfolioData.contact.email}" class="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm smooth-transition hover-scale shadow-lg ${isTechnical ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}">📧 Email</a>` : ''}
          ${portfolioData.contact?.linkedin ? `<a href="${portfolioData.contact.linkedin.startsWith('http') ? portfolioData.contact.linkedin : 'https://linkedin.com/in/' + portfolioData.contact.linkedin}" target="_blank" class="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm smooth-transition hover-scale shadow-lg ${isTechnical ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}">💼 LinkedIn</a>` : ''}
          ${portfolioData.contact?.github ? `<a href="${portfolioData.contact.github.startsWith('http') ? portfolioData.contact.github : 'https://github.com/' + portfolioData.contact.github}" target="_blank" class="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm smooth-transition hover-scale shadow-lg ${isTechnical ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}">💻 GitHub</a>` : ''}
        </div>
        
        <!-- Footer -->
        <div class="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t ${isTechnical ? 'border-gray-700' : 'border-gray-300'} animate-fadeInUp stagger-4">
          <p class="text-[9px] sm:text-[10px] ${isTechnical ? 'text-gray-500' : 'text-gray-500'}">© ${new Date().getFullYear()} ${portfolioData.hero?.name || ''} • Built with Resume Builder Platform</p>
        </div>
      </div>
    </section>
  </main>

  <script>
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-fadeInUp').forEach(el => {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  </script>
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
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 no-print" style={{
        background: 'rgba(9, 9, 11, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gradient-forge flex items-center gap-2" style={{ fontFamily: 'var(--font-family-display)', letterSpacing: '-0.02em' }}>
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
            <div className="section-card rounded-2xl p-6">
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
                <p className="text-sm mt-3 text-center" style={{ color: '#eab308' }}>
                  Add resume content first
                </p>
              )}
              
              {enhanceError && (
                <p className="text-sm mt-3 text-center" style={{ color: '#ef4444' }}>
                  {enhanceError}
                </p>
              )}
              
              {lastGenerated && (
                <p className="text-xs mt-3 text-center" style={{ color: '#52525b' }}>
                  Last generated: {new Date(lastGenerated).toLocaleString()}
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="section-card rounded-2xl overflow-hidden">
              <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setActiveTab('theme')}
                  className="flex-1 py-3 text-sm font-medium transition-colors"
                  style={{
                    background: activeTab === 'theme' ? 'rgba(249,115,22,0.08)' : 'transparent',
                    color: activeTab === 'theme' ? '#f97316' : '#71717a',
                    borderBottom: activeTab === 'theme' ? '2px solid #f97316' : '2px solid transparent',
                    cursor: 'pointer', border: 'none',
                    fontFamily: 'var(--font-family-display)',
                  }}
                >
                  Theme
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="flex-1 py-3 text-sm font-medium transition-colors"
                  style={{
                    background: activeTab === 'settings' ? 'rgba(249,115,22,0.08)' : 'transparent',
                    color: activeTab === 'settings' ? '#f97316' : '#71717a',
                    borderBottom: activeTab === 'settings' ? '2px solid #f97316' : '2px solid transparent',
                    cursor: 'pointer', border: 'none',
                    fontFamily: 'var(--font-family-display)',
                  }}
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
                    <h3 className="text-lg font-semibold" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>Privacy Settings</h3>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.showEmail}
                        onChange={(e) => updateSettings({ showEmail: e.target.checked })}
                        className="w-4 h-4"
                        style={{ accentColor: '#f97316' }}
                      />
                      <span style={{ color: '#a1a1aa' }}>Show Email</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.showLocation}
                        onChange={(e) => updateSettings({ showLocation: e.target.checked })}
                        className="w-4 h-4"
                        style={{ accentColor: '#f97316' }}
                      />
                      <span style={{ color: '#a1a1aa' }}>Show Location</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.enableDownload}
                        onChange={(e) => updateSettings({ enableDownload: e.target.checked })}
                        className="w-4 h-4"
                        style={{ accentColor: '#f97316' }}
                      />
                      <span style={{ color: '#a1a1aa' }}>Allow Resume Download</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Button (Mobile) */}
            {portfolioData && (
              <button
                onClick={() => setShowPreviewModal(true)}
                className="lg:hidden w-full section-card rounded-xl p-4 flex items-center justify-center gap-2 font-medium"
                style={{ color: '#f97316', cursor: 'pointer' }}
              >
                <FaEye /> View Full Preview
              </button>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-3">
            <div className="section-card rounded-2xl p-4 min-h-[600px]">
              {/* Preview Header with Device Selector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>Preview</h2>
                  {portfolioData && (
                    <span className="text-sm px-3 py-1 rounded-full" style={{
                      background: 'rgba(249,115,22,0.08)',
                      color: '#f97316',
                    }}>
                      {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)} Theme
                    </span>
                  )}
                </div>
                
                {/* Device Selector */}
                <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: '#27272a' }}>
                  {Object.entries(DEVICE_PRESETS).map(([device, preset]) => {
                    const Icon = preset.icon
                    return (
                      <button
                        key={device}
                        onClick={() => setSelectedDevice(device)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200"
                        style={{
                          background: selectedDevice === device ? 'rgba(249,115,22,0.1)' : 'transparent',
                          color: selectedDevice === device ? '#f97316' : '#71717a',
                          cursor: 'pointer', border: 'none',
                        }}
                        title={preset.label}
                      >
                        <Icon className="text-lg" />
                        <span className="hidden sm:inline">{preset.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Device Frame Container */}
              <div className={`rounded-xl p-4 transition-all duration-300 ${
                selectedDevice !== 'desktop' ? 'flex justify-center' : ''
              }`} style={{ background: '#27272a' }}>
                {/* Device Frame */}
                <div 
                  className={`transition-all duration-500 ease-out ${
                    selectedDevice === 'mobile' 
                      ? 'w-[375px] rounded-[2.5rem] border-[14px] shadow-2xl'
                      : selectedDevice === 'tablet'
                        ? 'w-[768px] rounded-[1.5rem] border-[12px] shadow-2xl'
                        : 'w-full rounded-lg border'
                  }`}
                  style={{ 
                    maxWidth: DEVICE_PRESETS[selectedDevice].width,
                    background: '#09090b',
                    borderColor: '#18181b'
                  }}
                >
                  {/* Device Notch (Mobile) */}
                  {selectedDevice === 'mobile' && (
                    <div className="flex justify-center py-2" style={{ background: '#18181b' }}>
                      <div className="w-20 h-5 rounded-full flex items-center justify-center gap-2" style={{ background: '#09090b' }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: '#27272a' }}></div>
                        <div className="w-8 h-2 rounded-full bg-gray-700"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Device Screen */}
                  <div className={`overflow-hidden ${
                    selectedDevice === 'mobile' ? 'rounded-b-[1.5rem] max-h-[600px]' 
                    : selectedDevice === 'tablet' ? 'rounded-b-xl max-h-[700px]'
                    : 'rounded-lg max-h-[70vh]'
                  } overflow-y-auto`} style={{ background: '#09090b' }}>
                    <PortfolioPreview
                      portfolioData={portfolioData}
                      selectedTheme={selectedTheme}
                    />
                  </div>
                  
                  {/* Device Home Button (Mobile/Tablet) */}
                  {selectedDevice !== 'desktop' && (
                    <div className="flex justify-center py-2" style={{ background: '#18181b' }}>
                      <div className={`${
                        selectedDevice === 'mobile' ? 'w-24 h-1 rounded-full' : 'w-10 h-10 rounded-full border-2'
                      }`} style={{ background: '#27272a', borderColor: '#3f3f46' }}></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Device Info */}
              {selectedDevice !== 'desktop' && (
                <div className="mt-3 text-center text-sm text-gray-500">
                  {selectedDevice === 'mobile' ? '375px × 667px' : '768px × 1024px'} viewport
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Full Preview Modal (Mobile) */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="section-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-obsidian-700">
            <div className="flex justify-between items-center p-4 border-b border-obsidian-800">
              <h3 className="font-semibold" style={{ color: '#fafafa', fontFamily: 'var(--font-family-display)' }}>Full Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="hover:text-primary-500 transition-colors"
                style={{ color: '#52525b', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-obsidian-950">
              <PortfolioPreview
                portfolioData={portfolioData}
                selectedTheme={selectedTheme}
              />
            </div>
          </div>
        </div>
      )}

      {/* Generation Progress Overlay */}
      {isStreaming && (
        <GenerationProgress
          progress={streamProgress}
          currentStatus={streamStatus}
          completedSections={completedSections}
          currentSection={currentSection}
        />
      )}
    </div>
  )
}

export default PortfolioBuilder
