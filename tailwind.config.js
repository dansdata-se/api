/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        outline: "rgba(var(--color-outline), <alpha-value>)",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
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
          primary: "#008395",
          "primary-content": "#FFFFFF",
          secondary: "#48B9C8",
          "secondary-content": "#000000",
          accent: "#D04993",
          "accent-content": "#FFFFFF",
          neutral: "#F8FBFC",
          "neutral-content": "#090909",
          "base-100": "#F8FBFC",
          "base-200": "#F8FBFC",
          "base-300": "#D1E4EB",
          "base-content": "#090909",
          info: "#008395",
          success: "#07C592",
          warning: "#E3B263",
          error: "#B00020",
        },
        dark: {
          primary: "#008395",
          "primary-content": "#EFF9FA",
          secondary: "#48B9C8",
          "secondary-content": "#091213",
          accent: "#D04993",
          "accent-content": "#FFF4FA",
          neutral: "#091215",
          "neutral-content": "#ECECEC",
          "base-100": "#254956",
          "base-200": "#091215",
          "base-300": "#091215",
          "base-content": "#ECECEC",
          info: "#008395",
          success: "#CF6679",
          warning: "#F09D51",
          error: "#CF6679",
        },
      },
    ],
  },
};
