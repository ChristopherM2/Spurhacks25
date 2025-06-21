/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // 👈 this is mandatory for class-based toggling
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
