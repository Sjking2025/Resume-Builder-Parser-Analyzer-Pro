import React from 'react';

/**
 * Renders an array of skills based on the user's layout preference.
 * 
 * @param {Array<string>} skillArray - The list of skills to render.
 * @param {string} layout - The selected layout ('tags', 'bullets', 'comma').
 * @param {Object} tagStyle - Optional specific styles for tags (e.g. background color).
 * @param {Object} textStyle - Optional specific styles for text (e.g. font color).
 */
export const renderSkillsList = (skillArray, layout = 'tags', tagStyle = {}, textStyle = {}, containerStyle = {}) => {
  if (!skillArray || skillArray.length === 0) return null;

  if (layout === 'comma') {
    return (
      <div style={{ ...textStyle, lineHeight: '1.6', ...containerStyle }}>
        {skillArray.map((skill, i) => (
          <span key={i} style={{ whiteSpace: 'nowrap' }}>
            {skill}{i < skillArray.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    );
  }

  if (layout === 'bullets') {
    return (
      <ul style={{ ...textStyle, listStyleType: 'disc', paddingLeft: '18px', margin: '4px 0 0 0', lineHeight: '1.6', ...containerStyle }}>
        {skillArray.map((skill, i) => (
          <li key={i} style={{ marginBottom: '2px' }}>{skill}</li>
        ))}
      </ul>
    );
  }

  // tags (default)
  const defaultTagStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: '3px 10px',
    borderRadius: '16px', // pill shape
    fontSize: '11px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    color: textStyle?.color || 'inherit',
    ...tagStyle
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px', ...containerStyle }}>
      {skillArray.map((skill, i) => (
        <span key={i} style={defaultTagStyle}>
          {skill}
        </span>
      ))}
    </div>
  );
};
