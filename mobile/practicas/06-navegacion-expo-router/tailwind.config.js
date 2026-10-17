module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: '#3B1296',
        secondary: '#E8245C',
        tertiary: '#8E1C72',
        violeta: '#9322B3',
        rosa: '#D12FBF',
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
