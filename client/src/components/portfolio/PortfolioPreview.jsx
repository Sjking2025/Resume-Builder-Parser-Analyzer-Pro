import React from 'react'
import MinimalTheme from './themes/MinimalTheme'
import TechnicalTheme from './themes/TechnicalTheme'

/**
 * Theme registry for dynamic theme selection
 */
const themeMap = {
  minimal: MinimalTheme,
  technical: TechnicalTheme,
}

/**
 * Portfolio Preview - Renders the selected theme with portfolio data
 */
const PortfolioPreview = ({ portfolioData, selectedTheme, scale = 1 }) => {
  const Theme = themeMap[selectedTheme] || MinimalTheme

  if (!portfolioData) {
    return (
      <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No Portfolio Data</p>
          <p className="text-sm">Click "Generate Portfolio" to create your portfolio</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden"
      style={{ 
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: scale !== 1 ? `${100 / scale}%` : '100%'
      }}
    >
      <Theme data={portfolioData} />
    </div>
  )
}

export default PortfolioPreview
export { themeMap }
