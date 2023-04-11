/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        outline: "rgba(var(--color-outline), <alpha-value>)",
      },
    },
    fontFamily: {
      brand: ["var(--font-norican)"],
      sans: ["var(--font-roboto-flex)"],
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  safelist: ["swagger-ui"],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#006877",
          secondary: "#006878",
          accent: "#006b58",
          neutral: "#DBE4E7",
          "base-100": "#F8FDFF",
          info: "#006877",
          success: "#006b58",
          warning: "#F3AF12",
          error: "#BA1A1A",
        },
        dark: {
          primary: "#52D7F0",
          secondary: "#53D7F2",
          accent: "#5DDBBC",
          neutral: "#3F484B",
          "base-100": "#001F25",
          info: "#52D7F0",
          success: "#006b58",
          warning: "#FFF5AD",
          error: "#FFB4AB",
        },
      },
    ],
  },
};
