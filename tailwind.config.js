/** @type {import('tailwindcss').Config} */
// Theme tokens copied from the Stitch export (design system "AgroFlight Precision")
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    "extend": {
      "colors": {
        "warning": "#d97706",
        "warning-container": "#fffbeb",
        "warning-outline": "#fde68a",
        "on-warning-container": "#b45309",
        "primary-fixed": "#7ffc97",
        "outline": "#6e7b6c",
        "surface-container-high": "#dce9ff",
        "on-tertiary-fixed-variant": "#004b73",
        "on-surface": "#0b1c30",
        "surface-tint": "#006e2d",
        "tertiary": "#006194",
        "tertiary-container": "#007bb9",
        "surface-container-low": "#eff4ff",
        "on-secondary-container": "#5c647a",
        "secondary-container": "#dae2fd",
        "inverse-on-surface": "#eaf1ff",
        "on-surface-variant": "#3e4a3d",
        "surface-variant": "#d3e4fe",
        "secondary-fixed": "#dae2fd",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "on-background": "#0b1c30",
        "on-tertiary-fixed": "#001d31",
        "on-primary": "#ffffff",
        "surface-dim": "#cbdbf5",
        "tertiary-fixed": "#cce5ff",
        "on-error": "#ffffff",
        "outline-variant": "#bdcaba",
        "on-tertiary-container": "#fdfcff",
        "on-secondary": "#ffffff",
        "background": "#f8f9ff",
        "surface-container": "#e5eeff",
        "on-tertiary": "#ffffff",
        "tertiary-fixed-dim": "#93ccff",
        "surface": "#f8f9ff",
        "error": "#ba1a1a",
        "secondary": "#565e74",
        "inverse-surface": "#213145",
        "on-primary-fixed-variant": "#005320",
        "on-error-container": "#93000a",
        "primary-container": "#00873a",
        "surface-container-highest": "#d3e4fe",
        "primary-fixed-dim": "#62df7d",
        "on-primary-fixed": "#002109",
        "secondary-fixed-dim": "#bec6e0",
        "inverse-primary": "#62df7d",
        "error-container": "#ffdad6",
        "on-secondary-fixed": "#131b2e",
        "on-primary-container": "#f7fff2",
        "on-secondary-fixed-variant": "#3f465c",
        "primary": "#006b2c"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "margin": "1rem",
        "gutter-desktop": "1.5rem",
        "gutter-tablet": "1rem",
        "space-xl": "2rem",
        "margin-desktop": "2rem",
        "margin-tablet": "1.5rem",
        "space-lg": "1.5rem",
        "space-sm": "0.5rem",
        "space-xs": "0.25rem",
        "space-md": "1rem",
        "gutter": "1rem"
      },
      "fontFamily": {
        "body-lg": [
          "Inter"
        ],
        "body-md": [
          "Inter"
        ],
        "label-sm": [
          "Inter"
        ],
        "headline-lg-mobile": [
          "Inter"
        ],
        "title-md": [
          "Inter"
        ],
        "label-lg": [
          "Inter"
        ],
        "headline-md": [
          "Inter"
        ],
        "body-sm": [
          "Inter"
        ],
        "label-md": [
          "Inter"
        ],
        "display": [
          "Inter"
        ],
        "headline-sm": [
          "Inter"
        ],
        "headline-lg": [
          "Inter"
        ],
        "title-lg": [
          "Inter"
        ],
        "title-sm": [
          "Inter"
        ]
      },
      "fontSize": {
        "body-lg": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ],
        "body-md": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "400"
          }
        ],
        "label-sm": [
          "11px",
          {
            "lineHeight": "14px",
            "letterSpacing": "0.03em",
            "fontWeight": "600"
          }
        ],
        "headline-lg-mobile": [
          "24px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.015em",
            "fontWeight": "600"
          }
        ],
        "title-md": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "600"
          }
        ],
        "label-lg": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "500"
          }
        ],
        "headline-md": [
          "24px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.015em",
            "fontWeight": "600"
          }
        ],
        "body-sm": [
          "12px",
          {
            "lineHeight": "18px",
            "fontWeight": "400"
          }
        ],
        "label-md": [
          "12px",
          {
            "lineHeight": "16px",
            "fontWeight": "500"
          }
        ],
        "display": [
          "36px",
          {
            "lineHeight": "44px",
            "letterSpacing": "-0.025em",
            "fontWeight": "700"
          }
        ],
        "headline-sm": [
          "20px",
          {
            "lineHeight": "28px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "headline-lg": [
          "30px",
          {
            "lineHeight": "38px",
            "letterSpacing": "-0.02em",
            "fontWeight": "600"
          }
        ],
        "title-lg": [
          "18px",
          {
            "lineHeight": "26px",
            "letterSpacing": "-0.005em",
            "fontWeight": "600"
          }
        ],
        "title-sm": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "600"
          }
        ]
      }
    }
  },
  plugins: [],
}
