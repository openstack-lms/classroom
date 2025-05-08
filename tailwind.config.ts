import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Ensure it's set to 'class' instead of 'media'
  content: [
    "./public/**/*.svg",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // Background colors
        background: {
          DEFAULT: 'var(--color-bg-primary)',
          muted: 'var(--color-bg-secondary)',
          subtle: 'var(--color-bg-tertiary)',
          active: 'var(--color-bg-active)',
        },
        // Text colors
        foreground: {
          DEFAULT: 'var(--color-text-primary)',
          muted: 'var(--color-text-secondary)',
          subtle: 'var(--color-text-tertiary)',
        },
        // Border colors
        border: {
          DEFAULT: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
          dark: 'var(--color-border-dark)',
        },
        // Primary brand colors
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
        },
        // Status colors
        success: {
          DEFAULT: 'var(--color-success)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
        },
      },
      boxShadow: {
        'sm': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'DEFAULT': '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'md': '0 2px 4px -1px rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'lg': '0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'xl': '0 8px 8px -4px rgba(0, 0, 0, 0.05), 0 4px 4px -2px rgba(0, 0, 0, 0.03)',
        '2xl': '0 12px 16px -4px rgba(0, 0, 0, 0.08), 0 6px 8px -2px rgba(0, 0, 0, 0.04)',
        'inner': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'none': 'none',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
