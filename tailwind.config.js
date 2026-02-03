export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          500: '#2596be',
          600: '#1d7a9c', // Darker shade for hover
        }
      }
    }
  },
}