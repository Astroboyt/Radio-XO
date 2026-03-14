/**
 * Superfluid IBM Carbon G100 (Dark) Theme Tokens
 * Strict adherence to Carbon v11 specifications.
 */

export const TOKENS = {
  colors: {
    background: '#161616',    // Gray 100
    backgroundInverse: '#f4f4f4',
    
    layer: {
      '01': '#262626',           // Gray 90
      '02': '#393939',           // Gray 80
      '03': '#525252',           // Gray 70
    },

    text: {
      primary: '#f4f4f4',      // Gray 10
      secondary: '#c6c6c6',    // Gray 30
      placeholder: '#6f6f6f',  // Gray 60
      onColor: '#ffffff',
    },

    interactive: {
      '01': '#0f62fe',           // Blue 60
      '02': '#6f6f6f',           // Gray 60
      '03': '#8a3ffc',           // Purple 60
      error: '#fa4d56',        // Red 50
      success: '#42be65',      // Green 40
      warning: '#f1c21b',      // Yellow 30
    },

    white: '#FFFFFF',
    black: '#000000',
  },

  // IBM Carbon 2x Grid Spacing
  spacing: {
    '01': 2,
    '02': 4,
    '03': 8,
    '04': 12,
    '05': 16,
    '06': 24,
    '07': 32,
    '08': 40,
    '09': 48,
    '10': 64,
  },

  fonts: {
    logo: 'DXRigraf-SemiBold',
    heading: 'Schoolbell',
    body: 'Degular',
    mono: 'System', // Placeholder for IBM Plex Mono
  },

  layout: {
    headerHeight: 64,         // Carbon Standard Header
    containerPadding: 16,
    borderRadius: 0,          // Carbon uses square corners for industrial feel
  }
};
