import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict Material 3 Design System Tokens (Seed Primary: #CB0021)
        m3: {
          primary: "var(--md-sys-color-primary)",
          "primary-text": "var(--md-sys-color-primary-text)",
          "on-primary": "var(--md-sys-color-on-primary)",
          "primary-container": "var(--md-sys-color-primary-container)",
          "on-primary-container": "var(--md-sys-color-on-primary-container)",
          secondary: "var(--md-sys-color-secondary)",
          "on-secondary": "var(--md-sys-color-on-secondary)",
          "secondary-container": "var(--md-sys-color-secondary-container)",
          "on-secondary-container": "var(--md-sys-color-on-secondary-container)",
          tertiary: "var(--md-sys-color-tertiary)",
          "on-tertiary": "var(--md-sys-color-on-tertiary)",
          "tertiary-container": "var(--md-sys-color-tertiary-container)",
          "on-tertiary-container": "var(--md-sys-color-on-tertiary-container)",
          error: "var(--md-sys-color-error)",
          "on-error": "var(--md-sys-color-on-error)",
          "error-container": "var(--md-sys-color-error-container)",
          "on-error-container": "var(--md-sys-color-on-error-container)",
          background: "var(--md-sys-color-background)",
          "on-background": "var(--md-sys-color-on-background)",
          surface: "var(--md-sys-color-surface)",
          "surface-dim": "var(--md-sys-color-surface-dim)",
          "surface-bright": "var(--md-sys-color-surface-bright)",
          "surface-container-lowest": "var(--md-sys-color-surface-container-lowest)",
          "surface-container-low": "var(--md-sys-color-surface-container-low)",
          "surface-container": "var(--md-sys-color-surface-container)",
          "surface-container-high": "var(--md-sys-color-surface-container-high)",
          "surface-container-highest": "var(--md-sys-color-surface-container-highest)",
          "on-surface": "var(--md-sys-color-on-surface)",
          "on-surface-variant": "var(--md-sys-color-on-surface-variant)",
          outline: "var(--md-sys-color-outline)",
          "outline-variant": "var(--md-sys-color-outline-variant)",
          "inverse-surface": "var(--md-sys-color-inverse-surface)",
          "inverse-on-surface": "var(--md-sys-color-inverse-on-surface)",
        },
        border: "var(--md-sys-color-outline-variant)",
        input: "var(--md-sys-color-outline)",
        ring: "var(--md-sys-color-primary)",
        background: "var(--md-sys-color-background)",
        foreground: "var(--md-sys-color-on-background)",
        primary: {
          DEFAULT: "var(--md-sys-color-primary)",
          foreground: "var(--md-sys-color-on-primary)",
        },
        secondary: {
          DEFAULT: "var(--md-sys-color-secondary-container)",
          foreground: "var(--md-sys-color-on-secondary-container)",
        },
        destructive: {
          DEFAULT: "var(--md-sys-color-error)",
          foreground: "var(--md-sys-color-on-error)",
        },
        muted: {
          DEFAULT: "var(--md-sys-color-surface-container-high)",
          foreground: "var(--md-sys-color-on-surface-variant)",
        },
        accent: {
          DEFAULT: "var(--md-sys-color-primary-container)",
          foreground: "var(--md-sys-color-on-primary-container)",
        },
        popover: {
          DEFAULT: "var(--md-sys-color-surface-container-high)",
          foreground: "var(--md-sys-color-on-surface)",
        },
        card: {
          DEFAULT: "var(--md-sys-color-surface-container)",
          foreground: "var(--md-sys-color-on-surface)",
        },
      },
      borderRadius: {
        "m3-xs": "4px",
        "m3-sm": "8px",
        "m3-md": "12px",
        "m3-lg": "16px",
        "m3-xl": "28px",
        "m3-full": "9999px",
      },
      boxShadow: {
        "m3-1": "var(--md-sys-elevation-1)",
        "m3-2": "var(--md-sys-elevation-2)",
        "m3-3": "var(--md-sys-elevation-3)",
      },
    },
  },
  plugins: [],
};

export default config;
