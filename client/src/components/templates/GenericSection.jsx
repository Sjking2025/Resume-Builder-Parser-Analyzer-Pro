import React from 'react'

const GenericSection = ({ title, items }) => {
  if (!items || items.length === 0) return null

  return (
    <div style={{ marginBottom: '18px' }}>
      <h2 style={{
        fontSize: '14px',
        fontWeight: '700',
        color: '#2563eb', // blue accent
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '10px',
        paddingBottom: '4px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, index) => (
          <div key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: 0 }}>
                {item.title || item.name}
              </h3>
              {item.date && (
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
                  {item.date}
                </span>
              )}
            </div>
            {item.description && (
              <p style={{ fontSize: '12px', color: '#374151', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '4px 0 0 0' }}>
                {item.description}
              </p>
            )}
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none' }}>
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


