import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core EcoVibe Palette & Material 3 Design Tokens
        ecovibe: {
          purple: {
            DEFAULT: "#5101be",
            deep: "#12002b",
            surface: "#1b0240",
            container: "#2a0463",
            elevated: "#380582",
            bright: "#7c3aed",
            muted: "#c4b5fd",
          },
          red: {
            DEFAULT: "#A8002D",
            accent: "#AB1E2C",
            hover: "#c91442",
            container: "#4a0014",
            soft: "#ff859d",
          },
        },
        // Material 3 semantic token mappings
        m3: {
          surface: "var(--md-sys-color-surface)",
          "surface-dim": "var(--md-sys-color-surface-dim)",
          "surface-container-lowest": "var(--md-sys-color-surface-container-lowest)",
          "surface-container-low": "var(--md-sys-color-surface-container-low)",
          "surface-container": "var(--md-sys-color-surface-container)",
          "surface-container-high": "var(--md-sys-color-surface-container-high)",
          "surface-container-highest": "var(--md-sys-color-surface-container-highest)",
          "on-surface": "var(--md-sys-color-on-surface)",
          "on-surface-variant": "var(--md-sys-color-on-surface-variant)",
          primary: "var(--md-sys-color-primary)",
          "on-primary": "var(--md-sys-color-on-primary)",
          "primary-container": "var(--md-sys-color-primary-container)",
          "on-primary-container": "var(--md-sys-color-on-primary-container)",
          secondary: "var(--md-sys-color-secondary)",
          "secondary-container": "var(--md-sys-color-secondary-container)",
          tertiary: "var(--md-sys-color-tertiary)",
          outline: "var(--md-sys-color-outline)",
          "outline-variant": "var(--md-sys-color-outline-variant)",
          error: "var(--md-sys-color-error)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        "m3-xs": "4px",
        "m3-sm": "8px",
        "m3-md": "12px",
        "m3-lg": "16px",
        "m3-xl": "28px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "m3-1": "0 1px 3px 1px rgba(0, 0, 0, 0.35), 0 1px 2px 0 rgba(0, 0, 0, 0.5)",
        "m3-2": "0 2px 6px 2px rgba(0, 0, 0, 0.35), 0 1px 2px 0 rgba(0, 0, 0, 0.5)",
        "m3-3": "0 4px 12px 3px rgba(168, 0, 45, 0.25), 0 1px 3px 0 rgba(0, 0, 0, 0.5)",
        "glow-purple": "0 0 35px -5px rgba(81, 1, 190, 0.65)",
        "glow-red": "0 0 28px -4px rgba(168, 0, 45, 0.7)",
      },
    },
  },
  plugins: [],
};

export default config;
