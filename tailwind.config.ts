import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['Lato', 'sans-serif'],
        festive: ['"Mountains of Christmas"', 'cursive'],
      },
      colors: {
        nordic: {
          dark: '#1a2e35',
          blue: '#2c4c5a',
          red: '#c0392b',
          gold: '#f1c40f',
          snow: '#ecf0f1',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;