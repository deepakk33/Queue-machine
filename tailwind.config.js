/**
 * Tailwind theme = a direct port of the "Queue" design system tokens
 * (docs/design-prototype/tokens/). Literal values so opacity modifiers work.
 * Neutrals use the warm `stone` ramp; the single accent is dusty `purple`.
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        // Warm stone neutral ramp (0 = white, 50 = app ground)
        stone: {
          0: "#ffffff",
          50: "#faf9f5",
          100: "#f3f1ea",
          200: "#e9e5da",
          300: "#d9d4c6",
          400: "#aaa491",
          500: "#7d776a",
          600: "#5a554b",
          700: "#423e36",
          800: "#2a2722",
          900: "#1b1915",
        },
        // Dusty purple accent ramp
        purple: {
          50: "#f5f2fc",
          100: "#ece5f9",
          200: "#ddd1f3",
          300: "#c4afe9",
          400: "#a98ddb",
          500: "#8f6ccb",
          600: "#7954b4",
          700: "#614293",
        },
        // Status hues — sending (indigo)
        sky: { 50: "#eceafb", 100: "#d8d4f6", 500: "#5a54d6", 600: "#4842bc", 700: "#3a3699" },
        // sent (emerald)
        emerald: { 50: "#e6f4ec", 100: "#c8e8d5", 500: "#2f9e63", 600: "#258052", 700: "#1e6642" },
        // failed (terracotta red)
        red: { 50: "#fbeae6", 100: "#f6d2c9", 500: "#d65440", 600: "#be4332", 700: "#9a3527" },
        // skipped (amber)
        amber: { 50: "#f9efd9", 100: "#f1ddb0", 500: "#c4860f", 600: "#a26d0a", 700: "#815608" },
        // Semantic aliases
        app: "#faf9f5",
        surface: {
          card: "#ffffff",
          sunken: "#f3f1ea",
          hover: "#f3f1ea",
          active: "#e9e5da",
        },
        accent: {
          DEFAULT: "#8f6ccb",
          hover: "#7954b4",
          active: "#614293",
          weak: "#f5f2fc",
          "weak-fg": "#614293",
          fg: "#ffffff",
        },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["10.5px", { lineHeight: "1.4" }],
        xs: ["11.5px", { lineHeight: "1.45" }],
        sm: ["12.5px", { lineHeight: "1.5" }],
        base: ["13.5px", { lineHeight: "1.5" }],
        md: ["15px", { lineHeight: "1.4" }],
        lg: ["17px", { lineHeight: "1.35" }],
        xl: ["19px", { lineHeight: "1.25" }],
        "2xl": ["24px", { lineHeight: "1.2" }],
        "3xl": ["34px", { lineHeight: "1.1" }],
      },
      letterSpacing: {
        tightish: "-0.012em",
        caps: "0.06em",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
        pill: "999px",
      },
      boxShadow: {
        xs: "0 1px 1px rgba(20, 26, 35, 0.04)",
        sm: "0 1px 2px rgba(20, 26, 35, 0.06), 0 1px 1px rgba(20, 26, 35, 0.04)",
        md: "0 4px 12px rgba(20, 26, 35, 0.09), 0 1px 3px rgba(20, 26, 35, 0.06)",
        lg: "0 12px 28px rgba(20, 26, 35, 0.16), 0 4px 10px rgba(20, 26, 35, 0.08)",
        focus: "0 0 0 3px rgba(143, 108, 203, 0.34)",
      },
      spacing: {
        panel: "360px",
      },
      keyframes: {
        "dmq-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.7)" },
        },
        "dmq-pop": {
          from: { opacity: "0", transform: "translateY(6px) scale(0.98)" },
          to: { opacity: "1", transform: "none" },
        },
        "dmq-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "dmq-pulse": "dmq-pulse 1.4s cubic-bezier(0.45, 0, 0.2, 1) infinite",
        "dmq-pop": "dmq-pop 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        "dmq-fade": "dmq-fade 180ms cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
