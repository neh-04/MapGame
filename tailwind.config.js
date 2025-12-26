/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}", // Added components root just in case
        "./**/*.{js,ts,jsx,tsx}", // Catch-all for root files like App.tsx
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
