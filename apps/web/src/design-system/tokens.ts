import type { ClientDesignTokens } from 'standards-ui';

const nebulaBlue = '#3366cc';
const midnightInk = '#202122';
const starlightGray = '#a2a9b1';
const pulseGreen = '#14866d';
const novaRed = '#d73333';
const cometGold = '#f5b700';
const infoSky = '#0093d3';

export const canonTokens: ClientDesignTokens = {
  color: {
    primary: nebulaBlue,
    secondary: starlightGray,
    tertiary: '#eef1f5',
    text: midnightInk,
    background: '#ffffff',
    success: pulseGreen,
    error: novaRed,
    warning: cometGold,
    info: infoSky,
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    pagePadding: '24px',
  },
  typography: {
    fontFamily:
      "'Helvetica Neue', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '16px',
    lineHeight: '1.6',
  },
  layout: {
    pageMaxWidth: '1280px',
    containerPadding: '24px',
  },
  components: {
    button: {
      backgroundColor: '#ffffff',
      borderColor: starlightGray,
      textColor: midnightInk,
      borderRadius: '6px',
      padding: '10px 18px',
      fontSize: '16px',
      fontWeight: '500',
      borderWidth: '1px',
      borderStyle: 'solid',
      transition: 'all 0.2s ease-in-out',
      variants: {
        primary: {
          backgroundColor: nebulaBlue,
          borderColor: nebulaBlue,
          textColor: '#ffffff',
          states: {
            hover: {
              backgroundColor: '#2450a5',
              borderColor: '#2450a5',
            },
            focus: {
              boxShadow: '0 0 0 3px rgba(51, 102, 204, 0.3)',
              outline: 'none',
            },
            active: {
              backgroundColor: '#1b3a7f',
              borderColor: '#1b3a7f',
            },
          },
        },
        secondary: {
          backgroundColor: '#ffffff',
          borderColor: starlightGray,
          textColor: midnightInk,
          states: {
            hover: {
              backgroundColor: '#f4f6f9',
              borderColor: '#8c939f',
            },
            focus: {
              boxShadow: '0 0 0 3px rgba(162, 169, 177, 0.35)',
              outline: 'none',
            },
            active: {
              backgroundColor: '#e6e9ef',
              borderColor: '#7a828c',
            },
          },
        },
        danger: {
          backgroundColor: novaRed,
          borderColor: novaRed,
          textColor: '#ffffff',
          states: {
            hover: {
              backgroundColor: '#b02020',
              borderColor: '#b02020',
            },
            focus: {
              boxShadow: '0 0 0 3px rgba(215, 51, 51, 0.35)',
              outline: 'none',
            },
            active: {
              backgroundColor: '#861616',
              borderColor: '#861616',
            },
          },
        },
      },
    },
    card: {
      backgroundColor: '#ffffff',
      borderColor: '#d5dae0',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 10px 30px rgba(18, 23, 40, 0.05)',
    },
    page: {
      backgroundColor: '#f8fafc',
    },
  },
};

export default canonTokens;
