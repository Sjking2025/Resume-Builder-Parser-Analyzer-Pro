import React from 'react'

const GenericSection = ({ title, items }) => {
  if (!items || items.length === 0) return null

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold uppercase tracking-wider mb-3 border-b-2 border-gray-800 pb-1 text-gray-800">
        {title}
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-bold text-gray-800">{item.title || item.name}</h3>
              {item.date && <span className="text-sm font-semibold text-gray-600">{item.date}</span>}
            </div>
            {item.description && (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            )}
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                {item.url}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default GenericSection
