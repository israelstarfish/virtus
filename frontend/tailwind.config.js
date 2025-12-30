//frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
const radix = require("tailwindcss-radix");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        spin: 'spin 1s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-out': 'fadeOut 0.2s ease-in forwards',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        fadeOut: {
          '0%': { opacity: 1, transform: 'scale(1)' },
          '100%': { opacity: 0, transform: 'scale(0.95)' },
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          inter: ['Inter', 'sans-serif'],
          fira: ['Fira Mono', 'monospace'],
        },
      },
      backgroundImage: {
        'login-pattern': "url('/img/1.png')",
        'grid-virtus-600': "url('/grid.svg')",
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxHeight: {
        225: '900px',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate",
      radix(), // ✅ aqui está o plugin do Radix
    )],
};

//frontend/tailwind.config.js

///** @type {import('tailwindcss').Config} */
//module.exports = {
//  content: [
//    "./pages/**/*.{js,ts,jsx,tsx}",
//    "./components/**/*.{js,ts,jsx,tsx}",
//    "./src/**/*.{js,ts,jsx,tsx}",
//    "./frontend/**/*.{js,ts,jsx,tsx}",
//  ],
//  theme: {
//    extend: {
//      animation: {
//        spin: 'spin 1s linear infinite',
//        'fade-in': 'fadeIn 0.3s ease-out forwards',
//        'fade-out': 'fadeOut 0.2s ease-in forwards',
//      },
//      keyframes: {
//        fadeIn: {
//          '0%': { opacity: 0, transform: 'scale(0.95)' },
//          '100%': { opacity: 1, transform: 'scale(1)' },
//        },
//        fadeOut: {
//          '0%': { opacity: 1, transform: 'scale(1)' },
//          '100%': { opacity: 0, transform: 'scale(0.95)' },
//        },
//        fontFamily: {
//          sans: ['Inter', 'sans-serif'],
//          inter: ['Inter', 'sans-serif'],
//          fira: ['Fira Mono', 'monospace'],
//        },
//      },
//      backgroundImage: {
//        'login-pattern': "url('/img/1.png')",
//        'grid-virtus-600': "url('/grid.svg')",
//      },
//      borderRadius: {
//        '4xl': '2rem',
//      },
//      maxHeight: {
//        225: '900px',
//      },
//    },
//  },
//  plugins: [require("tailwindcss-animate")],
//};

///** @type {import('tailwindcss').Config} */
//module.exports = {
//  content: [
//    "./pages/**/*.{js,ts,jsx,tsx}",
//    "./components/**/*.{js,ts,jsx,tsx}",
//    "./src/**/*.{js,ts,jsx,tsx}",
//    "./frontend/**/*.{js,ts,jsx,tsx}",
//  ],
//  theme: {
//    extend: {
//      animation: {
//        spin: 'spin 1s linear infinite',
//        'fade-in': 'fadeIn 1.2s ease-out forwards',
//        'fade-out': 'fadeOut 0.3s ease-in forwards',
//      },
//      keyframes: {
//        fadeIn: {
//          '0%': { opacity: 0, transform: 'translateY(20px)' },
//          '100%': { opacity: 1, transform: 'translateY(0)' },
//        },
//        fadeOut: {
//          '0%': { opacity: 1, transform: 'translateY(0)' },
//          '100%': { opacity: 0, transform: 'translateY(20px)' },
//        },
//      },
//      backgroundImage: {
//        'login-pattern': "url('/img/1.png')",
//        'grid-virtus-600': "url('/grid.svg')",
//      },
//      borderRadius: {
//        '4xl': '2rem',
//      },
//      maxHeight: {
//        225: '900px',
//      },
//    },
//  },
//  plugins: [],
//};


///** @type {import('tailwindcss').Config} */
//module.exports = {
//  content: [
//    "./pages/**/*.{js,ts,jsx,tsx}",
//    "./components/**/*.{js,ts,jsx,tsx}",
//    "./src/**/*.{js,ts,jsx,tsx}",
//    "./frontend/**/*.{js,ts,jsx,tsx}",
//  ],
//  theme: {
//    extend: {
//      animation: {
//        spin: 'spin 1s linear infinite',
//        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
//      },
//      keyframes: {
//        fadeIn: {
//          '0%': { opacity: 0, transform: 'translateY(20px)' },
//          '100%': { opacity: 1, transform: 'translateY(0)' },
//        },
//      },
//      backgroundImage: {
//        'login-pattern': "url('/img/1.png')",
//        'grid-virtus-600': "url('/grid.svg')",
//      },
//      borderRadius: {
//        '4xl': '2rem',
//      },
//      maxHeight: {
//        225: '900px',
//      },
//    },
//  },
//  plugins: [],
//};

//<div className="min-h-screen flex items-center justify-center bg-[url('/img/1.png')] bg-repeat bg-black px-4">
//  {/* conteúdo */}
//</div>
//<div className="max-w-md w-full bg-gray-900 p-8 rounded-xl shadow-xl animate-fade-in">
//  {/* conteúdo */}
//</div>