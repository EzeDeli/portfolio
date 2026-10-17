module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: '#4B0082',
        secondary: '#DDA0DD',
        tertiary: '#7B2CBF',
        violeta: '#5A189A',
        rosa: '#9D4EDD',
        fondo: '#DDA0DD',
      },
      fontFamily: {
        'work-light': ['WorkSans_300Light'],
        'work-medium': ['WorkSans_500Medium'],
        'work-black': ['WorkSans_900Black'],
      },
    },
  },
  plugins: [],
}
