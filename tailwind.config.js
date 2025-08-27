/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './themes/landing-grid/templates/**/*.html',
    './content/**/*.md',
    './themes/landing-grid/static/js/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'brand': {
          'primary': '#667eea',
          'secondary': '#764ba2',
          'accent': '#f093fb',
        },
        'glass': {
          'light': 'rgba(255, 255, 255, 0.1)',
          'dark': 'rgba(0, 0, 0, 0.2)',
          'border': 'rgba(255, 255, 255, 0.2)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out', 
        'scale-in': 'scaleIn 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.9)' },
          'to': { opacity: '1', transform: 'scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      backdropBlur: {
        'xs': '2px',
        'xl': '24px',
        '2xl': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
        'glow': '0 0 20px rgba(102, 126, 234, 0.3)',
        'glow-strong': '0 0 40px rgba(102, 126, 234, 0.5)',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}