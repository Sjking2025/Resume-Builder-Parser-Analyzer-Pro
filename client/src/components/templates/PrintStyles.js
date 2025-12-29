// Shared print styles and utilities for all resume templates
// All colors use hex values for html2canvas/PDF compatibility (no oklch)

export const colors = {
    // Neutral colors
    black: '#000000',
    white: '#ffffff',

    // Gray scale
    gray900: '#111827',
    gray800: '#1f2937',
    gray700: '#374151',
    gray600: '#4b5563',
    gray500: '#6b7280',
    gray400: '#9ca3af',
    gray300: '#d1d5db',
    gray200: '#e5e7eb',
    gray100: '#f3f4f6',
    gray50: '#f9fafb',

    // Accent colors
    blue600: '#2563eb',
    blue500: '#3b82f6',
    blue100: '#dbeafe',

    navy800: '#1e3a5f',
    navy600: '#1e4976',
    navy100: '#e0e7ef',

    green600: '#16a34a',
    green100: '#dcfce7',

    gold600: '#ca8a04',
    gold100: '#fef3c7',

    purple600: '#9333ea',
    purple100: '#f3e8ff',
}

// Base styles for page break handling
export const printStyles = {
    section: {
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
    },
    entry: {
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
    },
    header: {
        pageBreakAfter: 'avoid',
        breakAfter: 'avoid',
    },
    keepTogether: {
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
    },
}

// Font stacks for different styles
export const fonts = {
    sansSerif: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    serif: "'Georgia', 'Times New Roman', Times, serif",
    modern: "'Outfit', 'Inter', system-ui, sans-serif",
}

// Border style options
export const borderStyles = {
    minimal: {
        section: 'none',
        header: 'none',
        divider: `1px solid ${colors.gray200}`,
    },
    default: {
        section: `1px solid ${colors.gray300}`,
        header: `2px solid ${colors.gray800}`,
        divider: `1px solid ${colors.gray300}`,
    },
    custom: {
        section: `1px solid ${colors.blue500}`,
        header: `3px solid ${colors.blue600}`,
        divider: `1px solid ${colors.blue200}`,
    },
}

// Get font size based on formatting option
export const getFontSize = (size) => {
    const sizes = {
        small: { base: '11px', h1: '22px', h2: '14px', h3: '12px' },
        medium: { base: '12px', h1: '26px', h2: '15px', h3: '13px' },
        large: { base: '14px', h1: '30px', h2: '17px', h3: '15px' },
    }
    return sizes[size] || sizes.medium
}

// Get line height based on formatting option
export const getLineHeight = (spacing) => {
    const heights = {
        compact: '1.3',
        normal: '1.5',
        relaxed: '1.7',
    }
    return heights[spacing] || heights.normal
}

// Get margin based on formatting option
export const getMargins = (margin) => {
    const margins = {
        narrow: '24px',
        normal: '40px',
        wide: '56px',
    }
    return margins[margin] || margins.normal
}

// Base container style for all templates
export const getContainerStyle = (formatting) => ({
    fontFamily: fonts.sansSerif,
    fontSize: getFontSize(formatting.fontSize).base,
    lineHeight: getLineHeight(formatting.lineSpacing),
    color: colors.gray900,
    backgroundColor: colors.white,
    maxWidth: '210mm',
    margin: '0 auto',
    padding: getMargins(formatting.margins),
    boxSizing: 'border-box',
})

// Section header style generator
export const getSectionHeaderStyle = (color = colors.gray900, borderColor = colors.gray300) => ({
    fontSize: '15px',
    fontWeight: '700',
    color: color,
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${borderColor}`,
    paddingBottom: '4px',
    ...printStyles.header,
})

// Entry container style
export const getEntryStyle = (marginBottom = '12px') => ({
    marginBottom,
    ...printStyles.entry,
})

// Section container style
export const getSectionStyle = (marginBottom = '18px') => ({
    marginBottom,
    ...printStyles.section,
})
