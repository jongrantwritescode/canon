import type { DesignTokens } from "standards-ui";

export const tokens: DesignTokens = {
  color: {
    primary: "#0645ad",
    primaryHover: "#0b0080",
    primaryActive: "#052c6e",
    secondary: "#54595d",
    tertiary: "#a2a9b1",
    text: "#202122",
    textMuted: "#54595d",
    background: "#f8f9fa",
    surface: "#ffffff",
    surfaceMuted: "#f6f6f6",
    surfaceRaised: "#f0f4ff",
    border: "#a2a9b1",
    borderStrong: "#72777d",
    highlight: "#e3f2fd",
    overlay: "rgba(32, 33, 36, 0.55)",
    success: "#28a745",
    warning: "#ffc107",
    danger: "#dc3545",
    info: "#17a2b8",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    mdPlus: "12px",
    lg: "24px",
    xl: "32px",
    xxl: "40px",
    xxxl: "60px",
    pagePadding: "20px",
    contentGap: "20px",
    cardPadding: "16px",
    sidebarPadding: "12px",
    heroVertical: "60px",
    heroHorizontal: "24px",
    modalPadding: "24px",
  },
  typography: {
    fontFamily:
      '"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: "16px",
    lineHeight: "1.6",
    headingFontFamily:
      '"Source Serif Pro", "Merriweather", "Georgia", serif',
    headingWeight: "600",
    headingLineHeight: "1.3",
  },
  layout: {
    pageMaxWidth: "1200px",
    sidebarWidth: "240px",
    contentGap: "20px",
    cardGridMin: "220px",
  },
  shape: {
    radiusSm: "4px",
    radiusMd: "6px",
    radiusLg: "12px",
    borderWidth: "1px",
  },
  components: {
    button: {
      borderRadius: "4px",
      padding: "8px 16px",
      fontWeight: "500",
      transition: "all 0.2s ease-in-out",
      variants: {
        primary: {
          backgroundColor: "#0645ad",
          borderColor: "#0645ad",
          textColor: "#ffffff",
          states: {
            hover: {
              backgroundColor: "#0b0080",
              borderColor: "#0b0080",
            },
            focus: {
              boxShadow: "0 0 0 0.2rem rgba(6, 69, 173, 0.3)",
            },
            active: {
              backgroundColor: "#052c6e",
              borderColor: "#052c6e",
            },
            disabled: {
              backgroundColor: "#a2a9b1",
              borderColor: "#a2a9b1",
              textColor: "#f8f9fa",
              cursor: "not-allowed",
              opacity: "0.6",
            },
          },
        },
        secondary: {
          backgroundColor: "transparent",
          borderColor: "#0645ad",
          textColor: "#0645ad",
          states: {
            hover: {
              backgroundColor: "#0645ad",
              borderColor: "#0645ad",
              textColor: "#ffffff",
            },
            focus: {
              boxShadow: "0 0 0 0.2rem rgba(6, 69, 173, 0.2)",
            },
            disabled: {
              backgroundColor: "transparent",
              borderColor: "#a2a9b1",
              textColor: "#a2a9b1",
              cursor: "not-allowed",
              opacity: "0.6",
            },
          },
        },
        danger: {
          backgroundColor: "#dc3545",
          borderColor: "#dc3545",
          textColor: "#ffffff",
          states: {
            hover: {
              backgroundColor: "#c82333",
              borderColor: "#c82333",
            },
            focus: {
              boxShadow: "0 0 0 0.2rem rgba(220, 53, 69, 0.3)",
            },
            active: {
              backgroundColor: "#b21f2d",
              borderColor: "#b21f2d",
            },
            disabled: {
              backgroundColor: "#f1a6ae",
              borderColor: "#f1a6ae",
              textColor: "#ffffff",
              cursor: "not-allowed",
              opacity: "0.6",
            },
          },
        },
      },
    },
  },
};

export default tokens;
