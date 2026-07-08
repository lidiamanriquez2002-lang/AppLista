/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B1C3F",
        inksoft: "#5E608F",
        paper: "#F3F4FC",
        card: "#FFFFFF",
        line: "#E4E6F5",
        primary: "#5B5BE9",
        primarydeep: "#4438CA",
        violet: "#8C4FF0",
        ok: "#10B77F",
        okdeep: "#0B9268",
        okbg: "#E4F8F0",
        bad: "#F04458",
        badbg: "#FEEBEE",
        amber: "#F79009",
        amberbg: "#FEF3E2",
        teal: "#0EA5C6",
        tealbg: "#E3F6FB"
      },
      boxShadow: {
        card: "0 10px 34px rgba(27,28,63,0.10)",
        soft: "0 4px 16px rgba(27,28,63,0.07)",
        primary: "0 10px 24px rgba(91,91,233,0.35)",
        ok: "0 10px 24px rgba(16,183,127,0.35)"
      },
      borderRadius: { xl2: "1.35rem", xl3: "1.75rem" }
    }
  },
  plugins: []
};
