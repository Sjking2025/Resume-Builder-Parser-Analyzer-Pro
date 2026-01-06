import React from 'react'
import { Routes, Route } from 'react-router-dom'
import DraftProtection from './components/DraftProtection/DraftProtection'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import AIAnalysisPage from './pages/AIAnalysisPage'
import PortfolioBuilder from './pages/PortfolioBuilder'
import './App.css'

function App() {
  return (
    <DraftProtection>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/analyze" element={<AIAnalysisPage />} />
          <Route path="/portfolio" element={<PortfolioBuilder />} />
        </Routes>
      </div>
    </DraftProtection>
  )
}

export default App

