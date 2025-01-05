//const { rgbaColor } = require('react-native-reanimated/lib/typescript/Colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#f4f9eb",
        secondary: {
          DEFAULT: "#FF9C01",
          100: "#FF9001",
          200: "#FF8E01",
        },
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
        gray: {
          DEFAULT: "#001",
          100: "#CDCDE0",
          statusCard: '#98989a'
        },
        green: {
          100: '#dce7d6',
          200: '#c4dbb7',
        },
        blue: {
          100: '#d6e4e6',
          200: '#c3d5d9',
        },
        beige: {
          100: '#e7e1d6',
          200: '#cbbea6',
        },
        red: {
          100: '#cba6b3',
          200: '#af768a',
        },
        orange: {
          100: '#fdb442',
          200: '#f69f2c',
        },
        notFullWhite: '#f2f9f1',
        greend: "#15b182",
        greeny: "#E7E8D1",
        darkgreeny: "#A7BEAE",
        iconGreeny: '#3bc492',
        bleen: '#14c3b9',
      },
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],
      },
    },
  },
  plugins: [],
}

