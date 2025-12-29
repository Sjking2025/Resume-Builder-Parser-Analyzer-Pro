import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import DraftProtection from './components/DraftProtection/DraftProtection'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  return (
    <DraftProtection>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </div>
    </DraftProtection>
  )
}

export default App
