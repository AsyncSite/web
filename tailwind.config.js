/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // AsyncSite 브랜드 컬러
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // 우주 테마 컬러
        cosmic: {
          dark: '#0B0F19',
          blue: '#6366F1',
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          gold: '#F59E0B',
        },
        // 기존 11men 컬러 유지
        background: '#000000',
        foreground: '#ffffff',
      },
      fontFamily: {
        // 현재 사용 중인 폰트만 유지
        'poppins': ['Poppins', 'sans-serif'],              // 영어 본문
        'space-grotesk': ['Space Grotesk', 'sans-serif'],  // 타이틀
        'suit': ['SUIT', 'sans-serif'],                    // 한글 본문
        'sans': ['Poppins', 'SUIT', 'sans-serif'],         // 기본 (영어+한글)

        // 특수 용도 (필요시)
        'dunggeun': ['DungGeunMo', 'monospace'],           // 픽셀 폰트
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'shooting-star': 'shootingStar 2s ease-out',
        'twinkle': 'twinkle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
          },
          '50%': {
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)'
          },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shootingStar: {
          '0%': {
            transform: 'translateX(-100vw) translateY(-100vh)',
            opacity: '0'
          },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': {
            transform: 'translateX(100vw) translateY(100vh)',
            opacity: '0'
          },
        },
        twinkle: {
          '0%, 100%': {
            opacity: '0.4',
            transform: 'scale(0.8)',
            filter: 'blur(0.5px)'
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.3)',
            filter: 'blur(0.2px)'
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cosmic-gradient': 'linear-gradient(135deg, #0B0F19 0%, #1E293B 50%, #0F172A 100%)',
      },
    },
  },
  plugins: [],
}
