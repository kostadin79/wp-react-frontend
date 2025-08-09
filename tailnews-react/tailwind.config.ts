import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          50:  '#f8f8f8',
          100: '#efefef',
          200:  '#cccccc',
          300:  '#b6b6b6',
          400:  '#d9d9d9',
          500:  '#7d7d7d',
          600:  '#686465',
          700:  '#4d4948',
          800:  '#323232',
          900:  '#1c1c1c'
        },
        red: {
          600: '#ce2626',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      maxHeight: {
        '98': '24.3rem',
      },
      borderWidth: {
        '3': '3px',
      },
      textShadow: {
        'white': '1px 1px #fff',
        'black': '1px 1px #000',
      },
      backgroundImage: {
        'gradient-cover': 'linear-gradient(transparent, rgba(0,0,0,0.92))',
        'gradient-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
      },
      spacing: {
        '0.125': '0.125rem',
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'slide-in-right': {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
    },
    fontFamily: {
      sans: ['Roboto', 'sans-serif']
    },
  },
  plugins: [
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.text-shadow-white': {
          textShadow: '1px 1px #fff',
        },
        '.text-shadow-black': {
          textShadow: '1px 1px #000',
        },
        '.bg-gradient-cover': {
          backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.92))',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
};

export default config;